import { applyCoupon } from "./coupons";

export type ProvinciaZona = "MADRID_TOLEDO" | "OTRAS";
export type QuoteTipo = "plantilla" | "exclusiva";

export type QuoteInput = {
  alumnos: number; // nº alumnos (orlas)
  tipo: QuoteTipo; // plantilla / exclusiva
  zona: ProvinciaZona; // Madrid/Toledo vs otras
  envio?: boolean; // si aplica transporte
  couponCode?: string; // ✅ nuevo
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
  const { alumnos, tipo, zona, envio = true, couponCode } = input;

  const unit = PRICE_PER_ALUMNO[zona][tipo];
  const base = alumnos * unit;

  const shipping = envio ? SHIPPING : 0;

  const subtotal = base + shipping; // sin IVA

  // ✅ Cupón (sin IVA) — applyCoupon espera STRING (código), no objeto Coupon
  const { discountSinIva, subtotalConDescuentoSinIva, couponApplied, couponValid } =
    applyCoupon(subtotal, couponCode);

  const iva = subtotalConDescuentoSinIva * IVA;
  const total = subtotalConDescuentoSinIva + iva;

  const perAlumno = total / alumnos;

  return {
    alumnos,
    tipo,
    zona,
    unit, // €/alumno sin IVA
    base, // sin IVA
    shipping, // sin IVA

    subtotal, // sin IVA (antes de cupón)
    discountSinIva, // ✅ descuento sin IVA
    subtotalConDescuentoSinIva, // ✅ sin IVA (tras cupón)

    iva,
    total, // con IVA
    perAlumno, // con IVA

    couponApplied, // ✅ null o código aplicado
    couponValid,   // ✅ true/false (por si quieres mostrar error)
  };
}
