import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard, { CardProduct } from "@/components/ProductCard";
import HeroVideos from "@/components/HeroVideos";
import { ArrowRightIcon, LeafIcon, ReturnIcon, ShieldIcon, TruckIcon } from "@/components/Icons";

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

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <div>
      {/* Hero — tam ekran, dönen video arka plan */}
      <section className="relative w-full h-[calc(100svh-97px)] min-h-[520px] overflow-hidden bg-black">
        <HeroVideos videos={HERO_VIDEOS} poster="/products/p6.jpeg" zoom={1.08} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-5 flex flex-col justify-end pb-14 md:pb-20">
          <span className="text-xs tracking-[0.2em] uppercase text-white/85">
            Yeni Sezon · Sonbahar / Kış
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-[1.05] mt-3 max-w-xl">
            Minik tarzlar,
            <br />
            büyük mutluluklar
          </h1>
          <div className="flex gap-3 mt-7 flex-wrap">
            <Link
              href="/urunler"
              className="px-7 py-3 rounded-full bg-white text-[#2f2545] text-sm font-semibold hover:bg-[#f0c33c] transition"
            >
              Koleksiyonu Keşfet
            </Link>
            <Link
              href="/urunler?kategori=takimlar"
              className="px-7 py-3 rounded-full border border-white/80 text-white text-sm font-semibold hover:bg-white hover:text-[#2f2545] transition"
            >
              Takımlar
            </Link>
          </div>
        </div>
      </section>

      {/* Kategoriler — fotoğraflı kartlar */}
      <section className="max-w-6xl mx-auto px-5 pt-14 md:pt-20">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-[#2f2545] mb-6">Kategoriler</h2>
        <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 pb-2 [scrollbar-width:none]">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group relative shrink-0 w-[62%] sm:w-[40%] md:w-auto aspect-[3/4] rounded-2xl overflow-hidden bg-[#f4f0fa] snap-start"
            >
              <Image
                src={c.image}
                alt={c.label}
                fill
                sizes="(max-width:768px) 62vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <span className="font-semibold text-base md:text-lg uppercase tracking-wide">{c.label}</span>
                <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur grid place-items-center group-hover:bg-white group-hover:text-[#2f2545] transition">
                  <ArrowRightIcon size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Öne çıkanlar */}
      <section className="max-w-6xl mx-auto px-5 pt-14 md:pt-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#2f2545]">Öne Çıkanlar</h2>
            <p className="text-sm text-[#6b6280] mt-1">Bu sezonun en sevilenleri</p>
          </div>
          <Link
            href="/urunler"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#5a2e86] hover:gap-2.5 transition-all"
          >
            Tümünü Gör <ArrowRightIcon size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
          {featured.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
        <div className="sm:hidden text-center mt-8">
          <Link
            href="/urunler"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full border border-[#e3daf0] text-sm font-semibold text-[#2f2545]"
          >
            Tümünü Gör <ArrowRightIcon size={16} />
          </Link>
        </div>
      </section>

      {/* Özellikler */}
      <section className="max-w-6xl mx-auto px-5 py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#ece7f5] pt-10">
          {FEATURES.map(({ Icon, t, d }) => (
            <div key={t} className="flex flex-col items-center text-center">
              <span className="w-12 h-12 rounded-full bg-[#f4f0fa] text-[#5a2e86] grid place-items-center mb-3">
                <Icon size={22} />
              </span>
              <div className="text-sm font-semibold text-[#2f2545]">{t}</div>
              <div className="text-xs text-[#6b6280] mt-1">{d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
