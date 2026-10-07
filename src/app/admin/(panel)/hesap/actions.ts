"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, setSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function changePassword(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");
  const confirm = String(formData.get("confirm") || "");

  const user = await prisma.user.findUnique({ where: { id: admin!.id } });
  if (!user) redirect("/admin/login");

  if (!(await bcrypt.compare(current, user!.password))) {
    redirect("/admin/hesap?error=current");
  }
  if (next.length < 8) {
    redirect("/admin/hesap?error=short");
  }
  if (next !== confirm) {
    redirect("/admin/hesap?error=match");
  }

  // Şifre değişince oturum sürümü artar: diğer tüm cihazlardaki oturumlar kapanır,
  // bu cihaz yeni sürümle oturumda kalır.
  const updated = await prisma.user.update({
    where: { id: admin!.id },
    data: { password: await bcrypt.hash(next, 10), sessionVersion: { increment: 1 } },
  });
  await setSession(updated.id, updated.role, updated.sessionVersion);

  redirect("/admin/hesap?ok=1");
}
