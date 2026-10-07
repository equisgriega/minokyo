import Link from "next/link";
import Image from "next/image";
import { formatTL } from "@/lib/money";

export type CardProduct = {
  slug: string;
  name: string;
  price: number;
  compareAt?: number | null; // indirim öncesi fiyat
  gender: string;
  image: string;
  categoryName?: string | null;
  totalStock: number;
  isNew?: boolean;
};

export default function ProductCard({ p }: { p: CardProduct }) {
  const out = p.totalStock === 0;
  const low = !out && p.totalStock <= 3;
  const sale = !!p.compareAt && p.compareAt > p.price;
  const pct = sale ? Math.round((1 - p.price / p.compareAt!) * 100) : 0;

  // Tek rozet, öncelik sırasıyla: Tükendi > İndirim > Son X adet > Yeni
  const badge = out
    ? { text: "Tükendi", cls: "bg-card text-muted" }
    : sale
    ? { text: `%${pct} İndirim`, cls: "bg-accent text-white" }
    : low
    ? { text: `Son ${p.totalStock} adet`, cls: "bg-ink text-white" }
    : p.isNew
    ? { text: "Yeni", cls: "bg-card text-accent" }
    : null;

  return (
    <Link href={`/urun/${p.slug}`} className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        {badge && (
          <span
            className={`absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${badge.cls}`}
          >
            {badge.text}
          </span>
        )}
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${out ? "opacity-50" : ""}`}
        />
      </div>
      <div className="pt-3">
        <h3 className="text-[13px] text-ink leading-snug line-clamp-2">{p.name}</h3>
        <p className="mt-1.5 text-[13px] font-semibold flex items-baseline gap-2 flex-wrap">
          <span className={sale ? "text-accent" : "text-ink"}>{formatTL(p.price)}</span>
          {sale && <span className="text-[12px] font-normal text-muted line-through">{formatTL(p.compareAt!)}</span>}
        </p>
      </div>
    </Link>
  );
}
