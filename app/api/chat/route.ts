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
  return /(presupuesto|precio|cu[aá]nto cuesta|cu[aá]nto vale|coste)/i.test(text) &&
    /(orla|alumn|niñ|estudiant)/i.test(text);
}

async function callOpenAI(text: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            `Eres el asistente de Lucialco Orlas.\n` +
            `Tono: español natural, profesional y amable.\n` +
            `Reglas:\n` +
            `- Si te saludan, saluda y pregunta en qué puedes ayudar.\n` +
            `- Si falta información para responder, pregunta 1-2 datos concretos.\n` +
            `- Si no puedes confirmarlo, deriva a WhatsApp: ${WHATSAPP}.\n` +
            `- No uses jerga tipo “se me va la pinza”.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.2,
    }),
  });

  if (!r.ok) return null;
  const data = await r.json();
  return data?.choices?.[0]?.message?.content || null;
}

function fallbackWelcome() {
  return (
    "Hola 😊 Soy el asistente de Lucialco Orlas.\n\n" +
    "Puedo ayudarte con:\n" +
    "• presupuestos\n" +
    "• proceso de fotos\n" +
    "• tipos de orla\n" +
    "• extras\n" +
    "• plazos\n\n" +
    "¿Qué necesitas?"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUser =
      [...messages].reverse().find((m: any) => m?.role === "user")?.content || "";

    const text = String(lastUser || "").trim();

    // Presupuestos locales
    if (detectQuoteIntent(text)) {
      const alumnos = extractAlumnos(text);
      if (!alumnos) {
        return NextResponse.json({ text: "De acuerdo. ¿Para cuántos alumnos es la orla?" });
      }

      const extras = {
        beca: /beca/i.test(text),
        taza: /taza/i.test(text),
        sobre: /sobre/i.test(text),
      };

      const tipo = detectTipo(text);

      if (!tipo) {
        const p = calcQuote({ alumnos, tipo: "plantilla", extras: {} });
        const e = calcQuote({ alumnos, tipo: "exclusiva", extras: {} });

        return NextResponse.json({
          text:
            `Para ${alumnos} alumnos (IVA incluido):\n` +
            `- Plantilla: ${p.total.toFixed(2)} €\n` +
            `- Exclusiva: ${e.total.toFixed(2)} €\n\n` +
            "¿Cuál prefieres?",
        });
      }

      const q = calcQuote({ alumnos, tipo, extras });

      return NextResponse.json({
        text:
          `TOTAL estimado: ${q.total.toFixed(2)} € (IVA incluido)\n\n` +
          `Si quieres, lo gestionamos por WhatsApp: ${WHATSAPP}`,
      });
    }

    // Si es saludo o mensaje corto, damos bienvenida directa (sin IA)
    if (!text || /^hola\b|^buenas\b|^hello\b|^hi\b/i.test(text)) {
      return NextResponse.json({ text: fallbackWelcome() });
    }

    // IA para resto
    const ai = await callOpenAI(text);

    if (!ai) {
      return NextResponse.json({ text: fallbackWelcome() });
    }

    return NextResponse.json({ text: ai });
  } catch {
    return NextResponse.json({ text: fallbackWelcome() });
  }
}
