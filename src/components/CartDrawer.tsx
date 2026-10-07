"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";
import { formatTL, FREE_SHIP_LIMIT } from "@/lib/money";
import { BagIcon, CloseIcon } from "./Icons";

export default function CartDrawer() {
  const { items, subtotal, isOpen, setOpen, setQty, remove } = useCart();
  const remaining = Math.max(0, FREE_SHIP_LIMIT - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIP_LIMIT) * 100);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-paper z-[70] flex flex-col transition-[transform,visibility] duration-300 ${
          isOpen ? "translate-x-0 visible shadow-2xl" : "translate-x-full invisible"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-line">
          <h3 className="text-sm font-bold uppercase tracking-[0.06em] text-ink">Sepetim ({items.reduce((n, i) => n + i.qty, 0)})</h3>
          <button onClick={() => setOpen(false)} className="-mr-2 w-11 h-11 grid place-items-center text-ink" aria-label="Kapat">
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="w-16 h-16 rounded-full bg-surface text-ink grid place-items-center"><BagIcon size={28} /></span>
            <p className="text-muted">Sepetin şimdilik boş.</p>
            <Link
              href="/urunler"
              onClick={() => setOpen(false)}
              className="px-6 py-3 rounded-none bg-ink text-white font-semibold hover:bg-ink-2 transition"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-line">
              <p className="text-xs text-ink">
                {remaining > 0 ? (
                  <>Kargo bedava için <strong>{formatTL(remaining)}</strong> daha ekle</>
                ) : (
                  <strong>Kargo bedava!</strong>
                )}
              </p>
              <div className="mt-2 h-1 bg-line-soft">
                <div className="h-full bg-ink transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
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
                    <div className="text-xs text-muted">Beden: {i.size} Yaş</div>
                    <div className="text-sm font-semibold text-ink mt-0.5">
                      {formatTL(i.price)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => setQty(i.variantId, i.qty - 1)}
                        className="w-9 h-9 rounded-none border border-line bg-white font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                      <button
                        onClick={() => setQty(i.variantId, i.qty + 1)}
                        disabled={i.qty >= i.maxStock}
                        className="w-9 h-9 rounded-none border border-line bg-white font-bold disabled:opacity-40"
                      >
                        +
                      </button>
                      <button
                        onClick={() => remove(i.variantId)}
                        className="ml-auto py-2 text-xs text-muted underline"
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

            <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-line bg-paper">
              <div className="flex justify-between items-center mb-1">
                <span>Ara Toplam</span>
                <strong className="text-lg text-ink">
                  {formatTL(subtotal)}
                </strong>
              </div>
              <p className="text-xs text-muted mb-3">Kargo, ödeme adımında hesaplanır.</p>
              <Link
                href="/odeme"
                onClick={() => setOpen(false)}
                className="block text-center w-full py-4 rounded-none bg-ink text-white text-sm uppercase tracking-[0.06em] font-semibold hover:bg-ink-2 transition"
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
