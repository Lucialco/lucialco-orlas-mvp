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
  return /(presupuesto|precio|cu[aá]nto cuesta|cu[aá]nto vale|coste)/i.test(text);
}

function wantsPrintStuff(text: string): boolean {
  // Cualquier cosa de impresión/copia/tamaño/papel => no inventamos, WhatsApp
  return /(impres|imprim|papel|mate|brillo|a3|a4|tamañ|copias?|env[ií]o|entrega)/i.test(text);
}

function isGreeting(text: string): boolean {
  return /^(hola|buenas|hey|hello|hi)\b/i.test(text.trim());
}

function whatsappText() {
  return `WhatsApp: ${WHATSAPP}`;
}

async function callOpenAI(history: { role: "user" | "assistant"; content: string }[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const system = {
    role: "system" as const,
    content:
      `Eres el asistente de Lucialco Orlas.\n` +
      `Tono: español profesional, natural y amable.\n\n` +
      `REGLAS IMPORTANTES:\n` +
      `- NO inventes precios, tamaños, papel, envíos ni plazos.\n` +
      `- NO digas "te lo envío por WhatsApp". Solo ofrece el enlace: ${WHATSAPP}\n` +
      `- Para presupuestos: tu objetivo es obtener SOLO estos datos:\n` +
      `  1) nº de alumnos\n` +
      `  2) tipo: plantilla o exclusiva\n` +
      `  3) extras: beca, taza, sobre (sí/no)\n` +
      `- Si te preguntan por impresión/copias/tamaño/papel, di que se confirma por WhatsApp.\n` +
      `- Haz preguntas cortas (1-2 máximo) y guía.\n`,
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
    const text = String(lastUser || "").trim();

    // Saludo humano
    if (!text || isGreeting(text)) {
      return NextResponse.json({
        text:
          "Hola 😊 Soy el asistente de Lucialco Orlas.\n\n" +
          "Puedo ayudarte con presupuestos y dudas del proceso.\n" +
          "Si quieres presupuesto, dime: nº de alumnos y si prefieres plantilla o diseño exclusivo.",
      });
    }

    // Si hablan de impresión/copia/tamaño/papel => NO inventar
    if (wantsPrintStuff(text)) {
      return NextResponse.json({
        text:
          "Perfecto. Los detalles de impresión (copias, tamaño, papel, entrega) los confirmamos por WhatsApp para ajustarlo bien.\n" +
          whatsappText(),
      });
    }

    // Presupuesto: lo hacemos determinista con calcQuote
    if (detectQuoteIntent(text) || /presupuesto/i.test(text)) {
      const alumnos = extractAlumnos(text);
      if (!alumnos) {
        return NextResponse.json({ text: "Perfecto. ¿Para cuántos alumnos es la orla?" });
      }

      const tipo = detectTipo(text);
      if (!tipo) {
        const p = calcQuote({ alumnos, tipo: "plantilla", extras: {} });
        const e = calcQuote({ alumnos, tipo: "exclusiva", extras: {} });

        return NextResponse.json({
          text:
            `Para ${alumnos} alumnos (IVA incluido), sin extras:\n` +
            `• Plantilla: ${p.total.toFixed(2)} €\n` +
            `• Exclusiva: ${e.total.toFixed(2)} €\n\n` +
            `¿Cuál prefieres: plantilla o exclusiva?`,
        });
      }

      const extras = {
        beca: /beca/i.test(text),
        taza: /taza/i.test(text),
        sobre: /sobre/i.test(text),
      };

      const q = calcQuote({ alumnos, tipo, extras });

      const extrasList: string[] = [];
      if (extras.beca) extrasList.push("beca");
      if (extras.taza) extrasList.push("taza");
      if (extras.sobre) extrasList.push("sobre");

      return NextResponse.json({
        text:
          `Presupuesto estimado (IVA incluido): ${q.total.toFixed(2)} €\n` +
          `• Alumnos: ${q.alumnos}\n` +
          `• Tipo: ${q.tipo}\n` +
          `• Extras: ${extrasList.length ? extrasList.join(", ") : "ninguno"}\n\n` +
          `¿Quieres añadir algún extra? (beca, taza, sobre)`,
      });
    }

    // IA para dudas generales, pero con reglas anti-invento
    const history = incoming
      .filter(
        (m: any) =>
          (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string"
      )
      .slice(-10)
      .map((m: any) => ({ role: m.role, content: m.content }));

    const ai = await callOpenAI(history);

    if (!ai) {
      return NextResponse.json({
        text:
          "Ahora mismo no puedo responder desde la web.\n" +
          whatsappText(),
      });
    }

    return NextResponse.json({ text: ai });
  } catch {
    return NextResponse.json({
      text:
        "Ha ocurrido un error procesando la consulta.\n" +
        whatsappText(),
    });
  }
}

