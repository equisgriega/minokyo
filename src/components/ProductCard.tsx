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
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f4f0fa]">
        {(out || low) && (
          <span
            className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
              out ? "bg-white text-[#6b6280]" : "bg-[#fdf3d7] text-[#8a6410]"
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
          className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${out ? "opacity-60" : ""}`}
        />
      </div>
      <div className="pt-3 text-center">
        <h3 className="text-sm text-[#2f2545] leading-snug line-clamp-2">{p.name}</h3>
        <p className="mt-1 text-sm font-semibold text-[#5a2e86]">{formatTL(p.price)}</p>
      </div>
    </Link>
  );
}
