import "server-only";

export type Coupon =
  | { code: string; type: "percent"; value: number; active: boolean }
  | { code: string; type: "amount"; value: number; active: boolean };

function normalize(code: string) {
  return code.trim().toUpperCase();
}

export function getCoupon(codeRaw?: string | null): Coupon | null {
  if (!codeRaw) return null;

  const raw = process.env.LUCIALCO_COUPONS_JSON || "[]";
  let coupons: Coupon[] = [];

  try {
    coupons = JSON.parse(raw);
  } catch {
    return null;
  }

  const code = normalize(codeRaw);

  const found = coupons.find(
    (c) => normalize(c.code) === code && c.active
  );

  return found || null;
}

export function applyCoupon(subtotalSinIva: number, coupon: Coupon | null) {
  if (!coupon) {
    return { discountSinIva: 0, subtotalConDescuentoSinIva: subtotalSinIva, couponApplied: null as string | null };
  }

  let discountSinIva =
    coupon.type === "percent"
      ? subtotalSinIva * (coupon.value / 100)
      : coupon.value;

  // Nunca puede superar el subtotal
  discountSinIva = Math.max(0, Math.min(discountSinIva, subtotalSinIva));

  return {
    discountSinIva,
    subtotalConDescuentoSinIva: subtotalSinIva - discountSinIva,
    couponApplied: coupon.code.trim().toUpperCase(),
  };
}
