import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard, { CardProduct } from "@/components/ProductCard";
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
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: true,
      category: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const cards: CardProduct[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    gender: p.gender,
    image: p.images[0]?.url ?? "/products/p1.jpeg",
    categoryName: p.category?.name,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
  }));

  const active = kategori || cinsiyet || "all";

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-[#5a2e86]">Koleksiyon</h1>
        <p className="text-[#6b6280]">{cards.length} ürün</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.q}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
              active === f.key
                ? "bg-[#5a2e86] text-white border-[#5a2e86]"
                : "bg-[#ffffff] text-[#6b6280] border-[#e3daf0] hover:border-[#7a4fb0]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {cards.length === 0 ? (
        <p className="text-center text-[#6b6280] py-16">Bu filtreye uygun ürün bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
          {cards.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
