import { prisma } from "@/lib/prisma";
import ProductCard, { CardProduct } from "@/components/ProductCard";
import { cardInclude, toCard } from "@/lib/cards";

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
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: cardInclude,
    });
    cards = products.map(toCard);
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
            className="flex-1 px-4 py-3 rounded-none border border-line bg-card focus:outline-none focus:border-ink-2"
          />
          <button className="px-6 py-3 rounded-none bg-ink text-white font-semibold hover:bg-ink-2 transition">
            Ara
          </button>
        </div>
      </form>

      {query && (
        <p className="text-center text-muted mb-6">
          &quot;{query}&quot; için {cards.length} sonuç
        </p>
      )}

      {query && cards.length === 0 ? (
        <p className="text-center text-muted py-10">Sonuç bulunamadı. Farklı bir kelime dene.</p>
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
