import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#5c4230] text-[#eaded2] mt-auto">
      <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="font-display text-2xl font-extrabold text-white">minokyo</div>
          <p className="text-sm opacity-75 mt-2">Minik tarzlar, büyük mutluluklar.</p>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3 text-sm">Alışveriş</h5>
          <div className="space-y-2 text-sm opacity-80">
            <Link href="/urunler" className="block hover:opacity-100">Tüm Ürünler</Link>
            <Link href="/urunler?cinsiyet=kiz" className="block hover:opacity-100">Kız</Link>
            <Link href="/urunler?cinsiyet=erkek" className="block hover:opacity-100">Erkek</Link>
            <Link href="/urunler?kategori=takimlar" className="block hover:opacity-100">Takımlar</Link>
          </div>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3 text-sm">Yardım</h5>
          <div className="space-y-2 text-sm opacity-80">
            <Link href="/iade-teslimat" className="block hover:opacity-100">İade & Teslimat</Link>
            <Link href="/sss" className="block hover:opacity-100">Sıkça Sorulanlar</Link>
            <Link href="/mesafeli-satis" className="block hover:opacity-100">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/gizlilik" className="block hover:opacity-100">Gizlilik & KVKK</Link>
          </div>
        </div>
        <div>
          <h5 className="text-white font-semibold mb-3 text-sm">Kurumsal</h5>
          <div className="space-y-2 text-sm opacity-80">
            <Link href="/hakkimizda" className="block hover:opacity-100">Hakkımızda</Link>
            <Link href="/iletisim" className="block hover:opacity-100">İletişim</Link>
            <span className="block">merhaba@minokyo.com</span>
            <span className="block">Pzt–Cmt · 09:00–18:00</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
        © 2026 minokyo. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
