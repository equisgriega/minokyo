"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSession, clearSession } from "@/lib/auth";
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
