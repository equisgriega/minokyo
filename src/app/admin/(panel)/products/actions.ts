"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { tlToKurus } from "@/lib/money";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function updateStock(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  const variantId = String(formData.get("variantId"));
  const stock = Math.max(0, parseInt(String(formData.get("stock")), 10) || 0);

  const before = await prisma.variant.findUnique({
    where: { id: variantId },
    include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
  });
  await prisma.variant.update({ where: { id: variantId }, data: { stock } });

  // Stok 0'dan pozitife geçtiyse "haber ver" bekleyenlere e-posta
  if (before && before.stock === 0 && stock > 0) {
    const waiting = await prisma.stockNotify.findMany({
      where: { variantId, notified: false },
    });
    for (const w of waiting) {
      const link = `${APP_URL}/urun/${before.product.slug}`;
      const html = `<div style="font-family:Arial,sans-serif;padding:20px;color:#2f2545">
        <h2 style="color:#5a2e86">İstediğin ürün stokta! 🎉</h2>
        <p><strong>${before.product.name}</strong> · ${before.size} Yaş bedeni tekrar stoklarda.</p>
        <a href="${link}" style="display:inline-block;margin-top:10px;background:#5a2e86;color:#fff;text-decoration:none;padding:12px 24px;border-radius:100px;font-weight:600">Hemen İncele</a>
      </div>`;
      await sendEmail({
        to: w.email,
        subject: `Stokta! ${before.product.name} (${before.size} Yaş) 🎉`,
        html,
        type: "abandoned_cart",
      });
      await prisma.stockNotify.update({ where: { id: w.id }, data: { notified: true } });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

export async function updateProduct(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const priceTL = parseFloat(String(formData.get("price")) || "0");
  const gender = String(formData.get("gender") || "unisex");
  const active = formData.get("active") === "on";
  const featured = formData.get("featured") === "on";

  await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price: tlToKurus(priceTL),
      gender,
      active,
      featured,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
}
