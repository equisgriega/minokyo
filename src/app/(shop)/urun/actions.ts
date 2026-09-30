"use server";

import { prisma } from "@/lib/prisma";

/** Tükenen beden için müşteri e-postasını kaydeder; stok gelince bilgilendirilir. */
export async function requestStockNotify(
  variantId: string,
  email: string
): Promise<{ ok: boolean; message: string }> {
  const e = email.trim().toLowerCase();
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return { ok: false, message: "Geçerli bir e-posta girin." };
  }
  try {
    await prisma.stockNotify.upsert({
      where: { email_variantId: { email: e, variantId } },
      update: { notified: false },
      create: { email: e, variantId },
    });
    return { ok: true, message: "Harika! Stok gelince sana e-posta göndereceğiz. 💌" };
  } catch {
    return { ok: false, message: "Bir hata oluştu, tekrar dene." };
  }
}
