import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.APP_URL || "https://minokyo.com";

// Günde bir yenilenir; yeni ürünler otomatik eklenir
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });
  const pages = ["", "/urunler", "/hakkimizda", "/iletisim", "/sss", "/iade-teslimat", "/gizlilik", "/mesafeli-satis"];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...products.map((p) => ({
      url: `${BASE}/urun/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
