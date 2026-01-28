import { NextResponse } from "next/server";
import { calcQuote, type ProvinciaZona, type QuoteTipo } from "../../../lib/pricing";

export const runtime = "nodejs";
const WHATSAPP = "https://wa.me/34606849914";

/* ---------------- UTILIDADES ---------------- */

function norm(s: string) {
  return (s || "").trim();
}

function isGreeting(t: string) {
  return /^(hola|buenas|hey|hello|hi)\b/i.test(t.trim());
}

function detectQuoteIntent(text: string): boolean {
  return /(presupuesto|precio|cu[aá]nto cuesta|cu[aá]nto vale|coste|tarifa)/i.test(text);
}

function extractAlumnos(text: string): number | null {
  const m = text.match(/(\d{1,4})/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function extractAlumnosFromAll(text: string): number | null {
  // Último número válido del hilo (1..1000)
  const re = /(\d{1,4})/g;
  let m: RegExpExecArray | null;
  let last: number | null = null;

  while ((m = re.exec(text)) !== null) {
    const n = parseInt(m[1], 10);
    if (Number.isFinite(n) && n > 0 && n <= 1000) last = n;
  }

  return last;
}

function detectTipo(text: string): QuoteTipo | null {
  if (/exclusiv|a medida|diseñ[oa]\s*desde\s*0|personaliz/i.test(text)) return "exclusiva";
  if (/plantill|prediseñ|predisen/i.test(text)) return "plantilla";
  return null;
}

function detectZona(text: string): ProvinciaZona | null {
  if (/\bmadrid\b/i.test(text) || /\btoledo\b/i.test(text)) return "MADRID_TOLEDO";
  if (
    /otra(s)?\s+provincia(s)?|fuera\s+de\s+(madrid|toledo)|resto\s+de\s+españa|\bcuenca\b|\bsevilla\b|\bbarcelona\b|\bvalencia\b|\bzaragoza\b|\bbilbao\b|\bcoruñ|\balicante\b|\bmurcia\b|\bgranada\b|\bmálaga\b|\bcádiz\b|\btarragona\b/i.test(
      text
    )
  ) {
    return "OTRAS";
  }
  return null;
}

function detectEnvioDecision(text: string): boolean | null {
  if (/(recog|paso a recoger|lo recojo|retirar|en mano)/i.test(text)) return false;
  if (/(env[ií]o|enviar|transporte|mensaj|paquete|correos|domicilio)/i.test(text)) return true;
  return null;
}

function euro(n: number) {
  return `${n.toFixed(2)} €`;
}

/* ---------------- OPENAI (solo para dudas) ---------------- */

async function callOpenAI(history: { role: "user" | "assistant"; content: string }[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const system = {
    role: "system" as const,
    content:
      `Eres el asistente de Lucialco Orlas.\n` +
      `Tono: español natural, profesional y amable.\n` +
      `Reglas:\n` +
      `- No inventes precios ni condiciones.\n` +
      `- Si falta información, pregunta 1-2 cosas.\n` +
      `- Si no puedes confirmarlo, deriva a WhatsApp: ${WHATSAPP}\n` +
      `- No digas "te lo envío por WhatsApp": solo ofrece el enlace.\n`,
  };

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
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

/* ---------------- API ---------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incoming = Array.isArray(body?.messages) ? body.messages : [];

    const userMsgs = incoming
      .filter((m: any) => m?.role === "user" && typeof m?.content === "string")
      .map((m: any) => String(m.content));

    const lastUser = norm(userMsgs[userMsgs.length - 1] || "");

    // Saludo inicial
    if (!lastUser || isGreeting(lastUser)) {
      return NextResponse.json({
        text:
          "Hola 😊 Soy el asistente de Lucialco Orlas.\n\n" +
          "Si quieres presupuesto, lo vemos paso a paso.\n" +
          "Primero: ¿el colegio está en Madrid/Toledo o en otra provincia?",
      });
    }

    // ======= MODO PRESUPUESTO =======
    const fullUserText = userMsgs.slice(-12).join(" \n");
    const inQuoteMode = detectQuoteIntent(fullUserText) || /presupuesto/i.test(fullUserText);

    if (inQuoteMode) {
      // ORDEN: Provincia -> Alumnos -> Tipo -> Envío (si Madrid/Toledo)
      const zona = detectZona(fullUserText);
      if (!zona) {
        return NextResponse.json({
          text: "Perfecto. ¿El colegio está en Madrid/Toledo o en otra provincia?",
        });
      }

      const alumnos = extractAlumnosFromAll(fullUserText);
      if (!alumnos) {
        return NextResponse.json({ text: "Genial. ¿Para cuántos alumnos es la orla?" });
      }

      const tipo = detectTipo(fullUserText);
      if (!tipo) {
        return NextResponse.json({
          text: "¿La queréis prediseñada (plantilla) o diseño exclusivo (a medida)?",
        });
      }

      const envioDecision = detectEnvioDecision(fullUserText);

      if (zona === "MADRID_TOLEDO" && envioDecision === null) {
        return NextResponse.json({
          text: "¿Lo queréis con envío (15€ por pedido) o lo recogéis en mano?",
        });
      }

      const envio = zona === "OTRAS" ? true : (envioDecision ?? true);

      const q = calcQuote({ alumnos, tipo, zona, envio });

      const zonaTxt = q.zona === "MADRID_TOLEDO" ? "Madrid/Toledo" : "otra provincia";
      const tipoTxt = q.tipo === "plantilla" ? "Plantilla (prediseñada)" : "Exclusiva (a medida)";

      return NextResponse.json({
        text:
          `Presupuesto (IVA incluido):\n` +
          `• Alumnos: ${q.alumnos}\n` +
          `• Zona: ${zonaTxt}\n` +
          `• Tipo: ${tipoTxt}\n` +
          `• Precio por alumno (sin IVA): ${euro(q.unit)}\n` +
          `• Transporte (sin IVA): ${euro(q.shipping)}\n` +
          `• TOTAL: ${euro(q.total)}\n` +
          `• Sale a: ${euro(q.perAlumno)} por alumno (IVA incluido)\n\n` +
          `Si quieres, lo cerramos por WhatsApp: ${WHATSAPP}`,
      });
    }

    // ======= DUDAS GENERALES CON IA =======
    const history = incoming
      .filter(
        (m: any) =>
          (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string"
      )
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
      text: `Ha ocurrido un error. WhatsApp: ${WHATSAPP}`,
    });
  }
}
