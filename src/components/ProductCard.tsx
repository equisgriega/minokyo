import Link from "next/link";
import Image from "next/image";
import { formatTL } from "@/lib/money";

export type CardProduct = {
  slug: string;
  name: string;
  price: number;
  gender: string;
  image: string;
  categoryName?: string | null;
  totalStock: number;
};

export default function ProductCard({ p }: { p: CardProduct }) {
  const out = p.totalStock === 0;
  const low = !out && p.totalStock <= 3;
  return (
    <Link href={`/urun/${p.slug}`} className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
        {(out || low) && (
          <span
            className={`absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${
              out ? "bg-white text-[#6b6b6b]" : "bg-[#111111] text-white"
            }`}
          >
            {out ? "Tükendi" : `Son ${p.totalStock} adet`}
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
        <h3 className="text-[13px] text-[#111111] leading-snug line-clamp-2">{p.name}</h3>
        <p className="mt-1.5 text-[13px] font-semibold text-[#111111]">{formatTL(p.price)}</p>
      </div>
    </Link>
  );
}
