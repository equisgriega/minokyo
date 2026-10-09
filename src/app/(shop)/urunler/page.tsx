import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import SortMenu from "@/components/SortMenu";
import { cardInclude, toCard } from "@/lib/cards";
import { listingHref, parseSort, sortProducts } from "@/lib/sorting";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string; cinsiyet?: string; kategori?: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "kiz", label: "Kız", cinsiyet: "kiz" },
  { key: "erkek", label: "Erkek", cinsiyet: "erkek" },
  { key: "takimlar", label: "Takımlar", kategori: "takimlar" },
  { key: "ust-giyim", label: "Üst Giyim", kategori: "ust-giyim" },
  { key: "pantolonlar", label: "Pantolonlar", kategori: "pantolonlar" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cinsiyet?: string; kategori?: string; sirala?: string }>;
}) {
  const { cinsiyet, kategori, sirala } = await searchParams;
  const sort = parseSort(sirala);

  const where: Prisma.ProductWhereInput = { active: true };
  if (cinsiyet) where.gender = cinsiyet;
  if (kategori) where.category = { slug: kategori };

  const products = await prisma.product.findMany({ where, include: cardInclude });

  // Satış adetleri yalnızca satışa göre sıralamada gerekir (gerçek, tamamlanmış siparişler)
  let sales = new Map<string, number>();
  if ((sort === "akilli" || sort === "cok-satan") && products.length) {
    const grouped = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        productId: { in: products.map((p) => p.id) },
        order: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      },
      _sum: { qty: true },
    });
    sales = new Map(grouped.filter((g) => g.productId).map((g) => [g.productId!, g._sum.qty ?? 0]));
  }

  const cards = sortProducts(products, sort, sales).map(toCard);

  const active = kategori || cinsiyet || "all";
  const activeLabel = FILTERS.find((f) => f.key === active)?.label;
  const title = active === "all" || !activeLabel ? "Tüm Ürünler" : activeLabel;

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 md:py-12">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-lg md:text-xl font-bold uppercase tracking-[0.06em] text-ink">{title}</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto md:flex-wrap md:justify-center -mx-5 px-5 md:mx-0 md:px-0 mb-5 md:mb-8 [scrollbar-width:none]">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            // Seçili sıralama filtre değişince korunur
            href={listingHref({ cinsiyet: f.cinsiyet, kategori: f.kategori, sirala: sort })}
            className={`shrink-0 px-4 py-2.5 rounded-none text-[13px] font-medium whitespace-nowrap border transition ${
              active === f.key ? "bg-ink text-white border-ink" : "bg-white text-ink border-line hover:border-ink"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 mb-5 md:mb-6">
        <p className="text-[13px] text-muted">{cards.length} ürün bulundu</p>
        <SortMenu current={sort} cinsiyet={cinsiyet} kategori={kategori} />
      </div>

      {cards.length === 0 ? (
        <p className="text-center text-muted py-16">Bu filtreye uygun ürün bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8 md:gap-y-10">
          {cards.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
