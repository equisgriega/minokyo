import ContentPage from "@/components/ContentPage";

export const metadata = { title: "Gizlilik & KVKK — minokyo" };

export default function Page() {
  return (
    <ContentPage title="Gizlilik Politikası & KVKK Aydınlatma Metni" updated="19.09.2026">
      <p>
        minokyo olarak kişisel verilerinizin gizliliğine önem veriyoruz. Bu metin, 6698 sayılı
        Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında hazırlanmıştır.
      </p>
      <h2>Toplanan Veriler</h2>
      <ul>
        <li>Kimlik ve iletişim bilgileri (ad, soyad, e-posta, telefon, adres)</li>
        <li>Sipariş ve ödeme bilgileri</li>
        <li>Site kullanım ve çerez verileri (analiz ve reklam için)</li>
      </ul>
      <h2>Verilerin İşlenme Amacı</h2>
      <ul>
        <li>Siparişlerin hazırlanması, teslimi ve müşteri desteği</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi (fatura vb.)</li>
        <li>İzniniz olması halinde pazarlama ve kişiselleştirilmiş reklam</li>
      </ul>
      <h2>Çerezler</h2>
      <p>
        Sitemiz; deneyimi iyileştirmek ve reklam ölçümü için çerez kullanır. Pazarlama çerezleri
        yalnızca onayınızla çalışır. Çerez tercihlerinizi dilediğiniz an değiştirebilirsiniz.
      </p>
      <h2>Haklarınız</h2>
      <p>
        KVKK madde 11 kapsamında verilerinize erişme, düzeltme, silme ve işlemeye itiraz etme
        haklarına sahipsiniz. Talepleriniz için{" "}
        <a href="mailto:merhaba@minokyo.com">merhaba@minokyo.com</a> adresine yazabilirsiniz.
      </p>
      <p><em>Not: Bu metin bir taslaktır; yürürlükteki mevzuata göre gözden geçirilmelidir.</em></p>
    </ContentPage>
  );
}
