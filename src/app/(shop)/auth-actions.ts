"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSession, clearSession, getSession } from "@/lib/auth";
import { rateLimitIp } from "@/lib/security";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().trim().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta girin"),
  phone: z.string().trim().optional(),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export async function registerCustomer(formData: FormData) {
  // Aynı IP'den saatte en fazla 5 hesap
  if (!(await rateLimitIp("register", 5, 3600))) redirect("/kayit?error=rate");

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/kayit?error=invalid");
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/kayit?error=exists");
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, phone: phone || null, password: hashed, role: "CUSTOMER" },
  });

  await setSession(user.id, user.role, user.sessionVersion);
  redirect("/hesabim");
}

export async function loginCustomer(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  // Kaba kuvvet koruması: IP başına 15 dk'da 10, hesap başına 15 dk'da 5 deneme
  if (!(await rateLimitIp("login", 10, 900)) || !(await rateLimitIp("login:" + email, 5, 900))) {
    redirect("/giris?error=rate");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    redirect("/giris?error=1");
  }
  // Yönetici hesabı yalnızca /admin/login'den girer
  if (user.role === "ADMIN") redirect("/admin/login");

  await setSession(user.id, user.role, user.sessionVersion);
  redirect("/hesabim");
}

export async function logoutCustomer() {
  await clearSession();
  redirect("/");
}

/**
 * Hesabı kalıcı olarak siler (Google Play hesap silme zorunluluğu).
 * Siparişler yasal saklama yükümlülüğü (fatura/VUK) nedeniyle silinmez; hesapla bağı koparılır.
 */
export async function deleteAccount(formData: FormData): Promise<{ ok: false; message: string } | void> {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.role === "ADMIN") return { ok: false, message: "Yönetici hesabı buradan silinemez." };

  if (!(await rateLimitIp("delete-account", 5, 3600))) {
    return { ok: false, message: "Çok fazla deneme. Lütfen daha sonra tekrar dene." };
  }
  if (formData.get("confirm") !== "on") return { ok: false, message: "Silme işlemini onaylaman gerekiyor." };

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || !(await bcrypt.compare(String(formData.get("password") || ""), user.password))) {
    return { ok: false, message: "Şifre hatalı." };
  }

  await prisma.$transaction([
    prisma.order.updateMany({ where: { userId: user.id }, data: { userId: null } }),
    // Adresler, şifre sıfırlama kayıtları ilişki üzerinden (cascade) silinir
    prisma.user.delete({ where: { id: user.id } }),
  ]);
  await clearSession();
  redirect("/?hesap=silindi");
}
