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
  const found = coupons.find((c) => c.active && normalize(c.code) === code);
  return found || null;
}

export function applyCoupon(subtotalSinIva: number, codeRaw?: string | null) {
  const code = normalize(codeRaw || "");
  if (!code) {
    return {
      couponProvided: false,
      couponValid: true,
      couponApplied: null as string | null,
      discountSinIva: 0,
      subtotalConDescuentoSinIva: subtotalSinIva,
    };
  }

  const coupon = getCoupon(code);
  if (!coupon) {
    return {
      couponProvided: true,
      couponValid: false,
      couponApplied: null as string | null,
      discountSinIva: 0,
      subtotalConDescuentoSinIva: subtotalSinIva,
    };
  }

  let discount =
    coupon.type === "percent"
      ? subtotalSinIva * (coupon.value / 100)
      : coupon.value;

  discount = Math.max(0, Math.min(discount, subtotalSinIva));

  return {
    couponProvided: true,
    couponValid: true,
    couponApplied: normalize(coupon.code),
    discountSinIva: round2(discount),
    subtotalConDescuentoSinIva: round2(subtotalSinIva - discount),
  };
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
