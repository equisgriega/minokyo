import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import HeroVideos from "@/components/HeroVideos";
import Stars from "@/components/Stars";
import { cardInclude, toCard } from "@/lib/cards";
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

// Kategori kartları — Öne Çıkanlar'dan farklı fotoğraflar (tekrar olmasın)
const CATEGORIES = [
  { href: "/urunler?cinsiyet=kiz", label: "Kız Çocuk", image: "/products/p6.jpeg" },
  { href: "/urunler?cinsiyet=erkek", label: "Erkek Çocuk", image: "/products/p8.jpeg" },
  { href: "/urunler?kategori=takimlar", label: "Takımlar", image: "/products/p3.jpeg" },
  { href: "/urunler?kategori=pantolonlar", label: "Pantolonlar", image: "/products/p10.jpeg" },
];

// Kampanya bölümü — görseller public/editorial/ altında
const CAMPAIGN = {
  eyebrow: "Sonbahar / Kış 26",
  title: "Bu kış, oyun hiç bitmesin",
  text: "Taş avlularda koşturmaca, pencere önünde kahkahalar… Yumuşacık pamuklu takımlarımız, çocuğunuzun her macerasına eşlik etmek için tasarlandı.",
  image1: "/editorial/campaign-1.jpg",
  image2: "/editorial/campaign-2.jpg",
  product: { href: "/urun/ayicik-nakisli-polo-takim", label: "Ayıcık Nakışlı Polo Takımı" },
};

const INSTAGRAM_URL = "https://instagram.com/minokyo";
const INSTAGRAM_IMAGES = [1, 2, 3, 4, 5, 6].map((i) => `/editorial/ig${i}.jpg`);

const FEATURES = [
  { Icon: LeafIcon, t: "%100 Pamuk", d: "Hassas ciltler için yumuşak kumaş" },
  { Icon: TruckIcon, t: "Hızlı Kargo", d: "500 TL üzeri ücretsiz gönderim" },
  { Icon: ReturnIcon, t: "Kolay İade", d: "14 gün içinde koşulsuz iade" },
  { Icon: ShieldIcon, t: "Güvenli Ödeme", d: "256-bit SSL ile korunur" },
];

// ISR: sayfa CDN'den statik servis edilir, her 5 dk'da bir (ve admin değişikliğinde) tazelenir.
export const revalidate = 300;

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center mb-8 md:mb-10">
      <h2 className="text-lg md:text-xl font-bold uppercase tracking-[0.06em] text-ink">{children}</h2>
      {sub && <p className="text-[13px] text-muted mt-2">{sub}</p>}
    </div>
  );
}

export default async function HomePage() {
  const [featuredRaw, reviews] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: cardInclude,
      take: 4,
    }),
    // Sadece onaylı, gerçek müşteri yorumları (4-5 yıldız)
    prisma.review.findMany({
      where: { approved: true, rating: { gte: 4 } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, name: true, rating: true, comment: true, product: { select: { name: true, slug: true } } },
    }),
  ]);
  const featured = featuredRaw.map(toCard);

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
              className="px-8 py-3.5 bg-white text-ink text-[13px] font-semibold uppercase tracking-[0.06em] hover:bg-ink hover:text-white transition"
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
              className="group relative shrink-0 w-[64%] sm:w-[42%] md:w-auto aspect-[3/4] overflow-hidden bg-surface snap-start"
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
            className="inline-block px-10 py-3.5 border border-ink text-[13px] font-semibold uppercase tracking-[0.06em] text-ink hover:bg-ink hover:text-white transition"
          >
            Tümünü Gör
          </Link>
        </div>
      </section>

      {/* Kampanya / lookbook — editoryal hikâye */}
      <section className="max-w-7xl mx-auto px-5 pt-16 md:pt-28">
        <div className="grid md:grid-cols-12 gap-6 md:gap-10 items-center">
          <Link href={CAMPAIGN.product.href} className="group md:col-span-6 relative aspect-[4/5] overflow-hidden bg-surface">
            <Image
              src={CAMPAIGN.image1}
              alt={CAMPAIGN.product.label}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <span className="absolute bottom-4 left-4 bg-paper/95 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink">
              {CAMPAIGN.product.label} →
            </span>
          </Link>
          <div className="md:col-span-6 md:pl-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{CAMPAIGN.eyebrow}</span>
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-ink leading-[1.1] mt-3">
              {CAMPAIGN.title}
            </h2>
            <p className="text-[15px] leading-relaxed text-muted mt-5 max-w-md">{CAMPAIGN.text}</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link
                href="/urunler"
                className="px-8 py-3.5 bg-ink text-white text-[13px] font-semibold uppercase tracking-[0.06em] hover:bg-ink-2 transition"
              >
                Koleksiyonu Gör
              </Link>
              <Link
                href={CAMPAIGN.product.href}
                className="px-8 py-3.5 border border-ink text-ink text-[13px] font-semibold uppercase tracking-[0.06em] hover:bg-ink hover:text-white transition"
              >
                Bu Görünümü Al
              </Link>
            </div>
            <div className="hidden md:block relative aspect-[4/3] w-2/3 ml-auto mt-12 overflow-hidden bg-surface">
              <Image
                src={CAMPAIGN.image2}
                alt=""
                fill
                sizes="30vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Müşteri yorumları — sadece onaylı gerçek yorumlar varsa görünür */}
      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 pt-16 md:pt-28">
          <SectionTitle sub="Gerçek müşterilerimizin deneyimleri">Annelerin Gözünden</SectionTitle>
          <div className="grid md:grid-cols-3 gap-3">
            {reviews.map((r) => (
              <figure key={r.id} className="bg-card border border-line-soft p-6 flex flex-col">
                <Stars value={r.rating} />
                <blockquote className="text-[15px] leading-relaxed text-ink mt-4 flex-1">“{r.comment}”</blockquote>
                <figcaption className="text-[12px] text-muted mt-5">
                  <span className="font-semibold text-ink">{r.name}</span> ·{" "}
                  <Link href={`/urun/${r.product.slug}`} className="underline underline-offset-2">
                    {r.product.name}
                  </Link>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Instagram */}
      <section className="max-w-7xl mx-auto px-5 pt-16 md:pt-28">
        <SectionTitle sub="Kombin ilhamı ve yeni ürünler için bizi takip et">@minokyo</SectionTitle>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2">
          {INSTAGRAM_IMAGES.map((src, i) => (
            <a
              key={src}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-surface"
              aria-label={`Instagram'da minokyo — görsel ${i + 1}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width:768px) 33vw, 16vw"
                className="object-cover transition duration-500 group-hover:scale-[1.04] group-hover:opacity-90"
              />
            </a>
          ))}
        </div>
        <div className="text-center mt-6">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink underline underline-offset-4"
          >
            Instagram&apos;da Takip Et
          </a>
        </div>
      </section>

      {/* Özellikler */}
      <section className="max-w-7xl mx-auto px-5 py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-line pt-12">
          {FEATURES.map(({ Icon, t, d }) => (
            <div key={t} className="flex flex-col items-center text-center">
              <Icon size={26} className="text-ink mb-3" />
              <div className="text-[13px] font-semibold uppercase tracking-[0.05em] text-ink">{t}</div>
              <div className="text-xs text-muted mt-1.5">{d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
