"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { formatTL } from "@/lib/money";
import { BagIcon } from "./Icons";

export default function CartDrawer() {
  const { items, subtotal, isOpen, setOpen, setQty, remove } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-[#f7f4fb] z-[60] shadow-2xl flex flex-col transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#e3daf0]">
          <h3 className="font-display text-xl font-bold text-[#5a2e86]">Sepetim</h3>
          <button onClick={() => setOpen(false)} className="text-2xl leading-none" aria-label="Kapat">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="w-16 h-16 rounded-full bg-[#f4f0fa] text-[#5a2e86] grid place-items-center"><BagIcon size={28} /></span>
            <p className="text-[#6b6280]">Sepetin şimdilik boş.</p>
            <Link
              href="/urunler"
              onClick={() => setOpen(false)}
              className="px-6 py-3 rounded-full bg-[#5a2e86] text-white font-semibold hover:bg-[#7a4fb0] transition"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.map((i) => (
                <div key={i.variantId} className="flex gap-3">
                  <Image
                    src={i.image}
                    alt={i.name}
                    width={72}
                    height={90}
                    className="rounded-xl object-cover w-[72px] h-[90px]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold leading-tight">{i.name}</div>
                    <div className="text-xs text-[#6b6280]">Beden: {i.size} Yaş</div>
                    <div className="text-sm font-semibold text-[#5a2e86] mt-0.5">
                      {formatTL(i.price)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => setQty(i.variantId, i.qty - 1)}
                        className="w-7 h-7 rounded-full border border-[#e3daf0] bg-white font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                      <button
                        onClick={() => setQty(i.variantId, i.qty + 1)}
                        disabled={i.qty >= i.maxStock}
                        className="w-7 h-7 rounded-full border border-[#e3daf0] bg-white font-bold disabled:opacity-40"
                      >
                        +
                      </button>
                      <button
                        onClick={() => remove(i.variantId)}
                        className="ml-auto text-xs text-[#6b6280] underline"
                      >
                        Kaldır
                      </button>
                    </div>
                    {i.qty >= i.maxStock && (
                      <div className="text-[11px] text-amber-700 mt-1">Son {i.maxStock} adet</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-[#e3daf0] bg-[#ffffff]">
              <div className="flex justify-between items-center mb-1">
                <span>Ara Toplam</span>
                <strong className="font-display text-xl text-[#5a2e86]">
                  {formatTL(subtotal)}
                </strong>
              </div>
              <p className="text-xs text-[#6b6280] mb-3">Kargo, ödeme adımında hesaplanır.</p>
              <Link
                href="/odeme"
                onClick={() => setOpen(false)}
                className="block text-center w-full py-3.5 rounded-full bg-[#5a2e86] text-white font-semibold hover:bg-[#7a4fb0] transition"
              >
                Ödemeye Geç
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
