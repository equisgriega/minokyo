"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartContext";
import Logo from "./Logo";

type HeaderUser = { name: string | null; email: string } | null;

export default function Header({ user }: { user: HeaderUser }) {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);

  const nav = [
    { href: "/urunler", label: "Tüm Ürünler" },
    { href: "/urunler?cinsiyet=kiz", label: "Kız" },
    { href: "/urunler?cinsiyet=erkek", label: "Erkek" },
    { href: "/urunler?kategori=takimlar", label: "Takımlar" },
    { href: "/urunler?kategori=pantolonlar", label: "Pantolonlar" },
  ];

  return (
    <>
      <div className="bg-[#5c4230] text-white text-center text-[13px] py-2 px-4">
        ✨ 500₺ ve üzeri alışverişlerde <strong>kargo bedava</strong> ✨
      </div>
      <header className="sticky top-0 z-40 bg-[#f7f2ea]/90 backdrop-blur border-b border-[#e6dccd]">
        <div className="max-w-6xl mx-auto px-5 h-[68px] flex items-center gap-5">
          <button
            className="md:hidden text-2xl leading-none"
            onClick={() => setMenu((v) => !v)}
            aria-label="Menü"
          >
            ☰
          </button>

          <Link href="/" aria-label="minokyo ana sayfa">
            <Logo size={28} />
          </Link>

          <nav className="hidden md:flex gap-6 ml-4 flex-1">
            {nav.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="text-sm font-medium text-[#6b5c51] hover:text-[#5c4230] transition"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto md:ml-0 flex items-center gap-1">
            <Link
              href="/arama"
              className="w-11 h-11 grid place-items-center rounded-full hover:bg-[#efe7db] transition text-[#6b5c51]"
              aria-label="Ara"
            >
              <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </Link>
            <Link
              href={user ? "/hesabim" : "/giris"}
              className="hidden sm:flex items-center gap-2 px-3 h-11 rounded-full hover:bg-[#efe7db] transition text-sm font-medium text-[#6b5c51]"
            >
              <span className="text-lg">👤</span>
              <span>{user ? (user.name?.split(" ")[0] ?? "Hesabım") : "Giriş"}</span>
            </Link>

            <button
              onClick={() => setOpen(true)}
              className="relative w-11 h-11 grid place-items-center rounded-full hover:bg-[#efe7db] transition"
              aria-label="Sepet"
            >
              <span className="text-xl">🛒</span>
              {count > 0 && (
                <span className="absolute top-1 right-0 bg-[#e8a87c] text-white text-[11px] font-bold min-w-[18px] h-[18px] rounded-full grid place-items-center px-1">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {menu && (
          <nav className="md:hidden bg-[#f7f2ea] border-t border-[#e6dccd] px-5 py-4 flex flex-col gap-3">
            {nav.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setMenu(false)}
                className="text-sm font-medium text-[#6b5c51]"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href={user ? "/hesabim" : "/giris"}
              onClick={() => setMenu(false)}
              className="text-sm font-semibold text-[#5c4230] border-t border-[#e6dccd] pt-3"
            >
              👤 {user ? (user.name?.split(" ")[0] ?? "Hesabım") : "Giriş / Üye Ol"}
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
