"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SORT_OPTIONS, listingHref, type SortKey } from "@/lib/sorting";
import { ChevronDownIcon, CloseIcon, SortIcon } from "./Icons";

/**
 * Sıralama menüsü — mobilde alttan açılan panel (UYGULA ile), masaüstünde açılır liste
 * (seçince anında uygular). Filtre parametreleri korunur.
 */
export default function SortMenu({
  current,
  cinsiyet,
  kategori,
}: {
  current: SortKey;
  cinsiyet?: string;
  kategori?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false); // mobil panel
  const [pop, setPop] = useState(false); // masaüstü açılır liste
  const [draft, setDraft] = useState<SortKey>(current);
  const popRef = useRef<HTMLDivElement>(null);

  const currentLabel = SORT_OPTIONS.find((o) => o.key === current)?.label ?? "Sırala";
  const go = (key: SortKey) => router.push(listingHref({ cinsiyet, kategori, sirala: key }), { scroll: false });

  function openSheet() {
    setDraft(current);
    setOpen(true);
  }

  // Panel açıkken sayfa kaymasın, Esc ile kapansın
  useEffect(() => {
    if (!open && !pop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPop(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (pop && popRef.current && !popRef.current.contains(e.target as Node)) setPop(false);
    };
    if (open) document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open, pop]);

  return (
    <>
      {/* Mobil: tam genişlik "Sırala" butonu */}
      <button
        type="button"
        onClick={openSheet}
        className="md:hidden w-full h-11 flex items-center justify-center gap-2 border border-line bg-card text-[13px] font-medium text-ink"
        aria-haspopup="dialog"
      >
        <SortIcon size={18} /> Sırala
        {current !== "akilli" && <span className="text-muted">· {currentLabel}</span>}
      </button>

      {/* Masaüstü: açılır liste */}
      <div ref={popRef} className="hidden md:block relative">
        <button
          type="button"
          onClick={() => setPop((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={pop}
          className="h-10 px-4 flex items-center gap-2 border border-line bg-card text-[13px] text-ink hover:border-ink transition"
        >
          <SortIcon size={16} />
          <span className="text-muted">Sırala:</span> {currentLabel}
          <ChevronDownIcon size={16} />
        </button>
        {pop && (
          <ul role="listbox" aria-label="Sıralama" className="absolute right-0 top-full mt-1 z-30 w-60 bg-card border border-line shadow-lg py-1">
            {SORT_OPTIONS.map((o) => (
              <li key={o.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.key === current}
                  onClick={() => {
                    setPop(false);
                    go(o.key);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-subtle ${
                    o.key === current ? "font-semibold text-ink" : "text-ink-2"
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mobil alt panel */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Sırala">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-paper px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="-ml-2 w-11 h-11 grid place-items-center text-ink">
                <CloseIcon size={26} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (draft !== current) go(draft);
                }}
                className="h-11 px-6 bg-ink text-white text-[13px] font-semibold uppercase tracking-[0.06em]"
              >
                Uygula
              </button>
            </div>
            <h2 className="text-xl font-bold text-ink mb-3">Sırala</h2>
            <div role="radiogroup" aria-label="Sıralama seçenekleri" className="flex flex-col">
              {SORT_OPTIONS.map((o) => (
                <label key={o.key} className="flex items-center gap-3 py-3 cursor-pointer text-[15px] text-ink">
                  <input
                    type="radio"
                    name="sirala"
                    value={o.key}
                    checked={draft === o.key}
                    onChange={() => setDraft(o.key)}
                    className="w-5 h-5 accent-ink"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
