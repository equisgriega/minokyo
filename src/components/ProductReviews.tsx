"use client";

import { useState } from "react";
import Stars from "./Stars";
import { submitReview } from "@/app/(shop)/urun/actions";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  size: string | null;
  createdAt: string;
};

export default function ProductReviews({
  productId,
  sizes,
  reviews,
  avg,
}: {
  productId: string;
  sizes: string[];
  reviews: Review[];
  avg: number;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("productId", productId);
    fd.set("rating", String(rating));
    setLoading(true);
    const res = await submitReview(fd);
    setLoading(false);
    setMsg({ ok: res.ok, text: res.message });
    if (res.ok) {
      form.reset();
      setRating(0);
    }
  }

  const visible = showAll ? reviews : reviews.slice(0, 4);
  const input =
    "w-full px-4 py-3 border border-line bg-card text-base md:text-sm text-ink placeholder:text-faint focus:outline-none focus:border-ink";

  return (
    <section id="yorumlar" className="mt-14 md:mt-20 scroll-mt-28">
      <div className="text-center mb-6">
        <h2 className="text-base md:text-lg font-bold uppercase tracking-[0.06em] text-ink">Müşteri Yorumları</h2>
        {reviews.length > 0 ? (
          <div className="mt-2 flex items-center justify-center gap-2 text-ink">
            <Stars value={avg} size={16} />
            <span className="text-sm font-semibold">{avg.toFixed(1)}</span>
            <span className="text-sm text-muted">({reviews.length} yorum)</span>
          </div>
        ) : (
          <p className="text-[13px] text-muted mt-2">Bu ürün için henüz yorum yok. İlk yorumu sen yaz!</p>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          {visible.map((r) => (
            <article key={r.id} className="bg-card border border-line-soft p-5">
              <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} />
                <time className="text-[11px] text-muted">
                  {new Date(r.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                </time>
              </div>
              <p className="text-sm text-ink leading-relaxed mt-3">{r.comment}</p>
              <p className="text-[12px] text-muted mt-3">
                <span className="font-semibold text-ink">{r.name}</span>
                {r.size && <> · {r.size} yaş bedeni aldı</>}
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {reviews.length > 4 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-3 border border-line text-[13px] font-semibold uppercase tracking-[0.06em] text-ink hover:border-ink transition"
          >
            Tüm Yorumlar ({reviews.length})
          </button>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="px-6 py-3 border border-ink text-[13px] font-semibold uppercase tracking-[0.06em] text-ink hover:bg-ink hover:text-white transition"
        >
          {open ? "Vazgeç" : "Yorum Yaz"}
        </button>
      </div>

      {open && (
        <form onSubmit={onSubmit} className="max-w-xl mx-auto mt-6 bg-card border border-line p-5 md:p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-semibold mb-2">Puanın</label>
            <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHover(i)}
                  aria-label={`${i} yıldız`}
                  aria-pressed={rating === i}
                  className="w-10 h-10 grid place-items-center text-ink"
                >
                  <svg viewBox="0 0 20 20" width="26" height="26" aria-hidden="true">
                    <path
                      d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
                      fill={(hover || rating) >= i ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="name" required autoComplete="given-name" placeholder="Adın (ör. Ayşe K.)" className={input} />
            <input name="email" type="email" required autoComplete="email" placeholder="E-posta (yayınlanmaz)" className={input} />
          </div>
          <select name="size" defaultValue="" className={input}>
            <option value="">Aldığın beden (isteğe bağlı)</option>
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s} yaş
              </option>
            ))}
          </select>
          <textarea
            name="comment"
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            placeholder="Kumaşı, kalıbı, çocuğunun memnuniyeti… Deneyimini anlat."
            className={input}
          />
          <button
            disabled={loading}
            className="w-full h-12 bg-ink text-white text-[13px] font-semibold uppercase tracking-[0.06em] hover:bg-ink-2 transition disabled:opacity-60"
          >
            {loading ? "Gönderiliyor..." : "Yorumu Gönder"}
          </button>
          {msg && <p className={`text-sm ${msg.ok ? "text-success" : "text-red-600"}`}>{msg.text}</p>}
          <p className="text-[11px] text-muted">Yorumlar yayınlanmadan önce kontrol edilir.</p>
        </form>
      )}
    </section>
  );
}
