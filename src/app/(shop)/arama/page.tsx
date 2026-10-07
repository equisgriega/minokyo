import { prisma } from "@/lib/prisma";
import ProductCard, { CardProduct } from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Arama — minokyo" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  let cards: CardProduct[] = [];
  if (query) {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: true,
        category: true,
      },
    });
    cards = products.map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
      gender: p.gender,
      image: p.images[0]?.url ?? "/products/p1.jpeg",
      categoryName: p.category?.name,
      totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
    }));
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <form action="/arama" className="max-w-xl mx-auto mb-8">
        <div className="flex gap-2">
          <input
            name="q"
            defaultValue={query}
            autoFocus
            placeholder="Ürün ara... (örn. sweatshirt, pantolon)"
            className="flex-1 px-4 py-3 rounded-none border border-[#e5e5e5] bg-[#ffffff] focus:outline-none focus:border-[#444444]"
          />
          <button className="px-6 py-3 rounded-none bg-[#111111] text-white font-semibold hover:bg-[#444444] transition">
            Ara
          </button>
        </div>
      </form>

      {query && (
        <p className="text-center text-[#6b6b6b] mb-6">
          &quot;{query}&quot; için {cards.length} sonuç
        </p>
      )}

      {query && cards.length === 0 ? (
        <p className="text-center text-[#6b6b6b] py-10">Sonuç bulunamadı. Farklı bir kelime dene.</p>
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
