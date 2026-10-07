import { z } from "zod";

const item = z.object({ variantId: z.string().min(1).max(64), qty: z.number().int().min(1).max(20) });

export const orderSchema = z.object({
  items: z.array(item).min(1, "Sepetiniz boş.").max(30),
  customer: z.object({
    email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin.").max(120),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+()\s-]{10,20}$/, "Geçerli bir telefon numarası girin."),
    fullName: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalı.").max(80),
    line: z.string().trim().min(5, "Adresinizi eksiksiz yazın.").max(300),
    city: z.string().trim().min(2, "İl girin.").max(40),
    district: z.string().trim().min(2, "İlçe girin.").max(40),
    zip: z.string().trim().max(10).optional(),
    note: z.string().trim().max(500).optional(),
  }),
  paymentMethod: z.enum(["card", "transfer", "door"], { message: "Geçerli bir ödeme yöntemi seçin." }),
  couponCode: z.string().trim().max(30).optional(),
});

export const cartSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  name: z.string().trim().max(80).optional(),
  items: z.array(item).min(1).max(30),
});

/** Aynı beden birden çok satırda gelirse birleştirir (stok kontrolünü atlatmayı önler). */
export function mergeItems(items: { variantId: string; qty: number }[]) {
  const merged = new Map<string, number>();
  for (const it of items) merged.set(it.variantId, (merged.get(it.variantId) ?? 0) + it.qty);
  return [...merged].map(([variantId, qty]) => ({ variantId, qty }));
}
