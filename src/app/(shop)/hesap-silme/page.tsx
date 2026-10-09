import Link from "next/link";

// Google Play "hesap silme" bağlantısı için herkese açık açıklama sayfası
export const metadata = { title: "Hesap Silme — minokyo" };

export default function AccountDeletionPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="text-xl md:text-2xl font-bold uppercase tracking-[0.04em] text-ink mb-6">Hesap Silme</h1>
      <div className="space-y-5 text-[15px] leading-relaxed text-ink-2">
        <p>minokyo hesabını ve buna bağlı kişisel verilerini dilediğin zaman silebilirsin.</p>

        <div>
          <h2 className="font-semibold text-ink mb-2">Uygulama veya web sitesi üzerinden</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <Link href="/giris" className="underline underline-offset-2">Giriş yap</Link>.
            </li>
            <li>
              <Link href="/hesabim" className="underline underline-offset-2">Hesabım</Link> sayfasının en altındaki{" "}
              <strong>Hesabı Sil</strong> bölümüne git.
            </li>
            <li>Şifreni gir, onay kutusunu işaretle ve <strong>Kalıcı Olarak Sil</strong>&apos;e dokun.</li>
          </ol>
        </div>

        <div>
          <h2 className="font-semibold text-ink mb-2">E-posta ile</h2>
          <p>
            Hesabına erişemiyorsan, kayıtlı e-posta adresinden{" "}
            <a href="mailto:merhaba@minokyo.com?subject=Hesap%20silme%20talebi" className="underline underline-offset-2">
              merhaba@minokyo.com
            </a>{" "}
            adresine &quot;Hesap silme talebi&quot; konulu bir e-posta gönder. Talebin en geç 30 gün içinde işleme alınır.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-ink mb-2">Neler silinir, neler saklanır?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Silinir:</strong> ad soyad, e-posta, telefon, şifre, kayıtlı adresler ve oturum bilgileri.</li>
            <li>
              <strong>Saklanır:</strong> geçmiş sipariş ve fatura kayıtları, Vergi Usul Kanunu gereği 10 yıl süreyle
              hesabından ayrılmış olarak saklanır; bu süre sonunda silinir.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
