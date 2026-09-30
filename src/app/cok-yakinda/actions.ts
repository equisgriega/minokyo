"use server";

import { prisma } from "@/lib/prisma";

export async function subscribe(formData: FormData): Promise<{ ok: boolean; msg: string }> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, msg: "Geçerli bir e-posta girin." };
  }
  try {
    await prisma.subscriber.upsert({ where: { email }, update: {}, create: { email } });
    return { ok: true, msg: "Teşekkürler! Açılışta ilk sen haberdar olacaksın 💛" };
  } catch {
    return { ok: false, msg: "Bir hata oluştu, tekrar dene." };
  }
}
