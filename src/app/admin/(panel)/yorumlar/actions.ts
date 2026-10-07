"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function refresh(reviewId: string) {
  const r = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { product: { select: { slug: true } } },
  });
  revalidatePath("/admin/yorumlar");
  revalidatePath("/");
  if (r) revalidatePath(`/urun/${r.product.slug}`);
}

export async function approveReview(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  const id = String(formData.get("id"));
  await prisma.review.update({ where: { id }, data: { approved: true } });
  await refresh(id);
}

export async function unpublishReview(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  const id = String(formData.get("id"));
  await prisma.review.update({ where: { id }, data: { approved: false } });
  await refresh(id);
}

export async function deleteReview(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  const id = String(formData.get("id"));
  const r = await prisma.review.findUnique({ where: { id }, select: { product: { select: { slug: true } } } });
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/yorumlar");
  revalidatePath("/");
  if (r) revalidatePath(`/urun/${r.product.slug}`);
}
