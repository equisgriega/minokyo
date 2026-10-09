"use client";

import { useState } from "react";
import { deleteAccount } from "@/app/(shop)/auth-actions";

/** Hesabım sayfasının altında: hesabı kalıcı silme (şifre + onay ister). */
export default function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Başarılı olursa sunucu ana sayfaya yönlendirir
    const res = await deleteAccount(new FormData(e.currentTarget));
    setLoading(false);
    if (res && !res.ok) setError(res.message);
  }

  return (
    <section id="hesap-sil" className="mt-14 pt-8 border-t border-line">
      <h2 className="font-bold text-lg mb-1">Hesabı Sil</h2>
      <p className="text-sm text-muted mb-4">
        Hesabın ve kayıtlı bilgilerin (ad, e-posta, telefon, adresler) kalıcı olarak silinir. Geçmiş siparişlerin
        yasal saklama yükümlülüğü nedeniyle hesabından ayrılarak saklanır.
      </p>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-50 transition"
        >
          Hesabımı Sil
        </button>
      ) : (
        <form onSubmit={onSubmit} className="max-w-sm space-y-3 bg-card border border-red-200 p-5">
          {error && <p className="text-sm text-red-700">{error}</p>}
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Şifren"
            className="w-full px-4 py-3 border border-line bg-subtle text-base md:text-sm focus:outline-none focus:border-ink-2"
          />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="confirm" required className="mt-1 accent-ink" />
            Hesabımın kalıcı olarak silineceğini ve bunun geri alınamayacağını anlıyorum.
          </label>
          <div className="flex gap-2">
            <button
              disabled={loading}
              className="px-5 py-2.5 bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition disabled:opacity-60"
            >
              {loading ? "Siliniyor..." : "Kalıcı Olarak Sil"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 text-sm text-muted">
              Vazgeç
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
