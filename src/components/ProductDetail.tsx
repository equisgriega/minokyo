"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCart } from "./CartContext";
import { formatTL } from "@/lib/money";
import { trackViewContent, trackAddToCart } from "@/lib/track";
import { LeafIcon, ReturnIcon, TruckIcon } from "./Icons";
import { requestStockNotify } from "@/app/(shop)/urun/actions";

const SIZE_CHART: Record<string, { boy: string; kilo: string }> = {
  "2": { boy: "86–92 cm", kilo: "12–13 kg" },
  "3": { boy: "92–98 cm", kilo: "14–15 kg" },
  "4": { boy: "98–104 cm", kilo: "16–17 kg" },
  "5": { boy: "104–110 cm", kilo: "18–19 kg" },
  "6": { boy: "110–116 cm", kilo: "20–21 kg" },
};

type Variant = { id: string; size: string; stock: number };
type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    gender: string;
    categoryName?: string | null;
    images: string[];
    variants: Variant[];
  };
};

export default function ProductDetail({ product }: Props) {
  const { add } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [warn, setWarn] = useState(false);
  const [added, setAdded] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyMsg, setNotifyMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [ctaVisible, setCtaVisible] = useState(true);

  const ctaRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);

  async function handleNotify() {
    if (!selectedVariant) return;
    const res = await requestStockNotify(selectedVariant.id, notifyEmail);
    setNotifyMsg({ ok: res.ok, text: res.message });
  }

  const selectedVariant = product.variants.find((v) => v.size === size) ?? null;
  const maxStock = selectedVariant?.stock ?? 0;
  const selectedOut = !!selectedVariant && selectedVariant.stock === 0;

  // Ürün görüntüleme olayı (reklam takibi)
  useEffect(() => {
    trackViewContent({ id: product.slug, name: product.name, price: product.price });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Asıl "Sepete Ekle" ekrandan çıkınca mobilde alttaki sabit çubuğu göster
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCtaVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function handleAdd() {
    if (!selectedVariant) {
      setWarn(true);
      const el = sizesRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        // Zaten görünüyorsa kaydırma
        if (r.top < 80 || r.bottom > window.innerHeight - 90) {
          window.scrollTo(0, r.top + window.scrollY - window.innerHeight / 2 + r.height / 2);
        }
      }
      return;
    }
    trackAddToCart({ id: product.slug, name: product.name, price: product.price, qty });
    add(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0],
        size: selectedVariant.size,
        price: product.price,
        maxStock: selectedVariant.stock,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-12">
      {/* Galeri — mobil: kaydırmalı tam genişlik */}
      <div className="md:hidden -mx-5">
        <div
          className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none]"
          onScroll={(e) => {
            const t = e.currentTarget;
            setActiveImg(Math.round(t.scrollLeft / t.clientWidth));
          }}
        >
          {product.images.map((img, i) => (
            <div key={i} className="relative shrink-0 w-full aspect-[3/4] snap-start bg-[#f5f5f5]">
              <Image
                src={img}
                alt={i === 0 ? product.name : ""}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {product.images.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {product.images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  activeImg === i ? "w-5 bg-[#111111]" : "w-1.5 bg-[#d4d4d4]"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Galeri — masaüstü: büyük görsel + küçük resimler */}
      <div className="hidden md:block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
          <Image
            src={product.images[activeImg] ?? product.images[0]}
            alt={product.name}
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-3 mt-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative w-20 h-24 overflow-hidden border ${
                  activeImg === i ? "border-[#111111]" : "border-transparent"
                }`}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bilgi */}
      <div>
        <span className="text-[11px] uppercase tracking-[0.1em] text-[#6b6b6b] font-medium">
          {product.categoryName ?? "minokyo"}
        </span>
        <h1 className="text-xl md:text-2xl font-semibold text-[#111111] leading-snug mt-1.5">
          {product.name}
        </h1>
        <div className="text-lg md:text-xl font-semibold text-[#111111] mt-2 mb-4">
          {formatTL(product.price)}
        </div>
        <p className="text-sm leading-relaxed text-[#6b6b6b] mb-6">{product.description}</p>

        {/* Beden */}
        <div className="mb-6 scroll-mt-28" ref={sizesRef}>
          <div className="flex items-center justify-between mb-2.5">
            <label className="font-semibold text-[13px] uppercase tracking-[0.05em]">Beden (Yaş)</label>
            <button
              type="button"
              onClick={() => setShowChart((s) => !s)}
              className="py-1 text-xs text-[#111111] underline underline-offset-2"
            >
              Beden Tablosu
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.variants.map((v) => {
              const out = v.stock === 0;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setSize(v.size);
                    setQty(1);
                    setWarn(false);
                    setNotifyMsg(null);
                  }}
                  aria-pressed={size === v.size}
                  className={`h-12 border text-sm font-medium transition ${
                    size === v.size
                      ? "bg-[#111111] text-white border-[#111111]"
                      : out
                      ? "bg-[#f5f5f5] text-[#b5b5b5] border-[#e5e5e5] line-through"
                      : `bg-white text-[#111111] hover:border-[#111111] ${warn ? "border-red-400" : "border-[#e5e5e5]"}`
                  }`}
                >
                  {v.size}
                  <span className="text-[11px] opacity-70"> yaş</span>
                </button>
              );
            })}
          </div>
          {warn && <p className="text-sm text-red-600 mt-2">Lütfen bir beden seçin.</p>}
          {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3 && (
            <p className="text-sm text-[#111111] font-medium mt-2">Son {selectedVariant.stock} adet!</p>
          )}

          {showChart && (
            <div className="mt-3 border border-[#e5e5e5] overflow-hidden text-sm">
              <table className="w-full">
                <thead className="bg-[#f5f5f5] text-[#6b6b6b] text-left">
                  <tr><th className="p-2.5 font-semibold">Yaş</th><th className="p-2.5 font-semibold">Boy</th><th className="p-2.5 font-semibold">Kilo</th></tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {Object.entries(SIZE_CHART).map(([yas, v]) => (
                    <tr key={yas}><td className="p-2.5">{yas} Yaş</td><td className="p-2.5">{v.boy}</td><td className="p-2.5">{v.kilo}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div ref={ctaRef}>
          {selectedOut ? (
            /* Tükendi → stok gelince haber ver */
            <div className="border border-[#e5e5e5] p-4 bg-[#fafafa]">
              <p className="font-semibold text-sm mb-3">Bu beden tükendi. Stok gelince haber verelim mi?</p>
              <div className="flex">
                <input
                  type="email"
                  autoComplete="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="E-posta adresin"
                  className="flex-1 min-w-0 px-4 py-3 border border-[#e5e5e5] border-r-0 bg-white text-base md:text-sm focus:outline-none focus:border-[#111111]"
                />
                <button
                  onClick={handleNotify}
                  className="px-5 py-3 bg-[#111111] text-white text-sm font-semibold hover:bg-[#444444] transition whitespace-nowrap"
                >
                  Haber Ver
                </button>
              </div>
              {notifyMsg && (
                <p className={`text-xs mt-2 ${notifyMsg.ok ? "text-[#3f8f6b]" : "text-red-600"}`}>{notifyMsg.text}</p>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              {/* Adet */}
              <div className="flex items-center border border-[#e5e5e5]">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Azalt"
                  className="w-11 h-14 text-lg"
                >
                  −
                </button>
                <span className="w-7 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => (selectedVariant ? Math.min(maxStock, q + 1) : q + 1))}
                  disabled={!!selectedVariant && qty >= maxStock}
                  aria-label="Arttır"
                  className="w-11 h-14 text-lg disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 h-14 bg-[#111111] text-white text-sm font-semibold uppercase tracking-[0.06em] hover:bg-[#444444] transition"
              >
                {added ? "✓ Sepete Eklendi" : "Sepete Ekle"}
              </button>
            </div>
          )}
        </div>

        <ul className="mt-6 pt-6 border-t border-[#f0f0f0] space-y-3 text-sm text-[#111111]">
          <li className="flex items-center gap-3"><LeafIcon size={18} /> %100 pamuk, yumuşak doku</li>
          <li className="flex items-center gap-3"><TruckIcon size={18} /> 500₺ üzeri kargo bedava</li>
          <li className="flex items-center gap-3"><ReturnIcon size={18} /> 14 gün içinde kolay iade</li>
        </ul>
      </div>

      {/* Mobil sabit alt çubuk — asıl buton ekran dışındayken görünür */}
      {!selectedOut && (
        <div
          className={`md:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-[#e5e5e5] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-3 transition-transform duration-300 ${
            ctaVisible ? "translate-y-full" : "translate-y-0"
          }`}
          aria-hidden={ctaVisible}
        >
          <div className="min-w-0 flex-1">
            <div className="text-[12px] text-[#6b6b6b] truncate">{product.name}</div>
            <div className="text-[15px] font-semibold text-[#111111]">
              {formatTL(product.price)}
              {size && <span className="text-[12px] font-normal text-[#6b6b6b]"> · {size} yaş</span>}
            </div>
          </div>
          <button
            onClick={handleAdd}
            tabIndex={ctaVisible ? -1 : 0}
            className="h-12 px-6 bg-[#111111] text-white text-[13px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap"
          >
            {added ? "✓ Eklendi" : size ? "Sepete Ekle" : "Beden Seç"}
          </button>
        </div>
      )}
    </div>
  );
}
