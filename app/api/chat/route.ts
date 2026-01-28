import { NextResponse } from "next/server";
import { calcQuote } from "../../../lib/pricing";

export const runtime = "nodejs";
const WHATSAPP = "https://wa.me/34606849914";

/* ----------------- Utils ----------------- */

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

/* ----------------- OpenAI ----------------- */

async function callOpenAI(text: string, firstMessage = false) {
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
          content: `
Eres el asistente de Lucialco Orlas.

Reglas:
- Español profesional y natural.
- NO repitas mensajes de bienvenida.
- Responde directamente.
- Si piden presupuesto, pregunta alumnos y extras.
- Si preguntan por fotos, explica cómo deben hacerse.
- Si no hay datos suficientes, pide solo lo necesario.
- Si no puedes ayudar, deriva a WhatsApp.

Solo saluda si es el primer mensaje.
          `,
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

/* ----------------- API ----------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const lastUser =
      [...messages].reverse().find((m: any) => m?.role === "user")?.content || "";

    const isFirstUserMessage =
      messages.filter((m: any) => m.role === "user").length <= 1;

    /* ---------- Presupuestos locales ---------- */

    if (detectQuoteIntent(lastUser)) {
      const alumnos = extractAlumnos(lastUser);

      if (!alumnos) {
        return NextResponse.json({
          text: "Perfecto. ¿Para cuántos alumnos es la orla?",
        });
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
          `Presupuesto estimado:\n` +
          `• Alumnos: ${q.alumnos}\n` +
          `• Tipo: ${q.tipo}\n` +
          `• TOTAL: ${q.total.toFixed(2)} € (IVA incluido)\n\n` +
          `Si quieres seguirlo por WhatsApp: ${WHATSAPP}`,
      });
    }

    /* ---------- IA ---------- */

    const ai = await callOpenAI(lastUser, isFirstUserMessage);

    if (!ai) {
      return NextResponse.json({
        text:
          "Ahora mismo no puedo responder desde la web.\n" +
          `WhatsApp: ${WHATSAPP}`,
      });
    }

    return NextResponse.json({ text: ai });
  } catch {
    return NextResponse.json({
      text: `Error procesando la consulta. WhatsApp: ${WHATSAPP}`,
    });
  }
}

