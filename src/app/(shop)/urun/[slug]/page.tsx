import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductDetail from "@/components/ProductDetail";
import ProductCard, { CardProduct } from "@/components/ProductCard";
import type { Prisma } from "@prisma/client";

// ISR: ürün sayfaları CDN'den servis edilir, 2 dk'da bir (ve admin'de ürün/stok değişince) tazelenir.
export const revalidate = 120;

// Bilinen ürünleri build'de önceden üret (CDN'den anında). Yeni ürünler ilk ziyarette üretilir.
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { size: "asc" } },
      category: true,
    },
  });

  if (!product) notFound();

  const cardInclude = {
    images: { orderBy: { position: "asc" as const }, take: 1 },
    variants: true,
    category: true,
  };
  const toCard = (p: {
    slug: string;
    name: string;
    price: number;
    gender: string;
    images: { url: string }[];
    category: { name: string } | null;
    variants: { stock: number }[];
  }): CardProduct => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    gender: p.gender,
    image: p.images[0]?.url ?? "/products/p1.jpeg",
    categoryName: p.category?.name,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
  });

  // Bağımsız sorguları tek seferde paralel çalıştır (daha hızlı)
  const [manualRelated, ordersWithProduct] = await Promise.all([
    // 1) Yönetim panelinden manuel bağlanan ürünler (öncelikli)
    prisma.product.findMany({
      where: { active: true, relatedTo: { some: { productId: product.id } } },
      include: cardInclude,
      take: 8,
    }),
    // "Bunu alanlar" için: bu ürünün geçtiği tamamlanmış siparişler
    prisma.orderItem.findMany({
      where: {
        productId: product.id,
        order: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      },
      select: { orderId: true },
    }),
  ]);

  // --- "Bunu Tamamla" ---
  let relatedCards: CardProduct[];
  if (manualRelated.length > 0) {
    relatedCards = manualRelated.map(toCard);
  } else {
    // 2) Manuel bağlantı yoksa otomatik kombin önerisi (kategori/cinsiyete göre)
    const currentCat = product.category?.slug;
    const complementCat =
      currentCat === "takimlar" ? "pantolonlar" : currentCat === "pantolonlar" ? "takimlar" : "ust-giyim";
    const relWhere: Prisma.ProductWhereInput = {
      active: true,
      slug: { not: product.slug },
      OR: [{ category: { slug: complementCat } }, { gender: product.gender }],
    };
    const related = await prisma.product.findMany({
      where: relWhere,
      include: cardInclude,
      take: 4,
    });
    relatedCards = related.map(toCard);
  }

  // --- "Bunu Alanlar Bunları da Aldı" (sipariş geçmişinden) ---
  let alsoBoughtCards: CardProduct[] = [];
  const orderIds = [...new Set(ordersWithProduct.map((o) => o.orderId))];
  if (orderIds.length > 0) {
    const grouped = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: { orderId: { in: orderIds }, productId: { not: product.id } },
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 8,
    });
    const ids = grouped.map((g) => g.productId).filter((v): v is string => Boolean(v));
    if (ids.length > 0) {
      const bought = await prisma.product.findMany({
        where: { id: { in: ids }, active: true },
        include: cardInclude,
      });
      // Sıklık sırasını koru
      const order = new Map(ids.map((id, i) => [id, i]));
      alsoBoughtCards = bought
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
        .slice(0, 4)
        .map(toCard);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <nav className="text-sm text-[#6b6b6b] mb-6">
        <Link href="/" className="hover:underline">Ana Sayfa</Link>
        {" / "}
        <Link href="/urunler" className="hover:underline">Ürünler</Link>
        {" / "}
        <span className="text-[#111111]">{product.name}</span>
      </nav>

      <ProductDetail
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price,
          gender: product.gender,
          categoryName: product.category?.name,
          images: product.images.map((i) => i.url),
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            stock: v.stock,
          })),
        }}
      />

      {relatedCards.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-bold uppercase tracking-[0.06em] text-[#111111] mb-6">Kombini Tamamla</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {relatedCards.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}

      {alsoBoughtCards.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-bold uppercase tracking-[0.06em] text-[#111111] mb-6">Bunu Alanlar Bunları da Aldı</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {alsoBoughtCards.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
