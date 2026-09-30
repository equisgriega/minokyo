import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductDetail from "@/components/ProductDetail";
import ProductCard, { CardProduct } from "@/components/ProductCard";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

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

  // Kombin önerisi: takım aldıysa pantolon, pantolon/üst aldıysa takım öner
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
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: true,
      category: true,
    },
    take: 4,
  });
  const relatedCards: CardProduct[] = related.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    gender: p.gender,
    image: p.images[0]?.url ?? "/products/p1.jpeg",
    categoryName: p.category?.name,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
  }));

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <nav className="text-sm text-[#6b6280] mb-6">
        <Link href="/" className="hover:underline">Ana Sayfa</Link>
        {" / "}
        <Link href="/urunler" className="hover:underline">Ürünler</Link>
        {" / "}
        <span className="text-[#2f2545]">{product.name}</span>
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
          <h2 className="font-display text-2xl font-bold text-[#5a2e86] mb-6">Bunu Tamamla ✨</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {relatedCards.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
