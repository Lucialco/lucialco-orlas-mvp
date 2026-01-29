import {
  calcQuoteWithExtras,
  EXTRA_PRICES,
  type ExtraKey,
  type QuoteTipo,
  type ProvinciaZona,
} from "./pricing";

export type QuoteStep = "alumnos" | "tipo" | "extras" | "provincia" | "complete";

export type QuoteProvincia = "madrid_toledo" | "otra" | null;

export type QuoteState = {
  active: boolean;
  step: QuoteStep;
  provincia: QuoteProvincia;
  zona: ProvinciaZona | null;
  alumnos: number | null;
  tipo: QuoteTipo | null;
  extras: ExtraKey[] | null;
};

export type Intent = {
  pricing: boolean;
  wetransfer: boolean;
  human: boolean;
  general: boolean;
  photosGuide: boolean;
  timeline: boolean;
};

const EXTRA_OPTIONS: Array<{ key: ExtraKey; label: string }> = [
  { key: "beca", label: "Beca de graduación personalizada" },
  { key: "taza", label: "Taza con foto" },
  { key: "sobre", label: "Sobre reforzado con nombre" },
  { key: "fotos_recuerdo", label: "Fotos de recuerdo" },
];

function norm(text: string) {
  return (text || "").toLowerCase().trim();
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

function detectProvincia(text: string): QuoteProvincia {
  const t = norm(text);
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

function detectTipo(text: string): QuoteTipo | null {
  const t = norm(text);
  if (/^1\b/.test(t) || /plantill|prediseñ|base|normal/.test(t)) return "plantilla";
  if (/^2\b/.test(t) || /exclusiv|personaliz|a medida/.test(t)) return "exclusiva";
  return null;
}

function parseExtras(text: string): ExtraKey[] | null {
  const t = norm(text);
  if (!t) return null;
  if (/\b(ninguno|ninguna|sin extras|no quiero|no)\b/i.test(t)) return [];

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

function parseAlumnos(text: string): number | null {
  return extractLastNumber(text);
}

export function detectIntent(text: string): Intent {
  const t = norm(text);
  const pricing = /(presupuesto|prespuesto|precio|coste|tarifa|cuesta|vale)/i.test(t);
  const wetransfer = /(wetransfer|we transfer|enviar.*fotos|mandar.*fotos|subir.*fotos|subir.*im[aá]genes|drive|google drive|dropbox)/i.test(
    t
  );
  const human = /(hablar|persona|alguien|asesor|asesora|humano|whatsapp|w\.?app|contactar|tel[eé]fono)/i.test(
    t
  );
  const photosGuide =
    t === "fotos recomendadas" ||
    /(fotos|c[oó]mo hacer las fotos|gu[ií]a.*fotos|manual.*fotos)/i.test(t);
  const timeline = /(tiempo|tard[áa]is|tarda|plazo|entrega|duraci[oó]n|cu[aá]nto tarda)/i.test(t);
  const general =
    timeline ||
    /\?$/.test(t) ||
    /(que hac(e|éis)|servicios|orlas|informaci[oó]n|como funciona|trabaj[aá]is)/i.test(t);

  return { pricing, wetransfer, human, general, photosGuide, timeline };
}

function initialState(): QuoteState {
  return {
    active: false,
    step: "alumnos",
    provincia: null,
    zona: null,
    alumnos: null,
    tipo: null,
    extras: null,
  };
}

function advance(state: QuoteState): QuoteState {
  const order: QuoteStep[] = ["alumnos", "tipo", "extras", "provincia", "complete"];
  const idx = order.indexOf(state.step);
  const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : state.step;
  return { ...state, step: next };
}

export function buildQuoteState(messages: any[]): QuoteState {
  const state = initialState();
  const userTexts = (Array.isArray(messages) ? messages : [])
    .filter((m) => m?.role === "user" && typeof m?.content === "string")
    .map((m) => m.content.trim())
    .filter(Boolean);

  return userTexts.reduce((acc, text) => {
    const intent = detectIntent(text);
    if (!acc.active && intent.pricing) {
      acc = { ...acc, active: true };
    }
    if (!acc.active) return acc;
    if (!intent.pricing && (intent.human || intent.wetransfer || intent.photosGuide || intent.general)) {
      return acc;
    }

    if (acc.step === "alumnos") {
      const alumnos = parseAlumnos(text);
      if (alumnos) return advance({ ...acc, alumnos });
      return acc;
    }

    if (acc.step === "tipo") {
      const tipo = detectTipo(text);
      if (tipo) return advance({ ...acc, tipo });
      return acc;
    }

    if (acc.step === "extras") {
      const extras = parseExtras(text);
      if (extras !== null) return advance({ ...acc, extras });
      return acc;
    }

    if (acc.step === "provincia") {
      const provincia = detectProvincia(text);
      if (provincia) {
        const zona: ProvinciaZona = provincia === "madrid_toledo" ? "MADRID_TOLEDO" : "OTRAS";
        return advance({ ...acc, provincia, zona });
      }
      return acc;
    }

    return acc;
  }, state);
}

export function quotePrompt(state: QuoteState): string {
  if (state.step === "alumnos") {
    return "Perfecto. ¿Para cuántos alumnos sería la orla?";
  }

  if (state.step === "tipo") {
    return (
      "¿Qué opción prefieres?\n" +
      "1) Plantilla (prediseñada)\n" +
      "2) Exclusiva (diseño desde cero)"
    );
  }

  if (state.step === "extras") {
    const lines: string[] = [];
    lines.push("¿Quieres extras opcionales? Puedes responder con números (ej: 1,3) o con “ninguno”.");
    EXTRA_OPTIONS.forEach((extra, idx) => {
      lines.push(`${idx + 1}) ${extra.label} (+${EXTRA_PRICES[extra.key].toFixed(2).replace(".", ",")} € / alumno)`);
    });
    return lines.join("\n");
  }

  if (state.step === "provincia") {
    return (
      "Para darte presupuesto necesito la provincia.\n\n" +
      "👉 ¿El colegio está en Madrid/Toledo o en otra provincia?"
    );
  }

    if (state.step === "complete" && state.alumnos && state.tipo && state.zona && state.extras) {
    const provTxt = state.zona === "MADRID_TOLEDO" ? "Madrid / Toledo" : "Otra provincia";
    const tipoTxt = state.tipo === "exclusiva" ? "Diseño exclusivo (a medida)" : "Orla prediseñada (plantilla)";
    const quote = calcQuoteWithExtras({
      alumnos: state.alumnos,
      tipo: state.tipo,
      zona: state.zona,
      envio: state.zona === "OTRAS",
      extras: state.extras,
    });

    const lines: string[] = [];
    lines.push(`📋 Presupuesto estimado (orlas por alumno)`);
    lines.push(`- Provincia: ${provTxt}`);
    lines.push(`- Alumnos: ${state.alumnos}`);
    lines.push(`- Tipo: ${tipoTxt}`);
    lines.push(``);
    lines.push(`💶 Precio por alumno (sin IVA): ${quote.unit.toFixed(2).replace(".", ",")} €`);
    if (quote.shipping > 0) {
      lines.push(
        `🚚 Transporte (sin IVA): ${quote.shipping.toFixed(2).replace(".", ",")} € (pago único por pedido)`
      );
    }
    lines.push(``);

    if (state.extras.length > 0) {
      lines.push(`✨ Extras opcionales (sin IVA):`);
      quote.extras.items.forEach((item) => {
        const label = EXTRA_OPTIONS.find((extra) => extra.key === item.key)?.label ?? item.key;
        lines.push(
          `- ${label}: ${item.unit.toFixed(2).replace(".", ",")} € / alumno → ${item.total
            .toFixed(2)
            .replace(".", ",")} €`
        );
      });
      lines.push(``);
    } else {
      lines.push(`✨ Extras opcionales: ninguno`);
      lines.push(``);
    }

    lines.push(`Subtotal (sin IVA): ${quote.subtotal.toFixed(2).replace(".", ",")} €`);
    lines.push(`IVA (21%): ${quote.iva.toFixed(2).replace(".", ",")} €`);
    lines.push(`✅ TOTAL (con IVA): ${quote.total.toFixed(2).replace(".", ",")} €`);
    lines.push(``);
    lines.push(`Si quieres, Lucía te lo deja por escrito y lo cerráis por WhatsApp.`);

    return lines.join("\n");
  }

  return "Perfecto, seguimos con el presupuesto.";
}

export function answerGeneralQuestion(text: string, whatsapp: string): string {
  const t = norm(text);
  if (/(tiempo|tard[áa]is|plazo|entrega|duraci[oó]n)/i.test(t)) {
    return (
      "Para darte un plazo exacto lo mejor es que lo confirme Lucía.\n\n" +
      `Pulsa aquí y te atiende directamente: ${whatsapp}`
    );
  }

  return (
    "En Lucialco Orlas hacemos orlas escolares completas: diseño (plantilla o exclusiva), retoque, impresión y entrega.\n" +
    "Si me dices el tipo de orla o el colegio, te orientamos mejor o preparamos presupuesto.\n\n" +
    `Si prefieres hablar con alguien, aquí está WhatsApp: ${whatsapp}`
  );
}

export function isGreeting(text: string): boolean {
  const t = norm(text);
  return /^(hola|buenas|hello|hey|holi|buenos d[ií]as|buenas tardes|buenas noches)\b/.test(t);
}
