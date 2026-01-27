import { NextResponse } from "next/server";

// ✅ 3 niveles hacia arriba desde app/api/chat/route.ts
import { retrieveContext } from "../../../lib/rag";
import { calcQuote } from "../../../lib/pricing";

export const runtime = "nodejs";

function tryParseQuote(
  text: string
): {
  alumnos: number;
  tipo: "plantilla" | "exclusiva";
  extras: { beca: boolean; taza: boolean; sobre: boolean };
} | null {
  const alumnosMatch = text.match(/(\d{1,4})/);
  const alumnos = alumnosMatch ? parseInt(alumnosMatch[1], 10) : 0;

  const tipo: "plantilla" | "exclusiva" | null =
    /exclusiv/i.test(text)
      ? "exclusiva"
      : /plantill/i.test(text)
      ? "plantilla"
      : null;

  const extras = {
    beca: /beca/i.test(text),
    taza: /taza/i.test(text),
    sobre: /sobre/i.test(text),
  };

  if (!alumnos || !tipo) return null;
  return { alumnos, tipo, extras };
}

export async function POST(req: Request) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const lastUser =
      [...messages].reverse().find((m: any) => m?.role === "user")?.content ||
      "";

    // 1) Presupuesto -> cálculo determinista
    const quoteReq = tryParseQuote(lastUser);
    if (quoteReq) {
      const q = calcQuote(quoteReq);

      const text =
        `📊 Presupuesto estimado (con IVA):\n` +
        `- Alumnos: ${q.alumnos}\n` +
        `- Tipo: ${q.tipo}\n` +
        `- Base: ${q.base.toFixed(2)} €\n` +
        `- Extras: ${q.extrasTotal.toFixed(2)} €\n` +
        `- Subtotal: ${q.subtotal.toFixed(2)} €\n` +
        `- IVA: ${q.iva.toFixed(2)} €\n` +
        `- TOTAL: ${q.total.toFixed(2)} €\n\n` +
        `Si quieres lo pasamos a WhatsApp 👉 https://wa.me/34606849914`;

      return NextResponse.json({ text });
    }

    // 2) Consulta -> RAG
    const { context } = await retrieveContext(lastUser, 6);

    const system = `
Eres el asistente de Lucialco Orlas.
Reglas:
- Responde SOLO usando el contexto.
- Si no hay contexto útil, di: "No lo tengo confirmado" y deriva a WhatsApp.
- No inventes precios ni condiciones.
- Sé claro y breve.
WhatsApp: https://wa.me/34606849914
`;

    const input = [
      { role: "system", content: system },
      {
        role: "user",
        content: `Pregunta: ${lastUser}\n\nContexto:\n${context || "[VACÍO]"}`,
      },
    ];

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input,
        temperature: 0.2,
      }),
    });

    if (!r.ok) {
      return NextResponse.json({ error: await r.text() }, { status: 500 });
    }

    const data = await r.json();
    const text =
      data.output_text ||
      "No lo tengo confirmado. ¿Lo vemos por WhatsApp? https://wa.me/34606849914";

    return NextResponse.json({ text });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error interno" },
      { status: 500 }
    );
  }
}
