"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { rateLimitIp } from "@/lib/security";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  // Kaba kuvvet koruması: IP başına 15 dakikada 5 deneme
  if (!(await rateLimitIp("admin-login", 5, 900))) redirect("/admin/login?error=rate");

  const user = await prisma.user.findUnique({ where: { email } });
  const ok =
    user &&
    user.role === "ADMIN" &&
    (await bcrypt.compare(password, user.password));

  if (!ok) {
    redirect("/admin/login?error=1");
  }

  await setSession(user!.id, user!.role, user!.sessionVersion);
  redirect("/admin");
}
