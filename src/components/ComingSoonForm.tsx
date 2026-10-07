"use client";

import { useState } from "react";
import { subscribe } from "@/app/cok-yakinda/actions";

export default function ComingSoonForm() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await subscribe(new FormData(e.currentTarget));
    setLoading(false);
    setMsg({ ok: res.ok, text: res.msg });
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          name="email"
          type="email"
          required
          placeholder="E-posta adresin"
          className="flex-1 px-5 py-3.5 rounded-none border-none bg-white text-ink placeholder:text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60"
        />
        <button
          disabled={loading}
          className="px-7 py-3.5 rounded-none bg-card text-ink font-bold hover:bg-line transition disabled:opacity-60"
        >
          {loading ? "..." : "Haber Ver"}
        </button>
      </div>
      {msg && (
        <p className={`text-sm mt-3 ${msg.ok ? "text-white" : "text-red-200"}`}>{msg.text}</p>
      )}
    </form>
  );
}
