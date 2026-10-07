import { prisma } from "./prisma";
import { formatTL } from "./money";
import { calcDiscount } from "./pricing";

export type CouponResult =
  | { ok: true; discount: number; code: string; label: string }
  | { ok: false; error: string };

/** Kuponu değerlendirir ve indirim tutarını (kuruş) döner. subtotal: kuruş */
export async function evaluateCoupon(rawCode: string, subtotal: number): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Kupon kodu girin." };

  const c = await prisma.coupon.findUnique({ where: { code } });
  if (!c || !c.active) return { ok: false, error: "Kupon geçersiz." };
  if (c.expiresAt && c.expiresAt < new Date()) return { ok: false, error: "Kuponun süresi dolmuş." };
  if (c.usageLimit != null && c.usedCount >= c.usageLimit)
    return { ok: false, error: "Kupon kullanım limiti dolmuş." };
  if (subtotal < c.minSubtotal)
    return { ok: false, error: `Bu kupon ${formatTL(c.minSubtotal)} ve üzeri sepetlerde geçerli.` };

  const discount = calcDiscount(c, subtotal);

  const label =
    c.type === "percent" ? `%${c.value} indirim` : `${formatTL(c.value)} indirim`;

  return { ok: true, discount, code: c.code, label };
}
