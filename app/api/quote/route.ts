import { NextResponse } from "next/server";
import { applyCoupon } from "@/lib/coupons";

export const runtime = "nodejs";

type ModalidadOrla =
  | "local_plantilla"
  | "local_exclusiva"
  | "digital_plantilla"
  | "digital_exclusiva";

const PRICE = {
  local_plantilla: 11.5,
  local_exclusiva: 15,
  digital_plantilla: 9,
  digital_exclusiva: 10.5,
  envio_nacional: 15,

  extra_beca: 5,
  extra_taza: 9.5,
  extra_sobre: 3,
  extra_fotos_recuerdo: 4.5,

  iva_pct: 21,
} as const;

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export async function POST(req: Request) {
  const body = await req.json();

  const alumnos = Number(body?.alumnos || 0);
  const modalidad = body?.modalidad as ModalidadOrla | undefined;
  const couponCode = String(body?.couponCode || "").trim();

  const extras = body?.extras || {};
  const extraBeca = !!extras.beca_graduacion;
  const extraTaza = !!extras.taza;
  const extraSobre = !!extras.sobre_reforzado;
  const extraFotos = !!extras.fotos_recuerdo;

  if (!modalidad) {
    return NextResponse.json({ error: "modalidad requerida" }, { status: 400 });
  }
  if (!Number.isFinite(alumnos) || alumnos <= 0) {
    return NextResponse.json({ error: "alumnos inválido" }, { status: 400 });
  }

  const unitBase = PRICE[modalidad];
  const baseSinIva = alumnos * unitBase;

  const extrasSinIva =
    alumnos * (extraBeca ? PRICE.extra_beca : 0) +
    alumnos * (extraTaza ? PRICE.extra_taza : 0) +
    alumnos * (extraSobre ? PRICE.extra_sobre : 0) +
    alumnos * (extraFotos ? PRICE.extra_fotos_recuerdo : 0);

  const isDigital = modalidad.startsWith("digital");
  const envioSinIva = isDigital ? PRICE.envio_nacional : 0;

  const subtotalSinIva = baseSinIva + extrasSinIva + envioSinIva;

  // ✅ cupón antes de IVA
  const coupon = applyCoupon(subtotalSinIva, couponCode);

  const iva = coupon.subtotalConDescuentoSinIva * (PRICE.iva_pct / 100);
  const totalConIva = coupon.subtotalConDescuentoSinIva + iva;

  return NextResponse.json({
    alumnos,
    modalidad,
    unitBase: round2(unitBase),
    baseSinIva: round2(baseSinIva),
    extrasSinIva: round2(extrasSinIva),
    envioSinIva: round2(envioSinIva),
    subtotalSinIva: round2(subtotalSinIva),

    couponProvided: coupon.couponProvided,
    couponValid: coupon.couponValid,
    couponApplied: coupon.couponApplied,
    discountSinIva: round2(coupon.discountSinIva),
    subtotalConDescuentoSinIva: round2(coupon.subtotalConDescuentoSinIva),

    ivaPct: PRICE.iva_pct,
    iva: round2(iva),
    totalConIva: round2(totalConIva),
  });
}
