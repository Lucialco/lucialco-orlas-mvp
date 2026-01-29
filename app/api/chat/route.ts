import { NextResponse } from "next/server";
import { calcQuote } from "../../../lib/pricing";

export const runtime = "nodejs";

const WHATSAPP = "https://wa.me/34606849914";

// ---------- helpers ----------

function getLastUser(messages: any[]) {
  return [...messages]
    .reverse()
    .find((m) => m?.role === "user")?.content || "";
}

function extractNumber(text: string): number | null {
  const m = text.match(/(\d{1,4})/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

function detectProvincia(text: string): "madrid_toledo" | "otra" | null {
  if (/madrid|toledo/i.test(text)) return "madrid_toledo";
  if (/cuenca|valencia|sevilla|barcelona|bilbao|zaragoza|murcia|alicante|otra/i.test(text))
    return "otra";
  return null;
}

function detectTipo(text: string): "plantilla" | "exclusiva" | null {
  if (/exclusiv/i.test(text)) return "exclusiva";
  if (/plantill/i.test(text)) return "plantilla";
  return null;
}

function detectQuoteIntent(text: string) {
  return /(presupuesto|precio|cu[aá]nto|coste)/i.test(text);
}

function wantsPhotosGuide(text: string) {
  return /(fotos|cómo hacer fotos|manual fotos)/i.test(text);
}

function wantsSendGuide(text: string) {
  return /(enviar|wetransfer|mandar fotos)/i.test(text);
}

// ---------- OPENAI ----------

async function callAI(text: string) {
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
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `
Eres el asistente de Lucialco Orlas.

REGLAS:
- SOLO puedes usar información real del negocio.
- NO inventes acabados, tamaños ni productos.
- Para presupuestos: pregunta primero PROVINCIA.
- Si no tienes dato → deriva a WhatsApp.
- Estilo natural y profesional.
`,
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!r.ok) return null;

  const data = await r.json();
  return data?.choices?.[0]?.message?.content || null;
}

// ---------- ROUTE ----------

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const lastUser = getLastUser(messages);

    // 📸 MANUAL FOTOS
    if (wantsPhotosGuide(lastUser)) {
      return NextResponse.json({
        text:
          "Si el colegio está fuera de Madrid o Toledo, os facilitamos una guía completa para hacer las fotos correctamente.\n\n" +
          "Incluye vestimenta, fondo, distancia, iluminación y cómo identificarlas.\n\n" +
          `Si quieres que Lucía te la explique paso a paso → WhatsApp: ${WHATSAPP}`,
      });
    }

    // 📦 ENVÍO
    if (wantsSendGuide(lastUser)) {
      return NextResponse.json({
        text:
          "Las fotos se envían por WeTransfer al email fotos@lucialco.com.\n\n" +
          "Si lo prefieres, Lucía puede ayudarte personalmente con el envío:\n" +
          WHATSAPP,
      });
    }

    // 💰 PRESUPUESTOS
    if (detectQuoteIntent(lastUser)) {
      const alumnos = extractNumber(lastUser);
      const provincia = detectProvincia(lastUser);
      const tipo = detectTipo(lastUser);

      if (!provincia) {
        return NextResponse.json({
          text:
            "Para calcular el presupuesto necesito primero la provincia.\n\n" +
            "👉 ¿El colegio está en Madrid/Toledo o en otra provincia?",
        });
      }

      if (!alumnos) {
        return NextResponse.json({
          text: "¿Para cuántos alumnos sería la orla?",
        });
      }

      if (!tipo) {
        return NextResponse.json({
          text:
            "¿Prefieres una orla:\n" +
            "- Plantilla (prediseñada)\n" +
            "- Exclusiva (diseño desde cero)?",
        });
      }

      // ---------- TARIFAS ----------

      let precioUnitario = 0;
      let transporte = 0;

      if (provincia === "madrid_toledo") {
        precioUnitario = tipo === "exclusiva" ? 15 : 11.5;
      } else {
        precioUnitario = tipo === "exclusiva" ? 10.5 : 9;
        transporte = 15;
      }

      const base = alumnos * precioUnitario;
      const subtotal = base + transporte;
      const iva = subtotal * 0.21;
      const total = subtotal + iva;

      return NextResponse.json({
        text:
          `📋 Presupuesto estimado:\n\n` +
          `Alumnos: ${alumnos}\n` +
          `Provincia: ${provincia === "madrid_toledo" ? "Madrid/Toledo" : "Otra"}\n` +
          `Tipo: ${tipo}\n` +
          `Precio por alumno: ${precioUnitario.toFixed(2)} € + IVA\n` +
          (transporte
            ? `Transporte: 15 € + IVA\n`
            : "") +
          `\nTOTAL con IVA: ${total.toFixed(2)} €\n\n` +
          `Si quieres que Lucía te prepare el presupuesto formal:\n${WHATSAPP}`,
      });
    }

    // 🤖 IA GENERAL CONTROLADA
    const ai = await callAI(lastUser);

    if (!ai) {
      return NextResponse.json({
        text:
          "Ahora mismo no puedo responder esa consulta desde la web.\n\n" +
          `Puedes hablar directamente con Lucía aquí:\n${WHATSAPP}`,
      });
    }

    return NextResponse.json({ text: ai });
  } catch {
    return NextResponse.json({
      text:
        "Ha ocurrido un error.\n\n" +
        `Puedes escribirnos por WhatsApp: ${WHATSAPP}`,
    });
  }
}

