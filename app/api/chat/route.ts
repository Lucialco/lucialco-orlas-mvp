// app/api/chat/route.ts
import { NextResponse } from "next/server";
import {
  answerGeneralQuestion,
  buildQuoteState,
  detectIntent,
  isGreeting,
  quotePrompt,
} from "../../../lib/chatFlow";

export const runtime = "nodejs";
const WHATSAPP = "https://wa.me/34606849914";

// ===================== helpers =====================

function lastUserText(messages: any[]): string {
  const arr = (Array.isArray(messages) ? messages : [])
    .filter((m) => m?.role === "user" && typeof m?.content === "string")
    .map((m) => m.content.trim())
    .filter(Boolean);
  return arr.length ? arr[arr.length - 1] : "";
}

// ===================== route =====================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const last = lastUserText(messages);
    const intent = detectIntent(last);
    const quoteState = buildQuoteState(messages);

    // ✅ DEBUG (para comprobar que entra en ESTE archivo)
    if (last.toLowerCase() === "/debug") {
      return NextResponse.json({
        text:
          `DEBUG OK ✅\n` +
          `- route: app/api/chat/route.ts\n` +
          `- has OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "yes" : "no"}\n` +
          `- time: ${new Date().toISOString()}\n`,
      });
    }

    // ✅ ROUTER GLOBAL (alta prioridad)
    if (intent.human) {
      return NextResponse.json({
        text: `Perfecto. Habla directamente con Lucía por WhatsApp: ${WHATSAPP}`,
      });
    }

    if (intent.wetransfer) {
      return NextResponse.json({
        text:
          "Para enviarnos las fotos (fuera de Madrid/Toledo):\n" +
          "1) Entra en WeTransfer\n" +
          "2) Añade los archivos\n" +
          "3) En “Enviar email a” pon: fotos@lucialco.com\n" +
          "4) Pon tu email para recibir confirmación\n" +
          "5) Enviar\n\n" +
          `Si se complica, lo resolvéis con Lucía por WhatsApp: ${WHATSAPP}`,
      });
    }

    if (intent.photosGuide) {
      return NextResponse.json({
        text:
          "Si el colegio está fuera de Madrid o Toledo, el cole hace las fotos y nosotros nos ocupamos del resto (incluye retoque).\n\n" +
          "Te compartimos la guía completa para hacer las fotos correctamente.\n" +
          `Si quieres, Lucía te lo explica y revisa dudas por WhatsApp: ${WHATSAPP}`,
      });
    }

    if (intent.general && !intent.pricing) {
      return NextResponse.json({
        text: answerGeneralQuestion(last, WHATSAPP),
      });
    }

    // ✅ SALUDO
    if (isGreeting(last) && !intent.pricing) {
      return NextResponse.json({
        text:
          "Hola. Soy el asistente de Lucialco Orlas.\n" +
          "Puedo ayudarte con:\n" +
          "• Presupuesto\n" +
          "• Guía para hacer las fotos (si es fuera de Madrid/Toledo)\n" +
          "• Cómo enviar las fotos por WeTransfer\n\n" +
          "¿Qué necesitas?",
      });
    }

    // ✅ PRESUPUESTOS (FSM determinista)
    if (intent.pricing || quoteState.active) {
      return NextResponse.json({ text: quotePrompt(quoteState) });
    }

    // ✅ CUALQUIER OTRA COSA: no inventamos → WhatsApp
    return NextResponse.json({
      text:
        "Para responderte bien necesito que lo vea Lucía (no quiero darte una respuesta incorrecta).\n\n" +
        `Pulsa aquí y te atiende directamente: ${WHATSAPP}`,
    });
  } catch {
    return NextResponse.json({
      text: `Ha ocurrido un error. Puedes escribirnos por WhatsApp: ${WHATSAPP}`,
    });
  }
}
