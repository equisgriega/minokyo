"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import Logo from "./Logo";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "./Icons";

type HeaderUser = { name: string | null } | null;

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
    { href: "/urunler", label: "Tüm Ürünler" },
    { href: "/urunler?cinsiyet=kiz", label: "Kız" },
    { href: "/urunler?cinsiyet=erkek", label: "Erkek" },
    { href: "/urunler?kategori=takimlar", label: "Takımlar" },
    { href: "/urunler?kategori=pantolonlar", label: "Pantolonlar" },
  ];

  const iconBtn =
    "w-10 h-10 grid place-items-center rounded-full text-[#2f2545] hover:bg-[#f4f0fa] transition";

  return (
    <>
      <div className="bg-[#5a2e86] text-white text-center text-xs tracking-wide py-2 px-4">
        500₺ ve üzeri siparişlerde kargo bedava · İlk siparişe %10 indirim: <strong>ILK10</strong>
      </div>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#ece7f5]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-4">
          <button className={`md:hidden -ml-2 ${iconBtn}`} onClick={() => setMenu((v) => !v)} aria-label="Menü">
            {menu ? <CloseIcon /> : <MenuIcon />}
          </button>

          <Link href="/" aria-label="minokyo ana sayfa" className="flex items-center">
            <Logo size={42} priority />
          </Link>

          <nav className="hidden md:flex gap-7 ml-6 flex-1">
            {nav.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="text-sm text-[#2f2545] hover:text-[#5a2e86] transition"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto md:ml-0 flex items-center">
            <Link href="/arama" className={iconBtn} aria-label="Ara">
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
            <button onClick={() => setOpen(true)} className={`relative ${iconBtn}`} aria-label="Sepet">
              <BagIcon />
              {count > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#e4b33e] text-[#2f2545] text-[10px] font-bold min-w-[17px] h-[17px] rounded-full grid place-items-center px-1">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {menu && (
          <nav className="md:hidden bg-white border-t border-[#ece7f5] px-5 py-3 flex flex-col">
            {nav.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setMenu(false)}
                className="py-3 text-[15px] text-[#2f2545] border-b border-[#f4f0fa] last:border-0"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href={user ? "/hesabim" : "/giris"}
              onClick={() => setMenu(false)}
              className="mt-2 py-3 flex items-center gap-2 text-[15px] font-medium text-[#5a2e86]"
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
