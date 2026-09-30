"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { tlToKurus } from "@/lib/money";
import { revalidatePath } from "next/cache";

const SIZES = ["2", "3", "4", "5", "6"];

// Basit CSV ayrıştırıcı (; veya , ayracı; metinde ayraç kullanmayın).
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const delim = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delim).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(delim);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

export type ImportResult = { created: number; skipped: number; errors: string[] };

export async function importProducts(formData: FormData): Promise<ImportResult> {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  const text = String(formData.get("csv") || "");
  const rows = parseCSV(text);
  const result: ImportResult = { created: 0, skipped: 0, errors: [] };

  // Kategori slug -> id
  const cats = await prisma.category.findMany();
  const catMap = new Map(cats.map((c) => [c.slug, c.id]));

  for (const r of rows) {
    const slug = r.slug?.trim();
    const name = r.name?.trim();
    if (!slug || !name) {
      result.errors.push(`Eksik slug/name: ${JSON.stringify(r).slice(0, 60)}`);
      continue;
    }
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) {
      result.skipped++;
      continue;
    }
    const priceTL = parseFloat(r.price || "0");
    try {
      await prisma.product.create({
        data: {
          name,
          slug,
          description: r.description || "",
          price: tlToKurus(priceTL),
          gender: r.gender || "unisex",
          categoryId: r.category ? catMap.get(r.category.trim()) ?? null : null,
          images: r.image ? { create: [{ url: r.image.trim(), position: 0, alt: name }] } : undefined,
          variants: {
            create: SIZES.map((size) => ({
              size,
              sku: `${slug}-${size}`,
              stock: Math.max(0, parseInt(r[`stok${size}`] || "0", 10) || 0),
              lowStockAt: 3,
            })),
          },
        },
      });
      result.created++;
    } catch (e) {
      result.errors.push(`${slug}: ${e instanceof Error ? e.message : "hata"}`);
    }
  }

  revalidatePath("/admin/products");
  return result;
}

// useActionState için sarmalayıcı (prevState, formData)
export async function importAction(
  _prev: ImportResult | null,
  formData: FormData
): Promise<ImportResult> {
  return importProducts(formData);
}
