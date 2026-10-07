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
          className="flex-1 min-w-0 px-4 py-3 border border-[#e5e5e5] border-r-0 bg-white text-sm text-[#111111] placeholder:text-[#9a9a9a] focus:outline-none focus:border-[#111111]"
        />
        <button
          disabled={loading}
          className="px-6 py-3 bg-[#111111] text-white text-sm font-semibold hover:bg-[#444444] transition disabled:opacity-60"
        >
          {loading ? "..." : "Gönder"}
        </button>
      </div>
      {msg && (
        <p className={`text-xs mt-2 ${msg.ok ? "text-[#3f8f6b]" : "text-red-600"}`}>{msg.text}</p>
      )}
    </form>
  );
}
