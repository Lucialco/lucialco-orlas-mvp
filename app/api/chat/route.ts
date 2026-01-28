import { NextResponse } from "next/server";
import { calcQuote } from "../../../lib/pricing";

export const runtime = "nodejs";
const WHATSAPP = "https://wa.me/34606849914";

function extractAlumnos(text: string): number | null {
  const m = text.match(/(\d{1,4})/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function detectTipo(text: string): "plantilla" | "exclusiva" | null {
  if (/exclusiv/i.test(text)) return "exclusiva";
  if (/plantill/i.test(text)) return "plantilla";
  return null;
}

function detectQuoteIntent(text: string): boolean {
  return (
    /(presupuesto|precio|cu[aá]nto cuesta|cu[aá]nto vale|coste)/i.test(text) &&
    /(orla|alumn|niñ|estudiant)/i.test(text)
  );
}

async function callOpenAI(history: { role: "user" | "assistant"; content: string }[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const system = {
    role: "system" as const,
    content: `
Eres el asistente de Lucialco Orlas.
Tono: español natural, profesional y cercano (sin jerga).
Reglas:
- Usa el historial para mantener el contexto.
- No repitas el saludo ni la lista de servicios en cada respuesta.
- Si falta información, pregunta 1–2 datos concretos.
- Si no puedes confirmarlo, deriva a WhatsApp: ${WHATSAPP}.
`,
  };

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [system, ...history],
    }),
  });

  if (!r.ok) return null;

  const data = await r.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incoming = Array.isArray(body?.messages) ? body.messages : [];

    const lastUser =
      [...incoming].reverse().find((m: any) => m?.role === "user")?.content || "";

    // 1) Presupuestos determinísticos (sin IA)
    if (detectQuoteIntent(lastUser) || /presupuesto/i.test(lastUser)) {
      const alumnos = extractAlumnos(lastUser);
      if (!alumnos) {
        return NextResponse.json({ text: "Perfecto. ¿Para cuántos alumnos es la orla?" });
      }

      const extras = {
        beca: /beca/i.test(lastUser),
        taza: /taza/i.test(lastUser),
        sobre: /sobre/i.test(lastUser),
      };

      const tipo = detectTipo(lastUser);

      if (!tipo) {
        const p = calcQuote({ alumnos, tipo: "plantilla", extras: {} });
        const e = calcQuote({ alumnos, tipo: "exclusiva", extras: {} });

        return NextResponse.json({
          text:
            `Para ${alumnos} alumnos (IVA incluido):\n` +
            `• Plantilla: ${p.total.toFixed(2)} €\n` +
            `• Exclusiva: ${e.total.toFixed(2)} €\n\n` +
            `¿Cuál prefieres?`,
        });
      }

      const q = calcQuote({ alumnos, tipo, extras });

      return NextResponse.json({
        text:
          `Total estimado: ${q.total.toFixed(2)} € (IVA incluido).\n` +
          `¿Quieres añadir algún extra (beca, taza o sobre)?`,
      });
    }

    // 2) IA con historial (conversación normal)
    const history = incoming
      .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
      .slice(-12)
      .map((m: any) => ({ role: m.role, content: m.content }));

    const ai = await callOpenAI(history);

    if (!ai) {
      return NextResponse.json({
        text: `Ahora mismo no puedo responder desde la web. WhatsApp: ${WHATSAPP}`,
      });
    }

    return NextResponse.json({ text: ai });
  } catch {
    return NextResponse.json({
      text: `Error procesando la consulta. WhatsApp: ${WHATSAPP}`,
    });
  }
}

