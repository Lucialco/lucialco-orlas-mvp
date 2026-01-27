export type QuoteInput = {
  alumnos: number;
  tipo: "plantilla" | "exclusiva";
  extras?: {
    beca?: boolean;
    taza?: boolean;
    sobre?: boolean;
  };
};

const IVA = 0.21;

// ⚠️ Ajusta estos precios a los reales de Lucialco
const PRICE = {
  plantilla: 12.5,
  exclusiva: 14.5,
  extras: {
    beca: 1.2,
    taza: 6.9,
    sobre: 0.8,
  },
};

export function calcQuote(input: QuoteInput) {
  const { alumnos, tipo, extras = {} } = input;

  const base = alumnos * PRICE[tipo];

  const extrasTotal =
    (extras.beca ? alumnos * PRICE.extras.beca : 0) +
    (extras.taza ? alumnos * PRICE.extras.taza : 0) +
    (extras.sobre ? alumnos * PRICE.extras.sobre : 0);

  const subtotal = base + extrasTotal;
  const iva = subtotal * IVA;
  const total = subtotal + iva;

  return {
    alumnos,
    tipo,
    base,
    extrasTotal,
    subtotal,
    iva,
    total,
  };
}
