import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard, { CardProduct } from "@/components/ProductCard";
import HeroVideos from "@/components/HeroVideos";

// Hero videoları — yeni video ekledikçe public/ içine koyup buraya ekle:
// örn. "/hero2.mp4", "/hero3.mp4" — otomatik sırayla döner.
const HERO_VIDEOS = [
  "/hero.mp4",
  "/hero2.mp4",
  "/hero3.mp4",
  "/hero4.mp4",
  "/hero5.mp4",
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

  const categories = [
    { href: "/urunler?kategori=takimlar", label: "Takımlar", emoji: "👕" },
    { href: "/urunler?kategori=pantolonlar", label: "Pantolonlar", emoji: "👖" },
    { href: "/urunler?cinsiyet=kiz", label: "Kız", emoji: "🎀" },
    { href: "/urunler?cinsiyet=erkek", label: "Erkek", emoji: "⚽" },
  ];

  return (
    <div>
      {/* Hero — tam ekran, dönen video arka plan (bgstore tarzı) */}
      <section className="relative w-full h-[calc(100vh-108px)] min-h-[540px] overflow-hidden bg-black">
        <HeroVideos videos={HERO_VIDEOS} poster="/products/p6.jpeg" zoom={1.08} />
        {/* Okunabilirlik için karartma */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-5 flex flex-col justify-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-white/85 drop-shadow">
            Yeni Sezon · Sonbahar / Kış
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight mt-3 drop-shadow-lg">
            Minik tarzlar,
            <br />
            <span className="text-[#f0c33c]">büyük mutluluklar</span>
          </h1>
          <p className="text-white/90 mt-4 max-w-md drop-shadow">
            Yumuşacık kumaşlar, neşeli desenler ve gün boyu rahatlık. minokyo ile çocuğunuz hem şık
            hem özgür.
          </p>
          <div className="flex gap-3 mt-7 flex-wrap">
            <Link
              href="/urunler"
              className="px-7 py-3.5 rounded-full bg-white text-[#5a2e86] font-semibold hover:bg-[#f0c33c] transition shadow-lg"
            >
              Koleksiyonu Keşfet
            </Link>
            <Link
              href="/urunler?kategori=takimlar"
              className="px-7 py-3.5 rounded-full border border-white/70 text-white font-semibold hover:bg-white/10 transition backdrop-blur-sm"
            >
              Takımlar
            </Link>
          </div>
          <div className="flex gap-5 mt-7 text-sm text-white/90 font-medium flex-wrap drop-shadow">
            <span>🌱 %100 Pamuk</span>
            <span>☁️ Yumuşak Doku</span>
            <span>🚚 Hızlı Kargo</span>
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      <section className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="bg-[#ffffff] border border-[#e3daf0] rounded-2xl p-6 text-center hover:-translate-y-1 hover:shadow-md transition"
            >
              <div className="text-3xl mb-2">{c.emoji}</div>
              <div className="font-semibold text-[#5a2e86]">{c.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Öne çıkanlar */}
      <section className="max-w-6xl mx-auto px-5 py-10">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold text-[#5a2e86]">Öne Çıkanlar</h2>
          <p className="text-[#6b6280]">Bu sezonun en sevilenleri</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featured.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/urunler"
            className="inline-block px-7 py-3.5 rounded-full border border-[#e3daf0] bg-[#ffffff] font-semibold hover:border-[#7a4fb0] transition"
          >
            Tüm Ürünleri Gör →
          </Link>
        </div>
      </section>

      {/* Özellikler */}
      <section className="bg-[#ece7f5]/50 py-12 mt-6">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { i: "🌸", t: "Doğal Kumaşlar", d: "Hassas ciltler için yumuşak pamuk" },
            { i: "🎨", t: "Özgün Tasarımlar", d: "El çizimi desenler" },
            { i: "📦", t: "Kolay İade", d: "14 gün koşulsuz iade" },
            { i: "💚", t: "Güvenli Alışveriş", d: "Güvenli ödeme altyapısı" },
          ].map((f) => (
            <div key={f.t}>
              <div className="text-3xl mb-2">{f.i}</div>
              <div className="font-semibold text-[#5a2e86]">{f.t}</div>
              <div className="text-sm text-[#6b6280] mt-1">{f.d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
