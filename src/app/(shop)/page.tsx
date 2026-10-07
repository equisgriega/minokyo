import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard, { CardProduct } from "@/components/ProductCard";
import HeroVideos from "@/components/HeroVideos";
import { LeafIcon, ReturnIcon, ShieldIcon, TruckIcon } from "@/components/Icons";

// Hero videoları — yeni video ekledikçe public/ içine koyup buraya ekle:
// örn. "/hero2.mp4", "/hero3.mp4" — otomatik sırayla döner.
const HERO_VIDEOS = [
  "/hero.mp4",
  "/hero2.mp4",
  "/hero3.mp4",
  "/hero4.mp4",
  "/hero5.mp4",
];

// Kategori kartları — görseli değiştirmek için image yolunu güncelle
const CATEGORIES = [
  { href: "/urunler?cinsiyet=kiz", label: "Kız Çocuk", image: "/products/p2.jpeg" },
  { href: "/urunler?cinsiyet=erkek", label: "Erkek Çocuk", image: "/products/p4.jpeg" },
  { href: "/urunler?kategori=takimlar", label: "Takımlar", image: "/products/p7.jpeg" },
  { href: "/urunler?kategori=pantolonlar", label: "Pantolonlar", image: "/products/p10.jpeg" },
];

const FEATURES = [
  { Icon: LeafIcon, t: "%100 Pamuk", d: "Hassas ciltler için yumuşak kumaş" },
  { Icon: TruckIcon, t: "Hızlı Kargo", d: "500₺ üzeri ücretsiz gönderim" },
  { Icon: ReturnIcon, t: "Kolay İade", d: "14 gün içinde koşulsuz iade" },
  { Icon: ShieldIcon, t: "Güvenli Ödeme", d: "256-bit SSL ile korunur" },
];

// ISR: sayfa CDN'den statik servis edilir, her 5 dk'da bir (ve admin değişikliğinde) tazelenir.
export const revalidate = 300;

async function getFeatured(): Promise<CardProduct[]> {
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: true,
      category: true,
    },
    take: 4,
  });
  return products.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.price,
    gender: p.gender,
    image: p.images[0]?.url ?? "/products/p1.jpeg",
    categoryName: p.category?.name,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
  }));
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center mb-8 md:mb-10">
      <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.06em] text-[#111111]">{children}</h2>
      {sub && <p className="text-[13px] text-[#6b6b6b] mt-2">{sub}</p>}
    </div>
  );
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <div>
      {/* Hero — tam genişlik, dönen video */}
      <section className="relative w-full h-[calc(100svh-97px)] md:h-[calc(100svh-128px)] min-h-[480px] overflow-hidden bg-black">
        <HeroVideos videos={HERO_VIDEOS} poster="/products/p6.jpeg" zoom={1.08} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-5 flex flex-col justify-end pb-12 md:pb-16">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/80">
            Yeni Koleksiyon · AW 26/27
          </span>
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-white leading-[1.05] mt-3 max-w-2xl">
            Minik tarzlar,
            <br />
            büyük mutluluklar
          </h1>
          <div className="flex gap-3 mt-7 flex-wrap">
            <Link
              href="/urunler"
              className="px-8 py-3.5 bg-white text-[#111111] text-[13px] font-semibold uppercase tracking-[0.06em] hover:bg-[#111111] hover:text-white transition"
            >
              Koleksiyonu Keşfet
            </Link>
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="max-w-7xl mx-auto px-5 pt-16 md:pt-24">
        <SectionTitle>Kategoriler</SectionTitle>
        <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 [scrollbar-width:none]">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group relative shrink-0 w-[64%] sm:w-[42%] md:w-auto aspect-[3/4] overflow-hidden bg-[#f5f5f5] snap-start"
            >
              <Image
                src={c.image}
                alt={c.label}
                fill
                sizes="(max-width:768px) 64vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 text-white text-[13px] font-bold uppercase tracking-[0.08em]">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Öne çıkanlar */}
      <section className="max-w-7xl mx-auto px-5 pt-16 md:pt-24">
        <SectionTitle sub="Bu sezonun en sevilenleri">Öne Çıkanlar</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-10">
          {featured.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/urunler"
            className="inline-block px-10 py-3.5 border border-[#111111] text-[13px] font-semibold uppercase tracking-[0.06em] text-[#111111] hover:bg-[#111111] hover:text-white transition"
          >
            Tümünü Gör
          </Link>
        </div>
      </section>

      {/* Özellikler */}
      <section className="max-w-7xl mx-auto px-5 py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[#e5e5e5] pt-12">
          {FEATURES.map(({ Icon, t, d }) => (
            <div key={t} className="flex flex-col items-center text-center">
              <Icon size={26} className="text-[#111111] mb-3" />
              <div className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#111111]">{t}</div>
              <div className="text-xs text-[#6b6b6b] mt-1.5">{d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
