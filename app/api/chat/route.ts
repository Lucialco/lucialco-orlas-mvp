import { NextResponse } from "next/server";
import { calcQuote, type ProvinciaZona, type QuoteTipo } from "../../../lib/pricing";

export const runtime = "nodejs";
const WHATSAPP = "https://wa.me/34606849914";

/* ---------------- BASICO ---------------- */

function norm(s: string) {
  return (s || "").trim();
}

function isGreeting(t: string) {
  return /^(hola|buenas|hey|hello|hi)\b/i.test(t.trim());
}

function wantsQuote(text: string) {
  return /(presupuesto|precio|cu[aá]nto cuesta|cu[aá]nto vale|coste|tarifa)/i.test(text);
}

/* ---------------- DETECTORES ---------------- */

function detectZona(text: string): ProvinciaZona | null {
  if (/\bmadrid\b/i.test(text) || /\btoledo\b/i.test(text)) return "MADRID_TOLEDO";
  if (/otra|fuera|cuenca|sevilla|barcelona|valencia|zaragoza|bilbao|alicante|murcia|granada|malaga|cadiz/i.test(text))
    return "OTRAS";
  return null;
}

function detectTipo(text: string): QuoteTipo | null {
  if (/exclusiv|a medida|personaliz/i.test(text)) return "exclusiva";
  if (/plantill|prediseñ/i.test(text)) return "plantilla";
  return null;
}

function extractAlumnos(text: string): number | null {
  const re = /(\d{1,4})/g;
  let m: RegExpExecArray | null;
  let last: number | null = null;

  while ((m = re.exec(text)) !== null) {
    const n = parseInt(m[1], 10);
    if (n > 0 && n <= 1000) last = n;
  }
  return last;
}

function detectEnvioDecision(text: string): boolean | null {
  if (/recog|mano|retirar/i.test(text)) return false;
  if (/envio|mensaj|paquete|transporte/i.test(text)) return true;
  return null;
}

function euro(n: number) {
  return `${n.toFixed(2)} €`;
}

/* ---------------- API ---------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incoming = Array.isArray(body?.messages) ? body.messages : [];

    const userMsgs = incoming
      .filter((m: any) => m?.role === "user")
      .map((m: any) => String(m.content));

    const lastUser = norm(userMsgs[userMsgs.length - 1] || "");
    const fullText = userMsgs.slice(-12).join(" ");

    /* ---------- SALUDO ---------- */
    if (!lastUser || isGreeting(lastUser)) {
      return NextResponse.json({
        text:
          "Hola 😊 Soy el asistente de Lucialco Orlas.\n\n" +
          "Si quieres presupuesto, lo vemos paso a paso.\n" +
          "👉 Primero: ¿el colegio está en Madrid/Toledo o en otra provincia?",
      });
    }

    /* =======================================================
       🔒 BLOQUEO TOTAL IA SI HAY PRESUPUESTO
    ======================================================= */

    if (wantsQuote(fullText)) {
      const zona = detectZona(fullText);
      if (!zona) {
        return NextResponse.json({
          text: "Perfecto. ¿El colegio está en Madrid/Toledo o en otra provincia?",
        });
      }

      const alumnos = extractAlumnos(fullText);
      if (!alumnos) {
        return NextResponse.json({
          text: "Genial. ¿Para cuántos alumnos es la orla?",
        });
      }

      const tipo = detectTipo(fullText);
      if (!tipo) {
        return NextResponse.json({
          text: "¿La queréis prediseñada (plantilla) o diseño exclusivo?",
        });
      }

      const envioDecision = detectEnvioDecision(fullText);

      if (zona === "MADRID_TOLEDO" && envioDecision === null) {
        return NextResponse.json({
          text: "¿Lo queréis con envío (15€ por pedido) o lo recogéis en mano?",
        });
      }

      const envio = zona === "OTRAS" ? true : (envioDecision ?? true);

      const q = calcQuote({ alumnos, tipo, zona, envio });

      return NextResponse.json({
        text:
          `📋 Presupuesto (IVA incluido):\n\n` +
          `• Alumnos: ${q.alumnos}\n` +
          `• Zona: ${zona === "MADRID_TOLEDO" ? "Madrid/Toledo" : "otra provincia"}\n` +
          `• Tipo: ${tipo}\n` +
          `• Precio alumno (sin IVA): ${euro(q.unit)}\n` +
          `• Transporte (sin IVA): ${euro(q.shipping)}\n\n` +
          `👉 TOTAL: ${euro(q.total)}\n` +
          `👉 Sale a ${euro(q.perAlumno)} por alumno (IVA incluido)\n\n` +
          `Si quieres, lo cerramos por WhatsApp: ${WHATSAPP}`,
      });
    }

    /* ---------- DUDAS GENERALES (IA) ---------- */

    return NextResponse.json({
      text:
        "¿Qué necesitas exactamente?\n\n" +
        "👉 Puedo ayudarte con presupuestos o con dudas sobre el proceso.\n\n" +
        `WhatsApp: ${WHATSAPP}`,
    });

  } catch {
    return NextResponse.json({
      text: `Ha ocurrido un error. WhatsApp: ${WHATSAPP}`,
    });
  }
}

