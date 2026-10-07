// Sepet tutarı hesapları — sunucu (sipariş) ve istemci (ödeme formu) aynı kuralları kullanır.
import { FREE_SHIP_LIMIT, SHIP_COST } from "./money";

export type CouponRule = { type: string; value: number };

/** Kupon indirimi (kuruş). Yüzde: yuvarlanır; sabit: ara toplamı geçemez. */
export function calcDiscount(coupon: CouponRule, subtotal: number): number {
  if (subtotal <= 0) return 0;
  if (coupon.type === "percent") {
    const pct = Math.min(100, Math.max(0, coupon.value));
    return Math.round((subtotal * pct) / 100);
  }
  return Math.min(Math.max(0, coupon.value), subtotal);
}

/** Kargo: eşik ve üzeri bedava (eşik indirimsiz ara toplama göre), boş sepette 0. */
export function calcShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIP_LIMIT ? 0 : SHIP_COST;
}

export function calcTotals(subtotal: number, discount = 0) {
  const shipping = calcShipping(subtotal);
  return { subtotal, discount, shipping, total: Math.max(0, subtotal - discount) + shipping };
}
