"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import Logo from "./Logo";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "./Icons";

type HeaderUser = { name: string | null } | null;

const ANNOUNCEMENTS = [
  "500₺ ve üzeri siparişlerde kargo bedava",
  "İlk siparişe %10 indirim: ILK10",
  "14 gün içinde kolay iade",
];

export default function Header() {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState<HeaderUser>(null);

  // Oturum durumunu istemci tarafında çek — sayfa HTML'i CDN'den statik gelir.
  useEffect(() => {
    let alive = true;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) setUser(d.user);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const nav = [
    { href: "/urunler", label: "Tümü" },
    { href: "/urunler?cinsiyet=kiz", label: "Kız Çocuk" },
    { href: "/urunler?cinsiyet=erkek", label: "Erkek Çocuk" },
    { href: "/urunler?kategori=takimlar", label: "Takımlar" },
    { href: "/urunler?kategori=pantolonlar", label: "Pantolonlar" },
  ];

  const iconBtn = "w-10 h-10 grid place-items-center text-[#111111] hover:opacity-60 transition";
  // Kesintisiz kayma için metni iki kez yan yana koyuyoruz
  const ticker = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS];

  return (
    <>
      <div className="bg-[#111111] text-white text-[12px] font-medium py-2 overflow-hidden whitespace-nowrap">
        <div className="inline-flex animate-marquee">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0" aria-hidden={k === 1}>
              {ticker.map((t, i) => (
                <span key={i} className="px-8">
                  {t}
                  <span className="pl-16 opacity-50">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-5 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
          {/* Sol: mobil menü / masaüstü arama */}
          <div className="flex items-center">
            <button className={`md:hidden -ml-2 ${iconBtn}`} onClick={() => setMenu((v) => !v)} aria-label="Menü">
              {menu ? <CloseIcon /> : <MenuIcon />}
            </button>
            <Link href="/arama" className={`hidden md:grid -ml-2 ${iconBtn}`} aria-label="Ara">
              <SearchIcon />
            </Link>
          </div>

          {/* Orta: logo */}
          <Link href="/" aria-label="minokyo ana sayfa" className="flex items-center justify-center">
            <Logo size={40} priority />
          </Link>

          {/* Sağ: hesap + sepet */}
          <div className="flex items-center justify-end gap-1">
            <Link href="/arama" className={`md:hidden ${iconBtn}`} aria-label="Ara">
              <SearchIcon />
            </Link>
            <Link
              href={user ? "/hesabim" : "/giris"}
              className={iconBtn}
              aria-label={user ? "Hesabım" : "Giriş yap"}
              title={user ? (user.name?.split(" ")[0] ?? "Hesabım") : "Giriş yap"}
            >
              <UserIcon />
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 h-10 pl-2 text-[#111111] hover:opacity-60 transition"
              aria-label="Sepet"
            >
              <BagIcon />
              <span className="hidden md:inline text-[13px]">Sepetim ({count})</span>
              {count > 0 && (
                <span className="md:hidden -ml-3 -mt-4 bg-[#111111] text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full grid place-items-center px-1">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Masaüstü menü — logonun altında, büyük harf */}
        <nav className="hidden md:flex justify-center gap-10 pb-3 -mt-1">
          {nav.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#111111] hover:underline underline-offset-4"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {menu && (
          <nav className="md:hidden bg-white border-t border-[#e5e5e5] px-5 py-2 flex flex-col">
            {nav.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setMenu(false)}
                className="py-3.5 text-[13px] font-medium uppercase tracking-[0.08em] text-[#111111] border-b border-[#f0f0f0] last:border-0"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href={user ? "/hesabim" : "/giris"}
              onClick={() => setMenu(false)}
              className="mt-1 py-3.5 flex items-center gap-2 text-[13px] font-medium text-[#111111]"
            >
              <UserIcon size={18} />
              {user ? (user.name?.split(" ")[0] ?? "Hesabım") : "Giriş / Üye Ol"}
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
