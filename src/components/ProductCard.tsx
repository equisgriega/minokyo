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

const GENDER_LABEL: Record<string, string> = {
  kiz: "Kız",
  erkek: "Erkek",
  unisex: "Unisex",
};

export default function ProductCard({ p }: { p: CardProduct }) {
  const out = p.totalStock === 0;
  return (
    <Link
      href={`/urun/${p.slug}`}
      className="group bg-[#ffffff] rounded-3xl border border-[#e3daf0] overflow-hidden flex flex-col hover:-translate-y-1.5 hover:shadow-xl transition-all duration-200"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#ece7f5]">
        <span className="absolute top-3 left-3 z-10 bg-[#ffffff]/90 px-3 py-1 rounded-full text-[11px] font-semibold text-[#5a2e86]">
          {p.categoryName ?? GENDER_LABEL[p.gender]}
        </span>
        {out && (
          <span className="absolute top-3 right-3 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-[11px] font-semibold">
            Tükendi
          </span>
        )}
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-[11px] uppercase tracking-wide text-[#e4b33e] font-semibold">
          minokyo
        </span>
        <h3 className="text-sm font-semibold leading-snug text-[#2f2545] flex-1">{p.name}</h3>
        <span className="font-display text-lg font-bold text-[#5a2e86] mt-1">
          {formatTL(p.price)}
        </span>
      </div>
    </Link>
  );
}
