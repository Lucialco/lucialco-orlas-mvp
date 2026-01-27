import { NextResponse } from "next/server";
import { retrieveContext } from "../../../lib/rag";
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
  return /(presupuesto|precio|cu[aá]nto cuesta|cu[aá]nto vale|coste)/i.test(text)
    && /(orla|alumn|niñ|estudiant)/i.test(text);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUser =
      [...messages].reverse().find((m: any) => m?.role === "user")?.content || "";

    // ✅ 1) PRESUPUESTOS (NO dependen de OpenAI)
    if (detectQuoteIntent(lastUser)) {
      const alumnos = extractAlumnos(lastUser);
      if (!alumnos) {
        return NextResponse.json({ text: "De acuerdo. ¿Para cuántos alumnos es la orla?" });
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
            `Para ${alumnos} alumnos, sin extras (con IVA):\n` +
            `- Plantilla: ${p.total.toFixed(2)} €\n` +
            `- Exclusiva: ${e.total.toFixed(2)} €\n\n` +
            `¿Cuál prefieres? Si me dices extras (beca, taza, sobre) lo ajusto.`,
        });
      }

      const q = calcQuote({ alumnos, tipo, extras });

      return NextResponse.json({
        text:
          `Presupuesto estimado (con IVA):\n` +
          `- Alumnos: ${q.alumnos}\n` +
          `- Tipo: ${q.tipo}\n` +
          `- TOTAL: ${q.total.toFixed(2)} €\n\n` +
          `Si quieres, lo gestionamos por WhatsApp: ${WHATSAPP}`,
      });
    }

    // ✅ 2) DUDAS (intenta RAG + IA si hay key)
    const { context } = await retrieveContext(lastUser, 6);

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      // Sin IA -> respuesta controlada
      if (!context) {
        return NextResponse.json({
          text:
            `No dispongo de esa información confirmada ahora mismo.\n` +
            `Si quieres, lo revisamos por WhatsApp: ${WHATSAPP}`,
        });
      }
      return NextResponse.json({
        text:
          `He encontrado información relacionada, pero para confirmarlo prefiero revisarlo contigo.\n` +
          `WhatsApp: ${WHATSAPP}\n\n` +
          `Resumen:\n${context.slice(0, 700)}`,
      });
    }

    if (!context) {
      return NextResponse.json({
        text:
          `No dispongo de esa información confirmada en este momento.\n` +
          `WhatsApp: ${WHATSAPP}`,
      });
    }

    const input = [
      {
        role: "system",
        content:
          `Eres el asistente de Lucialco Orlas.\n` +
          `Estilo: español natural y profesional, sin jerga.\n` +
          `Reglas: responde SOLO con el contexto. Si falta un dato, pregunta 1-2 cosas concretas. Si no puedes confirmarlo, deriva a WhatsApp (${WHATSAPP}).`,
      },
      { role: "user", content: `Pregunta: ${lastUser}\n\nContexto:\n${context}` },
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
      return NextResponse.json({
        text: `Ahora mismo no puedo completar la respuesta desde la web. WhatsApp: ${WHATSAPP}`,
      });
    }

    const data = await r.json();
    return NextResponse.json({
      text: data.output_text || `WhatsApp: ${WHATSAPP}`,
    });
  } catch {
    return NextResponse.json({
      text: `Ha ocurrido un error al procesar tu consulta. WhatsApp: ${WHATSAPP}`,
    });
  }
}
