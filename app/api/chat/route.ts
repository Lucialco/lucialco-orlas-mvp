// app/api/chat/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const WHATSAPP = "https://wa.me/34606849914";

// ===================== helpers =====================

function getUserTexts(messages: any[]): string[] {
  return (Array.isArray(messages) ? messages : [])
    .filter((m) => m?.role === "user" && typeof m?.content === "string")
    .map((m) => m.content.trim())
    .filter(Boolean);
}

function getAssistantTexts(messages: any[]): string[] {
  return (Array.isArray(messages) ? messages : [])
    .filter((m) => m?.role === "assistant" && typeof m?.content === "string")
    .map((m) => m.content.trim())
    .filter(Boolean);
}

function joinAllUserText(messages: any[]): string {
  return getUserTexts(messages).join(" | ");
}

function lastUserText(messages: any[]): string {
  const arr = getUserTexts(messages);
  return arr.length ? arr[arr.length - 1] : "";
}

function lastAssistantText(messages: any[]): string {
  const arr = getAssistantTexts(messages);
  return arr.length ? arr[arr.length - 1] : "";
}

function norm(s: string) {
  return (s || "").toLowerCase();
}

function extractLastNumber(text: string): number | null {
  const re = /(\d{1,4})/g;
  let m: RegExpExecArray | null;
  let last: number | null = null;
  while ((m = re.exec(text)) !== null) {
    const n = parseInt(m[1], 10);
    if (Number.isFinite(n) && n > 0 && n <= 1000) last = n;
  }
  return last;
}

type Provincia = "madrid_toledo" | "otra" | null;
type Tipo = "plantilla" | "exclusiva" | null;

// ===================== intent helpers =====================

function wantsHuman(last: string): boolean {
  const t = norm(last);
  return /(hablar con alguien|hablar con lucia|persona|humano|whatsapp|w\.?app|contactar|tel[eé]fono)/i.test(
    t
  );
}

function isGreeting(last: string): boolean {
  const t = norm(last);
  return /^(hola|buenas|hello|hey|holi|buenos d[ií]as|buenas tardes|buenas noches)\b/.test(t);
}

function wantsPhotosGuide(last: string): boolean {
  const t = norm(last);
  return (
    t === "fotos recomendadas" ||
    /(fotos|c[oó]mo hacer las fotos|gu[ií]a.*fotos|manual.*fotos)/i.test(t)
  );
}

function wantsWeTransferGuide(last: string): boolean {
  const t = norm(last);
  return /(wetransfer|enviar.*fotos|mandar.*fotos|c[oó]mo enviar)/i.test(t);
}

// ===================== quote detection =====================

function detectQuoteIntent(last: string, all: string): boolean {
  const tLast = norm(last);
  const tAll = norm(all);

  if (tLast === "presupuesto rápido" || tLast === "presupuesto rapido") return true;

  const intent = /(presupuesto|precio|cu[aá]nto|cuanto|coste|costos|tarifa)/i.test(tLast);
  const aboutOrlas = /(orla|orlas|alumn|niñ|colegio|clase|curso)/i.test(tAll);

  return intent || (aboutOrlas && /(presupuesto|precio|cu[aá]nto|cuanto|coste|tarifa)/i.test(tAll));
}

// ===================== province / tipo =====================

function detectProvinciaFromAll(all: string): Provincia {
  const t = norm(all);
  if (/(^|[^a-záéíóúñ])madrid([^a-záéíóúñ]|$)/i.test(t)) return "madrid_toledo";
  if (/(^|[^a-záéíóúñ])toledo([^a-záéíóúñ]|$)/i.test(t)) return "madrid_toledo";

  if (
    /(albacete|alicante|almer[ií]a|asturias|avila|badajoz|barcelona|bilbao|burgos|c[aá]ceres|c[aá]diz|cantabria|castell[oó]n|ciudad real|c[oó]rdoba|coru[nñ]a|cuenca|girona|granada|guadalajara|huelva|huesca|ja[eé]n|le[oó]n|lerida|lugo|m[aá]laga|murcia|navarra|ourense|palencia|pontevedra|salamanca|sevilla|soria|tarragona|teruel|valencia|valladolid|vizcaya|zamora|zaragoza|otra)/i.test(
      t
    )
  ) {
    return "otra";
  }

  return null;
}

function detectTipoFromAll(all: string): Tipo {
  const t = norm(all);
  if (/exclusiv/.test(t) || /a medida/.test(t) || /diseñ(.*)desde 0/.test(t)) return "exclusiva";
  if (/plantill/.test(t) || /prediseñ/.test(t)) return "plantilla";
  return null;
}

// ===================== asked-for helpers =====================

function askedForProvincia(lastA: string) {
  const t = norm(lastA);
  return /provincia|madrid\/toledo|otra provincia/i.test(t);
}

function askedForAlumnos(lastA: string) {
  const t = norm(lastA);
  return /cu[aá]ntos alumnos|para cu[aá]ntos alumnos/i.test(t);
}

function askedForTipo(lastA: string) {
  const t = norm(lastA);
  return /qu[eé] opci[oó]n prefieres|plantilla|exclusiva|diseñ(.*)desde cero/i.test(t);
}

// ===================== pricing =====================

function pricePerAlumno(prov: Provincia, tipo: Tipo): number | null {
  if (!prov || !tipo) return null;
  if (prov === "madrid_toledo") return tipo === "exclusiva" ? 15 : 11.5;
  return tipo === "exclusiva" ? 10.5 : 9;
}

function shippingBase(prov: Provincia): number {
  return prov === "otra" ? 15 : 0;
}

function eur(n: number) {
  return n.toFixed(2).replace(".", ",");
}

function presupuestoTexto(prov: Provincia, alumnos: number, tipo: Tipo) {
  const unit = pricePerAlumno(prov, tipo)!;
  const envio = shippingBase(prov);
  const base = alumnos * unit + envio;
  const iva = base * 0.21;
  const total = base + iva;

  const provTxt = prov === "madrid_toledo" ? "Madrid / Toledo" : "Otra provincia";
  const tipoTxt = tipo === "exclusiva" ? "Diseño exclusivo (a medida)" : "Orla prediseñada (plantilla)";

  return [
    "📋 Presupuesto estimado (orlas por alumno)",
    `- Provincia: ${provTxt}`,
    `- Alumnos: ${alumnos}`,
    `- Tipo: ${tipoTxt}`,
    "",
    `💶 Precio por alumno (sin IVA): ${eur(unit)} €`,
    envio > 0 ? `🚚 Transporte (sin IVA): ${eur(envio)} € (pago único por pedido)` : "",
    "",
    `Subtotal (sin IVA): ${eur(base)} €`,
    `IVA (21%): ${eur(iva)} €`,
    `✅ TOTAL (con IVA): ${eur(total)} €`,
    "",
    `Si quieres, Lucía te lo deja por escrito por WhatsApp: ${WHATSAPP}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ===================== route =====================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const last = lastUserText(messages);
    const all = joinAllUserText(messages);
    const lastA = lastAssistantText(messages);

    // ================= PRIORITY INTENTS =================

    if (wantsHuman(last)) {
      return NextResponse.json({
        text: `Perfecto 🙂 Habla directamente con Lucía por WhatsApp: ${WHATSAPP}`,
      });
    }

    if (isGreeting(last)) {
      return NextResponse.json({
        text:
          "Hola. Soy el asistente de Lucialco Orlas.\n\n" +
          "Puedo ayudarte con:\n" +
          "• Presupuesto\n" +
          "• Guía para hacer las fotos\n" +
          "• Cómo enviarlas por WeTransfer\n\n" +
          "¿Qué necesitas?",
      });
    }

    const wantsGuides = wantsPhotosGuide(last) || wantsWeTransferGuide(last);
    if (wantsGuides) {
      return NextResponse.json({
        text:
          "📸 **Guía para hacer las fotos (fuera de Madrid/Toledo)**\n" +
          "• Misma prenda arriba (ej: camiseta blanca)\n" +
          "• Fondo liso (sábana estirada)\n" +
          "• Buena luz natural\n" +
          "• Cámara siempre a misma altura\n\n" +
          "📩 **Cómo enviarlas por WeTransfer**\n" +
          "1) Entra en WeTransfer\n" +
          "2) Añade las fotos\n" +
          "3) En “Enviar email a” pon: fotos@lucialco.com\n" +
          "4) Pon tu email\n" +
          "5) Enviar\n\n" +
          "📄 Si quieres el PDF con ambas guías, aquí no puedo adjuntarlo.\n" +
          `👉 Pulsa el botón de WhatsApp y te lo enviamos: ${WHATSAPP}`,
      });
    }

    // ================= QUOTE FLOW =================
    const inQuoteFlow =
      detectQuoteIntent(last, all) ||
      askedForProvincia(lastA) ||
      askedForAlumnos(lastA) ||
      askedForTipo(lastA);

    if (inQuoteFlow) {
      let prov = detectProvinciaFromAll(all);

      let alumnos: number | null = null;
      if (askedForAlumnos(lastA) || /alumn/i.test(last)) {
        alumnos = extractLastNumber(last);
      }

      let tipo = detectTipoFromAll(all);

      if (askedForProvincia(lastA)) {
        const p = detectProvinciaFromAll(last);
        if (p) prov = p;
      }

      if (askedForTipo(lastA)) {
        const t = norm(last).replace(/[^\wáéíóúñ]/gi, " ").trim();
        if (t === "1") tipo = "plantilla";
        else if (t === "2") tipo = "exclusiva";
        else {
          const tt = detectTipoFromAll(last);
          if (tt) tipo = tt;
        }
      }

      if (!prov) {
        return NextResponse.json({
          text:
            "Para darte presupuesto necesito primero la provincia.\n\n" +
            "👉 ¿El colegio está en Madrid/Toledo o en otra provincia?",
        });
      }

      if (!alumnos) {
        return NextResponse.json({
          text: "Perfecto 👍 ¿Para cuántos alumnos sería la orla?",
        });
      }

      if (!tipo) {
        return NextResponse.json({
          text:
            "¿Qué opción prefieres?\n" +
            "1) Plantilla (prediseñada)\n" +
            "2) Exclusiva (diseño desde cero)",
        });
      }

      return NextResponse.json({
        text: presupuestoTexto(prov, alumnos, tipo),
      });
    }

    // ================= FALLBACK =================

    return NextResponse.json({
      text:
        "Para ayudarte bien lo revisa Lucía directamente.\n\n" +
        `👉 Pulsa aquí y te atiende por WhatsApp: ${WHATSAPP}`,
    });
  } catch {
    return NextResponse.json({
      text: `Ha ocurrido un error. Escríbenos por WhatsApp: ${WHATSAPP}`,
    });
  }
}
