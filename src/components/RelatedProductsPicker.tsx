"use client";

import { useState } from "react";
import { updateRelatedProducts } from "@/app/admin/(panel)/products/actions";

type Option = { id: string; name: string; image?: string; categoryName?: string };

export default function RelatedProductsPicker({
  productId,
  options,
  initialSelected,
}: {
  productId: string;
  options: Option[];
  initialSelected: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState(false);

  function toggle(id: string) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(q.trim().toLowerCase())
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("id", productId);
    selected.forEach((id) => fd.append("relatedIds", id));
    await updateRelatedProducts(fd);
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-[#e5e5e5] p-6 mt-6">
      <h2 className="font-bold mb-1">🔗 Bağlı Ürünler — “Kombini Tamamla”</h2>
      <p className="text-sm text-[#6b6b6b] mb-4">
        Bu ürünün sayfasında birlikte önerilecek ürünleri seç. Seçilmezse otomatik öneri gösterilir.
      </p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ürün ara…"
        className="w-full px-4 py-2.5 mb-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] focus:outline-none focus:border-[#444444]"
      />

      <div className="max-h-72 overflow-y-auto divide-y divide-[#f0f0f0] border border-[#f0f0f0] rounded-xl">
        {filtered.length === 0 && (
          <p className="text-sm text-[#6b6b6b] p-4">Eşleşen ürün yok.</p>
        )}
        {filtered.map((o) => (
          <label
            key={o.id}
            className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-[#fafafa]"
          >
            <input
              type="checkbox"
              checked={selected.has(o.id)}
              onChange={() => toggle(o.id)}
              className="accent-[#111111] w-4 h-4"
            />
            {o.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={o.image}
                alt=""
                className="w-9 h-11 object-cover rounded-lg border border-[#e5e5e5]"
              />
            )}
            <span className="text-sm font-medium">{o.name}</span>
            {o.categoryName && (
              <span className="ml-auto text-xs text-[#6b6b6b]">{o.categoryName}</span>
            )}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button className="px-6 py-2.5 rounded-none bg-[#111111] text-white font-semibold hover:bg-[#444444] transition">
          Bağlantıları Kaydet
        </button>
        <span className="text-sm text-[#6b6b6b]">{selected.size} ürün seçili</span>
        {saved && <span className="text-sm text-green-600 font-medium">✓ Kaydedildi</span>}
      </div>
    </form>
  );
}
