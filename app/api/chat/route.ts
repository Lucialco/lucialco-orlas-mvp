// app/api/chat/route.ts
import { NextResponse } from "next/server";
import {
  calcQuoteWithExtras,
  EXTRA_PRICES,
  type ExtraKey,
  type QuoteTipo,
} from "../../../lib/pricing";

export const runtime = "nodejs";
const WHATSAPP = "https://wa.me/34606849914";

// ===================== helpers =====================

function getUserTexts(messages: any[]): string[] {
  return (Array.isArray(messages) ? messages : [])
    .filter((m) => m?.role === "user" && typeof m?.content === "string")
    .map((m) => m.content.trim())
    .filter(Boolean);
}

function joinAllUserText(messages: any[]): string {
  return getUserTexts(messages).join(" | ");
}

function joinAllUserTextExceptLast(messages: any[]): string {
  const texts = getUserTexts(messages);
  if (texts.length <= 1) return texts.join(" | ");
  return texts.slice(0, -1).join(" | ");
}

function lastUserText(messages: any[]): string {
  const arr = getUserTexts(messages);
  return arr.length ? arr[arr.length - 1] : "";
}

function lastAssistantText(messages: any[]): string {
  const arr = (Array.isArray(messages) ? messages : [])
    .filter((m) => m?.role === "assistant" && typeof m?.content === "string")
    .map((m) => m.content.trim())
    .filter(Boolean);
  return arr.length ? arr[arr.length - 1] : "";
}

function norm(s: string) {
  return (s || "").toLowerCase();
}

function hasAny(text: string, patterns: RegExp[]) {
  return patterns.some((p) => p.test(text));
}

function extractLastNumber(text: string): number | null {
  // Evita matchAll (te dio error de TS). Esto es compatible con todo.
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
type Tipo = QuoteTipo | null;

function detectProvinciaFromAll(all: string): Provincia {
  const t = norm(all);
  if (/(^|[^a-záéíóúñ])madrid([^a-záéíóúñ]|$)/i.test(t)) return "madrid_toledo";
  if (/(^|[^a-záéíóúñ])toledo([^a-záéíóúñ]|$)/i.test(t)) return "madrid_toledo";

  // Si menciona cualquier otra provincia/ciudad típica, la tratamos como "otra"
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

function detectTipoFromReply(last: string): Tipo {
  const t = norm(last).trim();
  if (/^1\b/.test(t) || t.includes("plantill") || t.includes("prediseñ")) return "plantilla";
  if (/^2\b/.test(t) || t.includes("exclusiv") || t.includes("a medida")) return "exclusiva";
  return detectTipoFromAll(t);
}

function detectQuoteIntent(last: string): boolean {
  const tLast = norm(last);

  // botones
  if (tLast === "presupuesto rápido" || tLast === "presupuesto rapido") return true;

  // intención de presupuesto
  const intent = /(presupuesto|prespuesto|precio|coste|costos|tarifa|cuesta|vale)/i.test(tLast);
  const aboutOrlas = /(orla|orlas|alumn|niñ|colegio|clase|curso)/i.test(tLast);

  return intent || aboutOrlas && /(presupuesto|prespuesto|precio|coste|costos|tarifa|cuesta|vale)/i.test(tLast);
}

function detectPriorQuoteIntent(all: string): boolean {
  const tAll = norm(all);
  return /(presupuesto|prespuesto|precio|coste|costos|tarifa|cuesta|vale)/i.test(tAll);
}

function wantsTimelineInfo(last: string): boolean {
  const t = norm(last);
  return /(tiempo|tard[áa]is|tarda|plazo|entrega|duraci[oó]n|cu[aá]nto tarda)/i.test(t);
}

function askedForProvincia(text: string): boolean {
  const t = norm(text);
  return /provincia|madrid\/toledo|otra provincia/.test(t);
}

function askedForAlumnos(text: string): boolean {
  const t = norm(text);
  return /cu[aá]ntos alumnos|alumnos ser[ií]a|para cu[aá]ntos alumnos/.test(t);
}

function askedForTipo(text: string): boolean {
  const t = norm(text);
  return /qu[eé] opci[oó]n prefieres|plantilla|exclusiva|diseñ(o|o) desde cero/.test(t);
}

function askedForExtras(text: string): boolean {
  const t = norm(text);
  return /extras opcionales|extras quieres|quieres extras|extras te interesan/.test(t);
}

function wantsPhotosGuide(last: string): boolean {
  const t = norm(last);
  return t === "fotos recomendadas" || /(fotos|c[oó]mo hacer las fotos|gu[ií]a.*fotos|manual.*fotos)/i.test(t);
}

function wantsWeTransferGuide(last: string): boolean {
  const t = norm(last);
  return /(wetransfer|enviar.*fotos|mandar.*fotos|c[oó]mo enviar)/i.test(t);
}

function wantsHuman(last: string): boolean {
  const t = norm(last);
  return /(hablar con alguien|hablar con lucia|persona|humano|whatsapp|w\.?app|contactar|tel[eé]fono)/i.test(t);
}

function isGreeting(last: string): boolean {
  const t = norm(last);
  return /^(hola|buenas|hello|hey|holi|buenos d[ií]as|buenas tardes|buenas noches)\b/.test(t);
}

const EXTRA_OPTIONS: Array<{ key: ExtraKey; label: string }> = [
  { key: "beca", label: "Beca de graduación personalizada" },
  { key: "taza", label: "Taza con foto" },
  { key: "sobre", label: "Sobre reforzado con nombre" },
  { key: "fotos_recuerdo", label: "Fotos de recuerdo" },
];

function eur(n: number) {
  return n.toFixed(2).replace(".", ",");
}

function parseExtrasFromReply(reply: string): ExtraKey[] | null {
  const t = norm(reply).trim();
  if (!t) return null;

  if (/\b(ninguno|ninguna|no quiero|sin extras|no)\b/i.test(t)) return [];

  const keys = new Set<ExtraKey>();

  if (/beca/.test(t)) keys.add("beca");
  if (/taza/.test(t)) keys.add("taza");
  if (/sobre/.test(t)) keys.add("sobre");
  if (/fotos? de recuerdo|recuerdo/.test(t)) keys.add("fotos_recuerdo");

  const matches = t.match(/[1-4]/g) ?? [];
  for (const match of matches) {
    if (match === "1") keys.add("beca");
    if (match === "2") keys.add("taza");
    if (match === "3") keys.add("sobre");
    if (match === "4") keys.add("fotos_recuerdo");
  }

  return keys.size > 0 ? Array.from(keys) : null;
}

function extrasPrompt() {
  const lines: string[] = [];
  lines.push("¿Quieres extras opcionales? Puedes responder con números (ej: 1,3) o con “ninguno”.");
  EXTRA_OPTIONS.forEach((extra, idx) => {
    lines.push(`${idx + 1}) ${extra.label} (+${eur(EXTRA_PRICES[extra.key])} € / alumno)`);
  });
  return lines.join("\n");
}

function presupuestoTexto(prov: Provincia, alumnos: number, tipo: Tipo, extras: ExtraKey[]) {
  const provTxt = prov === "madrid_toledo" ? "Madrid / Toledo" : "Otra provincia";
  const tipoTxt = tipo === "exclusiva" ? "Diseño exclusivo (a medida)" : "Orla prediseñada (plantilla)";
  const zona = prov === "madrid_toledo" ? "MADRID_TOLEDO" : "OTRAS";
  const quote = calcQuoteWithExtras({
    alumnos,
    tipo,
    zona,
    envio: prov === "otra",
    extras,
  });

  const lines: string[] = [];
  lines.push(`📋 Presupuesto estimado (orlas por alumno)`);
  lines.push(`- Provincia: ${provTxt}`);
  lines.push(`- Alumnos: ${alumnos}`);
  lines.push(`- Tipo: ${tipoTxt}`);
  lines.push(``);
  lines.push(`💶 Precio por alumno (sin IVA): ${eur(quote.unit)} €`);
  if (quote.shipping > 0) lines.push(`🚚 Transporte (sin IVA): ${eur(quote.shipping)} € (pago único por pedido)`);
  lines.push(``);

  if (extras.length > 0) {
    lines.push(`✨ Extras opcionales (sin IVA):`);
    quote.extras.items.forEach((item) => {
      const label = EXTRA_OPTIONS.find((extra) => extra.key === item.key)?.label ?? item.key;
      lines.push(`- ${label}: ${eur(item.unit)} € / alumno → ${eur(item.total)} €`);
    });
    lines.push(``);
  } else {
    lines.push(`✨ Extras opcionales: ninguno`);
    lines.push(``);
  }

  lines.push(`Subtotal (sin IVA): ${eur(quote.subtotal)} €`);
  lines.push(`IVA (21%): ${eur(quote.iva)} €`);
  lines.push(`✅ TOTAL (con IVA): ${eur(quote.total)} €`);
  lines.push(``);
  lines.push(`Si quieres, Lucía te lo deja por escrito y lo cerráis por WhatsApp: ${WHATSAPP}`);

  return lines.join("\n");
}

// ===================== route =====================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const last = lastUserText(messages);
    const all = joinAllUserText(messages);
    const allExceptLast = joinAllUserTextExceptLast(messages);
    const lastAssistant = lastAssistantText(messages);

    // ✅ DEBUG (para comprobar que entra en ESTE archivo)
    if (norm(last) === "/debug") {
      return NextResponse.json({
        text:
          `DEBUG OK ✅\n` +
          `- route: app/api/chat/route.ts\n` +
          `- has OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "yes" : "no"}\n` +
          `- time: ${new Date().toISOString()}\n`,
      });
    }

    // ✅ HUMANO
    if (wantsHuman(last)) {
      return NextResponse.json({
        text: `Perfecto. Habla directamente con Lucía por WhatsApp: ${WHATSAPP}`,
      });
    }

    // ✅ SALUDO
    if (isGreeting(last)) {
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

    // ✅ GUÍA WETRANSFER
    if (wantsWeTransferGuide(last)) {
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

    // ✅ GUÍA FOTOS
    if (wantsPhotosGuide(last)) {
      return NextResponse.json({
        text:
          "Si el colegio está fuera de Madrid o Toledo, el cole hace las fotos y nosotros nos ocupamos del resto (incluye retoque).\n\n" +
          "Te compartimos la guía completa para hacer las fotos correctamente.\n" +
          `Si quieres, Lucía te lo explica y revisa dudas por WhatsApp: ${WHATSAPP}`,
      });
    }

    // ✅ PRESUPUESTOS (DETERMINISTA, SIN INVENTAR)
    const inQuoteFlow =
      detectQuoteIntent(last) ||
      detectPriorQuoteIntent(all) ||
      askedForProvincia(lastAssistant) ||
      askedForAlumnos(lastAssistant) ||
      askedForTipo(lastAssistant) ||
      askedForExtras(lastAssistant);

    if (inQuoteFlow) {
      const reply = norm(last).trim();
      const repliedTipoChoice = reply === "1" || reply === "2";
      const extrasFromReply = askedForExtras(lastAssistant) ? parseExtrasFromReply(last) : null;
      const repliedExtrasChoice = extrasFromReply !== null;
      const prov = askedForProvincia(lastAssistant)
        ? detectProvinciaFromAll(last || all)
        : detectProvinciaFromAll(all);
      const alumnos = askedForAlumnos(lastAssistant)
        ? extractLastNumber(last)
        : repliedTipoChoice || repliedExtrasChoice
          ? extractLastNumber(allExceptLast || all)
          : extractLastNumber(all);
      const shouldUseTipoReply = askedForTipo(lastAssistant) || (repliedTipoChoice && !askedForExtras(lastAssistant));
      const tipo = shouldUseTipoReply
        ? detectTipoFromReply(last || all)
        : detectTipoFromAll(repliedExtrasChoice ? allExceptLast || all : all);
      const extras = extrasFromReply ?? null;

      if (!alumnos) {
        return NextResponse.json({
          text: "Perfecto. ¿Para cuántos alumnos sería la orla?",
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

      if (!prov) {
        return NextResponse.json({
          text:
            "Para darte presupuesto necesito la provincia.\n\n" +
            "👉 ¿El colegio está en Madrid/Toledo o en otra provincia?",
        });
      }

      if (extras === null) {
        return NextResponse.json({
          text: extrasPrompt(),
        });
      }

      return NextResponse.json({
        text: presupuestoTexto(prov, alumnos, tipo, extras),
      });
    }

    // ✅ CUALQUIER OTRA COSA: no inventamos → WhatsApp
    if (wantsTimelineInfo(last)) {
      return NextResponse.json({
        text:
          "Para darte un plazo exacto lo mejor es que lo confirme Lucía.\n\n" +
          `Pulsa aquí y te atiende directamente: ${WHATSAPP}`,
      });
    }

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
