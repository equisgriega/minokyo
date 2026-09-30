import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE = process.env.APP_URL || "http://localhost:3000";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const GENDER: Record<string, string> = { kiz: "female", erkek: "male", unisex: "unisex" };

/**
 * Meta/Google/TikTok uyumlu ürün katalog feed'i (RSS 2.0).
 * Her BEDEN (varyant) ayrı bir item; item_group_id ile aynı ürün gruplanır.
 * Meta Commerce Manager'da "Veri Kaynağı > Planlı feed" olarak bu URL'i ver:
 *   https://<alanadi>/catalog.xml
 */
export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { size: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const items: string[] = [];
  for (const p of products) {
    const image = p.images[0] ? `${BASE}${encodeURI(p.images[0].url)}` : "";
    const price = (p.price / 100).toFixed(2) + " TRY";
    const link = `${BASE}/urun/${p.slug}`;
    for (const v of p.variants) {
      const available = v.stock > 0 ? "in stock" : "out of stock";
      items.push(`    <item>
      <g:id>${esc(v.sku)}</g:id>
      <g:item_group_id>${esc(p.slug)}</g:item_group_id>
      <g:title>${esc(`${p.name} - ${v.size} Yaş`)}</g:title>
      <g:description>${esc(p.description)}</g:description>
      <g:link>${esc(link)}</g:link>
      <g:image_link>${esc(image)}</g:image_link>
      <g:availability>${available}</g:availability>
      <g:quantity_to_sell_on_facebook>${v.stock}</g:quantity_to_sell_on_facebook>
      <g:condition>new</g:condition>
      <g:price>${esc(price)}</g:price>
      <g:brand>minokyo</g:brand>
      <g:size>${esc(`${v.size} Yaş`)}</g:size>
      <g:age_group>kids</g:age_group>
      <g:gender>${GENDER[p.gender] ?? "unisex"}</g:gender>
      <g:google_product_category>5424</g:google_product_category>
    </item>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>minokyo Ürün Kataloğu</title>
    <link>${esc(BASE)}</link>
    <description>minokyo çocuk giyim ürün feed'i</description>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
    },
  });
}
