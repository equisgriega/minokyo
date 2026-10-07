import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard, { CardProduct } from "@/components/ProductCard";
import { cardInclude, toCard } from "@/lib/cards";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "all", label: "Tümü", q: "/urunler" },
  { key: "kiz", label: "Kız", q: "/urunler?cinsiyet=kiz" },
  { key: "erkek", label: "Erkek", q: "/urunler?cinsiyet=erkek" },
  { key: "takimlar", label: "Takımlar", q: "/urunler?kategori=takimlar" },
  { key: "ust-giyim", label: "Üst Giyim", q: "/urunler?kategori=ust-giyim" },
  { key: "pantolonlar", label: "Pantolonlar", q: "/urunler?kategori=pantolonlar" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cinsiyet?: string; kategori?: string }>;
}) {
  const { cinsiyet, kategori } = await searchParams;

  const where: Prisma.ProductWhereInput = { active: true };
  if (cinsiyet) where.gender = cinsiyet;
  if (kategori) where.category = { slug: kategori };

  const products = await prisma.product.findMany({
    where,
    include: cardInclude,
    orderBy: { createdAt: "asc" },
  });

  const cards: CardProduct[] = products.map(toCard);

  const active = kategori || cinsiyet || "all";
  const activeLabel = FILTERS.find((f) => f.key === active)?.label;
  const title = active === "all" || !activeLabel ? "Tüm Ürünler" : activeLabel;

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 md:py-12">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-lg md:text-xl font-bold uppercase tracking-[0.06em] text-ink">{title}</h1>
        <p className="text-[13px] text-muted mt-1">{cards.length} ürün</p>
      </div>

      <div className="flex gap-2 overflow-x-auto md:flex-wrap md:justify-center -mx-5 px-5 md:mx-0 md:px-0 mb-6 md:mb-8 [scrollbar-width:none]">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.q}
            className={`shrink-0 px-4 py-2.5 rounded-none text-[13px] font-medium whitespace-nowrap border transition ${
              active === f.key
                ? "bg-ink text-white border-ink"
                : "bg-white text-ink border-line hover:border-ink"
            }`}
          >
            {f.label}
          </Link>
        ))}
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
