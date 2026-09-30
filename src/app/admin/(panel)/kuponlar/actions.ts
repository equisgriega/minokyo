"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { tlToKurus } from "@/lib/money";
import { revalidatePath } from "next/cache";

export async function createCoupon(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const type = String(formData.get("type") || "percent");
  const rawValue = parseFloat(String(formData.get("value")) || "0");
  const minTL = parseFloat(String(formData.get("minSubtotal")) || "0");
  const usageLimitRaw = String(formData.get("usageLimit") || "").trim();
  const expiresRaw = String(formData.get("expiresAt") || "").trim();

  if (!code || rawValue <= 0) return;

  await prisma.coupon.upsert({
    where: { code },
    update: {
      type,
      value: type === "percent" ? Math.round(rawValue) : tlToKurus(rawValue),
      minSubtotal: tlToKurus(minTL || 0),
      usageLimit: usageLimitRaw ? parseInt(usageLimitRaw, 10) : null,
      expiresAt: expiresRaw ? new Date(expiresRaw) : null,
      active: true,
    },
    create: {
      code,
      type,
      value: type === "percent" ? Math.round(rawValue) : tlToKurus(rawValue),
      minSubtotal: tlToKurus(minTL || 0),
      usageLimit: usageLimitRaw ? parseInt(usageLimitRaw, 10) : null,
      expiresAt: expiresRaw ? new Date(expiresRaw) : null,
    },
  });
  revalidatePath("/admin/kuponlar");
}

export async function toggleCoupon(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  const id = String(formData.get("id"));
  const c = await prisma.coupon.findUnique({ where: { id } });
  if (c) await prisma.coupon.update({ where: { id }, data: { active: !c.active } });
  revalidatePath("/admin/kuponlar");
}

export async function deleteCoupon(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  await prisma.coupon.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/kuponlar");
}
