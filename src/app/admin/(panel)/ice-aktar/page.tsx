"use client";

import { useActionState } from "react";
import { importAction, type ImportResult } from "./actions";

const TEMPLATE = `slug;name;description;price;gender;category;image;stok2;stok3;stok4;stok5;stok6
ornek-urun;Örnek Ürün;Kısa açıklama;499;kiz;takimlar;/products/p2.jpeg;5;5;3;2;4`;

export default function ImportPage() {
  const [state, formAction, pending] = useActionState<ImportResult | null, FormData>(
    importAction,
    null
  );

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Toplu Ürün İçe Aktar</h1>
      <p className="text-[#6b5c51] mb-6">
        Excel&apos;de tabloyu hazırla → <strong>Farklı Kaydet → CSV</strong> → içeriği aşağıya yapıştır.
        Mevcut slug&apos;lar atlanır.
      </p>

      <div className="bg-white rounded-2xl border border-[#e6dccd] p-5 mb-5">
        <h2 className="font-bold text-sm mb-2">Sütun başlıkları (ilk satır)</h2>
        <pre className="text-xs bg-[#faf7f1] p-3 rounded-xl overflow-x-auto whitespace-pre">{TEMPLATE}</pre>
        <p className="text-xs text-[#6b5c51] mt-2">
          Ayraç <code>;</code> veya <code>,</code> olabilir. Kategori: takimlar / ust-giyim /
          pantolonlar. Cinsiyet: kiz / erkek / unisex. Metinlerde ayraç kullanma.
        </p>
      </div>

      <form action={formAction} className="bg-white rounded-2xl border border-[#e6dccd] p-5">
        <textarea
          name="csv"
          rows={10}
          required
          placeholder="CSV içeriğini buraya yapıştır..."
          className="w-full px-4 py-3 rounded-xl border border-[#e6dccd] bg-[#f7f2ea] font-mono text-xs focus:outline-none focus:border-[#7a5a42]"
        />
        <button
          disabled={pending}
          className="mt-4 px-6 py-2.5 rounded-full bg-[#5c4230] text-white font-semibold hover:bg-[#7a5a42] transition disabled:opacity-60"
        >
          {pending ? "İçe aktarılıyor..." : "İçe Aktar"}
        </button>
      </form>

      {state && (
        <div className="bg-white rounded-2xl border border-[#e6dccd] p-5 mt-5">
          <p className="font-semibold text-[#3f8f6b]">
            ✅ {state.created} ürün eklendi · {state.skipped} atlandı
          </p>
          {state.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-red-600">Hatalar:</p>
              <ul className="text-xs text-red-600 list-disc pl-5 mt-1">
                {state.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
