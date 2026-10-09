"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset, resetPassword } from "@/app/(shop)/sifre-actions";

const field =
  "w-full px-4 py-3 border border-line bg-subtle text-base md:text-sm focus:outline-none focus:border-ink-2";
const button =
  "w-full py-3.5 bg-ink text-white font-semibold hover:bg-ink-2 transition disabled:opacity-60";

function Message({ msg }: { msg: { ok: boolean; message: string } | null }) {
  if (!msg) return null;
  return (
    <div
      role="status"
      className={`mb-4 text-sm px-4 py-3 border ${
        msg.ok ? "text-success bg-[#eef6f1] border-[#cfe5d8]" : "text-red-700 bg-red-50 border-red-200"
      }`}
    >
      {msg.message}
    </div>
  );
}

/** 1. adım: e-posta ile sıfırlama linki iste */
export function ForgotPasswordForm() {
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await requestPasswordReset(new FormData(e.currentTarget));
    setLoading(false);
    setMsg(res);
    if (res.ok) setSent(true);
  }

  return (
    <>
      <Message msg={msg} />
      {!sent && (
        <form onSubmit={onSubmit} className="space-y-4">
          <input name="email" type="email" required autoComplete="email" placeholder="E-posta" className={field} />
          <button disabled={loading} className={button}>
            {loading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
          </button>
        </form>
      )}
    </>
  );
}

/** 2. adım: linkle gelen kullanıcı yeni şifre belirler */
export function ResetPasswordForm({ token }: { token: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("token", token);
    setLoading(true);
    const res = await resetPassword(fd);
    setLoading(false);
    setMsg(res);
    if (res.ok) setDone(true);
  }

  return (
    <>
      <Message msg={msg} />
      {done ? (
        <Link href="/giris" className={`${button} block text-center`}>
          Giriş Yap
        </Link>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Yeni şifre (en az 8 karakter)"
            className={field}
          />
          <input
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Yeni şifre (tekrar)"
            className={field}
          />
          <button disabled={loading} className={button}>
            {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      )}
    </>
  );
}
