import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Stars from "@/components/Stars";
import { approveReview, deleteReview, unpublishReview } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReviewsAdminPage() {
  const reviews = await prisma.review.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { product: { select: { name: true, slug: true } } },
    take: 200,
  });
  const pending = reviews.filter((r) => !r.approved);
  const published = reviews.filter((r) => r.approved);

  const Row = ({ r }: { r: (typeof reviews)[number] }) => (
    <div className="bg-white border border-line p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars value={r.rating} />
        <span className="text-sm font-semibold">{r.name}</span>
        <span className="text-xs text-muted">{r.email}</span>
        {r.size && <span className="text-xs text-muted">· {r.size} yaş</span>}
        <span className="ml-auto text-xs text-muted">{r.createdAt.toLocaleDateString("tr-TR")}</span>
      </div>
      <Link href={`/urun/${r.product.slug}`} target="_blank" className="text-xs underline text-muted">
        {r.product.name}
      </Link>
      <p className="text-sm mt-2 whitespace-pre-line">{r.comment}</p>
      <div className="flex gap-2 mt-4">
        {r.approved ? (
          <form action={unpublishReview}>
            <input type="hidden" name="id" value={r.id} />
            <button className="px-4 py-2 border border-line text-sm font-semibold hover:border-ink">Yayından Kaldır</button>
          </form>
        ) : (
          <form action={approveReview}>
            <input type="hidden" name="id" value={r.id} />
            <button className="px-4 py-2 bg-ink text-white text-sm font-semibold hover:bg-ink-2">Onayla & Yayınla</button>
          </form>
        )}
        <form action={deleteReview}>
          <input type="hidden" name="id" value={r.id} />
          <button className="px-4 py-2 text-sm text-red-700 hover:underline">Sil</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Müşteri Yorumları</h1>
      <p className="text-sm text-muted mb-8">
        Müşteriler ürün sayfasından yorum bırakır; burada onaylananlar ürün sayfasında ve ana sayfada görünür.
      </p>

      <h2 className="font-bold mb-3">Onay Bekleyen ({pending.length})</h2>
      <div className="space-y-3 mb-10">
        {pending.length === 0 ? (
          <p className="text-sm text-muted">Bekleyen yorum yok.</p>
        ) : (
          pending.map((r) => <Row key={r.id} r={r} />)
        )}
      </div>

      <h2 className="font-bold mb-3">Yayında ({published.length})</h2>
      <div className="space-y-3">
        {published.length === 0 ? (
          <p className="text-sm text-muted">Henüz yayınlanmış yorum yok.</p>
        ) : (
          published.map((r) => <Row key={r.id} r={r} />)
        )}
      </div>
    </div>
  );
}
