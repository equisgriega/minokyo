"use client";

import { useState } from "react";
import { subscribe } from "@/app/cok-yakinda/actions";

export default function FooterNewsletter() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    const res = await subscribe(new FormData(form));
    setLoading(false);
    setMsg({ ok: res.ok, text: res.msg });
    if (res.ok) form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md mx-auto">
      <div className="flex">
        <input
          name="email"
          type="email"
          required
          placeholder="E-posta adresinizi girin"
          className="flex-1 min-w-0 px-4 py-3 border border-line border-r-0 bg-white text-base md:text-sm text-ink placeholder:text-faint focus:outline-none focus:border-ink"
        />
        <button
          disabled={loading}
          className="px-6 py-3 bg-ink text-white text-sm font-semibold hover:bg-ink-2 transition disabled:opacity-60"
        >
          {loading ? "..." : "Gönder"}
        </button>
      </div>
      {msg && (
        <p className={`text-xs mt-2 ${msg.ok ? "text-success" : "text-red-600"}`}>{msg.text}</p>
      )}
    </form>
  );
}
