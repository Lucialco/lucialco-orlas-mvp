export type ProvinciaZona = "MADRID_TOLEDO" | "OTRAS";

export type QuoteTipo = "plantilla" | "exclusiva";

export type QuoteInput = {
  alumnos: number;                 // nº alumnos (orlas)
  tipo: QuoteTipo;                 // plantilla / exclusiva
  zona: ProvinciaZona;             // Madrid/Toledo vs otras
  envio?: boolean;                 // si aplica transporte
};

export type ExtraKey = "beca" | "taza" | "sobre" | "fotos_recuerdo";

export const EXTRA_PRICES: Record<ExtraKey, number> = {
  beca: 5,
  taza: 9.5,
  sobre: 3,
  fotos_recuerdo: 4.5,
};

const IVA = 0.21;

// Precios SIN IVA por alumno
const PRICE_PER_ALUMNO = {
  MADRID_TOLEDO: {
    plantilla: 11.5,
    exclusiva: 15.0,
  },
  OTRAS: {
    plantilla: 9.0,
    exclusiva: 10.5,
  },
} as const;

// Transporte SIN IVA (pago único por pedido)
const SHIPPING = 15.0;

export function calcQuote(input: QuoteInput) {
  const { alumnos, tipo, zona, envio = true } = input;

  const unit = PRICE_PER_ALUMNO[zona][tipo];
  const base = alumnos * unit;

  const shipping = envio ? SHIPPING : 0;

  const subtotal = base + shipping;
  const iva = subtotal * IVA;
  const total = subtotal + iva;

  const perAlumno = total / alumnos;

  return {
    alumnos,
    tipo,
    zona,
    unit,        // €/alumno sin IVA
    base,        // sin IVA
    shipping,    // sin IVA
    subtotal,    // sin IVA
    iva,
    total,       // con IVA
    perAlumno,   // con IVA
  };
}

export function calcExtras(alumnos: number, extras: ExtraKey[]) {
  const items = extras.map((key) => {
    const unit = EXTRA_PRICES[key];
    return {
      key,
      unit,
      total: unit * alumnos,
    };
  });

  const total = items.reduce((acc, item) => acc + item.total, 0);

  return { items, total };
}

export function calcQuoteWithExtras(input: QuoteInput & { extras?: ExtraKey[] }) {
  const baseQuote = calcQuote(input);
  const extras = calcExtras(input.alumnos, input.extras ?? []);

  const subtotal = baseQuote.base + baseQuote.shipping + extras.total;
  const iva = subtotal * IVA;
  const total = subtotal + iva;
  const perAlumno = total / input.alumnos;

  return {
    ...baseQuote,
    extras,
    subtotal,
    iva,
    total,
    perAlumno,
  };
}
