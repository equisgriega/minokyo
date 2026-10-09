"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";
import { rateLimit, rateLimitIp } from "@/lib/security";
import { generateResetToken, hashResetToken, isUsableReset, RESET_TTL_MIN } from "@/lib/password-reset";

type Res = { ok: boolean; message: string };

// Kayıtlı olsun olmasın aynı yanıt: e-postanın sistemde olup olmadığı belli edilmez
const GENERIC_OK: Res = {
  ok: true,
  message: "Bu e-posta adresi kayıtlıysa şifre sıfırlama linki gönderdik. Gelen kutunu (ve spam klasörünü) kontrol et.",
};

/** Şifre sıfırlama linki ister. */
export async function requestPasswordReset(formData: FormData): Promise<Res> {
  const email = String(formData.get("email") || "").trim().toLowerCase().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Geçerli bir e-posta gir." };

  // Kötüye kullanım: IP başına saatte 5, aynı e-postaya saatte 3 istek
  if (!(await rateLimitIp("pwreset", 5, 3600)) || !(await rateLimit(`pwreset:${email}`, 3, 3600))) {
    return { ok: false, message: "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar dene." };
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, role: true } });
  if (!user) return GENERIC_OK;

  const { token, tokenHash } = generateResetToken();
  await prisma.$transaction([
    // Önceki kullanılmamış linkler geçersiz olsun (yalnızca en son link çalışır)
    prisma.passwordReset.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordReset.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TTL_MIN * 60 * 1000) },
    }),
  ]);

  const base = process.env.APP_URL || "http://localhost:3000";
  const mail = passwordResetEmail({
    name: user.name,
    url: `${base}/sifre-yenile?t=${encodeURIComponent(token)}`,
    minutes: RESET_TTL_MIN,
  });
  await sendEmail({ to: email, subject: mail.subject, html: mail.html, type: "password_reset" }).catch((e) =>
    console.error("şifre sıfırlama e-postası gönderilemedi", e)
  );
  return GENERIC_OK;
}

const resetSchema = z
  .object({
    token: z.string().min(20).max(200),
    password: z.string().min(8, "Şifre en az 8 karakter olmalı.").max(200),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Şifreler eşleşmiyor.", path: ["confirm"] });

/** Linkteki belirteçle yeni şifreyi kaydeder. */
export async function resetPassword(formData: FormData): Promise<Res> {
  if (!(await rateLimitIp("pwreset-confirm", 10, 3600))) {
    return { ok: false, message: "Çok fazla deneme. Lütfen bir süre sonra tekrar dene." };
  }
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Bilgileri kontrol et." };

  const tokenHash = hashResetToken(parsed.data.token);
  const reset = await prisma.passwordReset.findUnique({ where: { tokenHash } });
  if (!isUsableReset(reset)) {
    return { ok: false, message: "Bu link geçersiz veya süresi dolmuş. Yeni bir sıfırlama linki iste." };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  // Linki atomik olarak "kullanıldı" işaretle: aynı link iki kez kullanılamaz
  const ok = await prisma.$transaction(async (tx) => {
    const claimed = await tx.passwordReset.updateMany({
      where: { id: reset!.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (claimed.count === 0) return false;
    // Şifre değişti → tüm cihazlardaki eski oturumlar kapanır
    await tx.user.update({
      where: { id: reset!.userId },
      data: { password: hashed, sessionVersion: { increment: 1 } },
    });
    await tx.passwordReset.deleteMany({ where: { userId: reset!.userId, usedAt: null } });
    return true;
  });
  if (!ok) return { ok: false, message: "Bu link zaten kullanılmış. Yeni bir sıfırlama linki iste." };

  return { ok: true, message: "Şifren güncellendi. Yeni şifrenle giriş yapabilirsin." };
}
