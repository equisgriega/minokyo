import Link from "next/link";
import Logo from "./Logo";
import FooterNewsletter from "./FooterNewsletter";

const LINKS = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/mesafeli-satis", label: "Satış Sözleşmesi" },
  { href: "/iade-teslimat", label: "İade & Teslimat" },
  { href: "/gizlilik", label: "Gizlilik & KVKK" },
  { href: "/sss", label: "Sıkça Sorulanlar" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Footer() {
  return (
    <footer className="bg-white text-[#111111] mt-auto border-t border-[#e5e5e5]">
      {/* Bülten */}
      <div className="max-w-7xl mx-auto px-5 py-14 text-center">
        <h5 className="text-sm font-bold uppercase tracking-[0.06em]">E-Bülten</h5>
        <p className="text-[13px] text-[#6b6b6b] mt-2 mb-5">
          Yeni ürün ve kampanyalardan ilk sen haberdar ol.
        </p>
        <FooterNewsletter />
      </div>

      {/* Bağlantılar */}
      <div className="max-w-7xl mx-auto px-5 pb-8 grid grid-cols-2 md:flex md:flex-wrap md:justify-center md:gap-x-8 text-[13px] text-[#444444]">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="py-2.5 md:py-1 text-center hover:text-[#111111] hover:underline underline-offset-4">
            {l.label}
          </Link>
        ))}
      </div>

      <div className="border-t border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-5 pt-6 pb-20 md:pb-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#6b6b6b] text-center">
          <Logo size={28} />
          <span>merhaba@minokyo.com · Pzt–Cmt 09:00–18:00</span>
          <span>© 2026 minokyo. Tüm hakları saklıdır.</span>
        </div>
      </div>
    </footer>
  );
}
