"use server";

import { prisma } from "@/lib/prisma";
import { rateLimitIp } from "@/lib/security";

export async function subscribe(formData: FormData): Promise<{ ok: boolean; msg: string }> {
  if (!(await rateLimitIp("subscribe", 10, 3600))) {
    return { ok: false, msg: "Çok fazla deneme. Lütfen daha sonra tekrar dene." };
  }
  const email = String(formData.get("email") || "").trim().toLowerCase().slice(0, 120);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, msg: "Geçerli bir e-posta girin." };
  }
  try {
    await prisma.subscriber.upsert({ where: { email }, update: {}, create: { email } });
    return { ok: true, msg: "Teşekkürler! Açılışta ilk sen haberdar olacaksın" };
  } catch {
    return { ok: false, msg: "Bir hata oluştu, tekrar dene." };
  }
}
