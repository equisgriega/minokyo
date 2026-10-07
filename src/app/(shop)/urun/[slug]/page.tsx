import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductDetail from "@/components/ProductDetail";
import ProductCard, { CardProduct } from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import { cardInclude, toCard } from "@/lib/cards";
import type { Prisma } from "@prisma/client";

// ISR: ürün sayfaları CDN'den servis edilir, 2 dk'da bir (ve admin'de ürün/stok/yorum değişince) tazelenir.
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

  // Bağımsız sorguları tek seferde paralel çalıştır (daha hızlı)
  const [manualRelated, ordersWithProduct, reviews] = await Promise.all([
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
    // Onaylı müşteri yorumları
    prisma.review.findMany({
      where: { productId: product.id, approved: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, rating: true, comment: true, size: true, createdAt: true },
    }),
  ]);

  // --- "Kombini Tamamla" ---
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

  const ratingAvg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  // Google ürün zengin sonucu (fiyat + gerçek yorum puanı varsa)
  const appUrl = process.env.APP_URL || "https://minokyo.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => `${appUrl}${i.url}`),
    sku: product.slug,
    brand: { "@type": "Brand", name: "minokyo" },
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: (product.price / 100).toFixed(2),
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${appUrl}/urun/${product.slug}`,
    },
    ...(reviews.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: ratingAvg.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  return (
    <div className="max-w-6xl mx-auto px-5 pt-0 pb-10 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="hidden md:block text-[13px] text-muted mb-6">
        <Link href="/" className="hover:underline">Ana Sayfa</Link>
        {" / "}
        <Link href="/urunler" className="hover:underline">Ürünler</Link>
        {" / "}
        <span className="text-ink">{product.name}</span>
      </nav>

      <ProductDetail
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price,
          compareAt: product.compareAt,
          gender: product.gender,
          categoryName: product.category?.name,
          material: product.material,
          care: product.care,
          fit: product.fit,
          images: product.images.map((i) => i.url),
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            stock: v.stock,
          })),
        }}
        rating={reviews.length ? { avg: ratingAvg, count: reviews.length } : null}
      />

      <ProductReviews
        productId={product.id}
        sizes={product.variants.map((v) => v.size)}
        reviews={reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        avg={ratingAvg}
      />

      {relatedCards.length > 0 && (
        <section className="mt-14 md:mt-20">
          <h2 className="text-base md:text-lg font-bold uppercase tracking-[0.06em] text-ink mb-5 text-center">Kombini Tamamla</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8">
            {relatedCards.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}

      {alsoBoughtCards.length > 0 && (
        <section className="mt-14 md:mt-20">
          <h2 className="text-base md:text-lg font-bold uppercase tracking-[0.06em] text-ink mb-5 text-center">Bunu Alanlar Bunları da Aldı</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8">
            {alsoBoughtCards.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
