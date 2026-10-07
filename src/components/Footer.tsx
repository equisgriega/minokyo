import Link from "next/link";
import Logo from "./Logo";
import FooterNewsletter from "./FooterNewsletter";
import PaymentBadges from "./PaymentBadges";

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
    <footer className="bg-paper text-ink mt-auto border-t border-line">
      {/* Bülten */}
      <div className="max-w-7xl mx-auto px-5 py-14 text-center">
        <h5 className="text-sm font-bold uppercase tracking-[0.06em]">E-Bülten</h5>
        <p className="text-[13px] text-muted mt-2 mb-5">
          Yeni ürün ve kampanyalardan ilk sen haberdar ol.
        </p>
        <FooterNewsletter />
      </div>

      {/* Bağlantılar */}
      <div className="max-w-7xl mx-auto px-5 pb-8 grid grid-cols-2 md:flex md:flex-wrap md:justify-center md:gap-x-8 text-[13px] text-ink-2">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="py-2.5 md:py-1 text-center hover:text-ink hover:underline underline-offset-4">
            {l.label}
          </Link>
        ))}
      </div>

      {/* Sosyal medya + ödeme yöntemleri */}
      <div className="max-w-7xl mx-auto px-5 pb-8 flex flex-col items-center gap-5">
        <div className="flex items-center gap-2">
          <a href="https://instagram.com/minokyo" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 grid place-items-center text-ink hover:opacity-60 transition">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
            </svg>
          </a>
          <a href="https://www.tiktok.com/@minokyo" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-10 h-10 grid place-items-center text-ink hover:opacity-60 transition">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
              <path d="M14 3c.5 2.6 2.4 4.4 5 4.6" />
            </svg>
          </a>
        </div>
        <PaymentBadges />
      </div>

      <div className="border-t border-line">
        <div className="max-w-7xl mx-auto px-5 pt-6 pb-20 md:pb-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted text-center">
          <Logo size={28} />
          <span>merhaba@minokyo.com · Pzt–Cmt 09:00–18:00</span>
          <span>© 2026 minokyo. Tüm hakları saklıdır.</span>
        </div>
      </div>
    </footer>
  );
}
