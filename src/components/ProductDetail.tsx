"use client";

import { useState, useEffect } from "react";
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

  async function handleNotify() {
    if (!selectedVariant) return;
    const res = await requestStockNotify(selectedVariant.id, notifyEmail);
    setNotifyMsg({ ok: res.ok, text: res.message });
  }

  const selectedVariant = product.variants.find((v) => v.size === size) ?? null;
  const maxStock = selectedVariant?.stock ?? 0;

  // Ürün görüntüleme olayı (reklam takibi)
  useEffect(() => {
    trackViewContent({ id: product.slug, name: product.name, price: product.price });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAdd() {
    if (!selectedVariant) {
      setWarn(true);
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
    <div className="grid md:grid-cols-2 gap-10">
      {/* Galeri */}
      <div>
        <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-[#f0f0f0] border border-[#e5e5e5]">
          <Image
            src={product.images[activeImg]}
            alt={product.name}
            fill
            priority
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-3 mt-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 ${
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
        <span className="text-xs uppercase tracking-wide text-[#111111] font-semibold">
          {product.categoryName ?? "minokyo"}
        </span>
        <h1 className="font-display text-3xl font-bold text-[#111111] mt-1 mb-2">{product.name}</h1>
        <div className="font-display text-3xl font-bold text-[#111111] mb-4">
          {formatTL(product.price)}
        </div>
        <p className="text-[#6b6b6b] mb-6">{product.description}</p>

        {/* Beden */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="font-semibold text-sm">
              Beden (Yaş) <span className="text-[#111111]">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowChart((s) => !s)}
              className="text-xs text-[#111111] font-semibold underline"
            >
              Beden Tablosu
            </button>
          </div>
          <div className="flex flex-wrap gap-2.5">
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
                  className={`min-w-[56px] px-3 py-2.5 rounded-xl border-[1.5px] font-semibold text-sm transition ${
                    size === v.size
                      ? "bg-[#111111] text-white border-[#111111]"
                      : out
                      ? "bg-[#f0f0f0] text-[#b5b5b5] border-[#e5e5e5] line-through"
                      : "bg-[#ffffff] border-[#e5e5e5] hover:border-[#444444]"
                  }`}
                >
                  {v.size} Yaş
                </button>
              );
            })}
          </div>
          {warn && <p className="text-sm text-red-600 mt-2">Lütfen bir beden seçin.</p>}
          {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3 && (
            <p className="text-sm text-amber-700 mt-2">Son {selectedVariant.stock} adet!</p>
          )}

          {showChart && (
            <div className="mt-3 border border-[#e5e5e5] rounded-xl overflow-hidden text-sm">
              <table className="w-full">
                <thead className="bg-[#f5f5f5] text-[#6b6b6b] text-left">
                  <tr><th className="p-2 font-semibold">Yaş</th><th className="p-2 font-semibold">Boy</th><th className="p-2 font-semibold">Kilo</th></tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f0]">
                  {Object.entries(SIZE_CHART).map(([yas, v]) => (
                    <tr key={yas}><td className="p-2">{yas} Yaş</td><td className="p-2">{v.boy}</td><td className="p-2">{v.kilo}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedVariant && selectedVariant.stock === 0 ? (
          /* Tükendi → stok gelince haber ver */
          <div className="border border-[#e5e5e5] rounded-2xl p-4 bg-[#f5f5f5]">
            <p className="font-semibold text-sm mb-2">Bu beden tükendi. Stok gelince haber verelim mi?</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="E-posta adresin"
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#e5e5e5] bg-[#ffffff] text-sm focus:outline-none focus:border-[#444444]"
              />
              <button
                onClick={handleNotify}
                className="px-5 py-2.5 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-[#444444] transition whitespace-nowrap"
              >
                Haber Ver
              </button>
            </div>
            {notifyMsg && (
              <p className={`text-xs mt-2 ${notifyMsg.ok ? "text-[#3f8f6b]" : "text-red-600"}`}>{notifyMsg.text}</p>
            )}
          </div>
        ) : (
          <>
            {/* Adet */}
            <div className="mb-6">
              <label className="block font-semibold text-sm mb-2">Adet</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-none border border-[#e5e5e5] bg-[#ffffff] font-bold text-lg"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => (selectedVariant ? Math.min(maxStock, q + 1) : q + 1))}
                  disabled={!!selectedVariant && qty >= maxStock}
                  className="w-9 h-9 rounded-none border border-[#e5e5e5] bg-[#ffffff] font-bold text-lg disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full py-4 rounded-none bg-[#111111] text-white font-semibold text-lg hover:bg-[#444444] transition"
            >
              {added ? "✓ Sepete Eklendi" : "Sepete Ekle"}
            </button>
          </>
        )}

        <ul className="mt-6 pt-6 border-t border-[#f0f0f0] space-y-3 text-sm text-[#111111]">
          <li className="flex items-center gap-3"><LeafIcon size={18} className="text-[#111111]" /> %100 pamuk, yumuşak doku</li>
          <li className="flex items-center gap-3"><TruckIcon size={18} className="text-[#111111]" /> 500₺ üzeri kargo bedava</li>
          <li className="flex items-center gap-3"><ReturnIcon size={18} className="text-[#111111]" /> 14 gün içinde kolay iade</li>
        </ul>
      </div>
    </div>
  );
}
