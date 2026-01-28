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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUser =
      [...messages].reverse().find((m: any) => m?.role === "user")?.content || "";

    // Respuesta base si no pide presupuesto
    if (!detectQuoteIntent(lastUser)) {
      return NextResponse.json({
        text:
          "Hola. ¿En qué puedo ayudarte?\n" +
          "Puedo preparar un presupuesto (ej: “presupuesto orla 30 alumnos”) o derivarte a WhatsApp si hace falta.\n" +
          `WhatsApp: ${WHATSAPP}`,
      });
    }

    // Presupuesto
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

    // Si no especifica tipo, damos ambas opciones
    if (!tipo) {
      const p = calcQuote({ alumnos, tipo: "plantilla", extras: {} });
      const e = calcQuote({ alumnos, tipo: "exclusiva", extras: {} });

      return NextResponse.json({
        text:
          `Para ${alumnos} alumnos, sin extras (con IVA):\n` +
          `- Plantilla: ${p.total.toFixed(2)} €\n` +
          `- Exclusiva: ${e.total.toFixed(2)} €\n\n` +
          "¿Cuál prefieres? Si me indicas extras (beca, taza, sobre), lo ajusto.",
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
  } catch {
    return NextResponse.json({
      text: `Ha ocurrido un error. WhatsApp: ${WHATSAPP}`,
    });
  }
}
