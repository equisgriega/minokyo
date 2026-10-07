"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [decided, setDecided] = useState(true); // başlangıçta gösterme (flash önle)

  useEffect(() => {
    try {
      setDecided(Boolean(localStorage.getItem("mnk_consent")));
    } catch {}
  }, []);

  function choose(value: "granted" | "denied") {
    try {
      localStorage.setItem("mnk_consent", value);
    } catch {}
    window.dispatchEvent(new Event("mnk-consent"));
    setDecided(true);
  }

  if (decided) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[70] p-3 sm:p-4">
      <div className="max-w-3xl mx-auto bg-card border border-line rounded-2xl shadow-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-sm text-ink flex-1">
          minokyo; deneyimini iyileştirmek ve reklamları ölçmek için çerez kullanır.{" "}
          <Link href="/gizlilik" className="underline text-ink font-medium">
            Detaylı bilgi
          </Link>
          . Pazarlama çerezleri yalnızca onayınla çalışır.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => choose("denied")}
            className="px-4 py-2.5 rounded-none border border-line text-sm font-semibold text-muted hover:border-ink-2 transition"
          >
            Reddet
          </button>
          <button
            onClick={() => choose("granted")}
            className="px-5 py-2.5 rounded-none bg-ink text-white text-sm font-semibold hover:bg-ink-2 transition"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
