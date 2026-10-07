import ContentPage from "@/components/ContentPage";

export const metadata = { title: "İade & Teslimat — minokyo" };

export default function Page() {
  return (
    <ContentPage title="İade & Teslimat" updated="19.09.2026">
      <h2>Teslimat</h2>
      <ul>
        <li>Siparişler onaylandıktan sonra 1–3 iş günü içinde kargoya verilir.</li>
        <li>Teslimat süresi bölgeye göre 1–4 iş günüdür.</li>
        <li>500 TL ve üzeri alışverişlerde kargo ücretsizdir; altında 49,90 TL kargo ücreti uygulanır.</li>
        <li>Kargonuzu, gönderi sonrası ilettiğimiz takip numarasıyla izleyebilirsiniz.</li>
      </ul>
      <h2>İade & Değişim</h2>
      <ul>
        <li>Ürünü teslim aldıktan sonra <strong>14 gün</strong> içinde iade/değişim hakkınız vardır.</li>
        <li>Ürün kullanılmamış, etiketleri sökülmemiş ve orijinal ambalajında olmalıdır.</li>
        <li>İade talebi için <a href="mailto:merhaba@minokyo.com">merhaba@minokyo.com</a> adresine sipariş numaranızla yazın.</li>
        <li>Onaylanan iadelerde ücret, ödeme yönteminize 3–10 iş günü içinde iade edilir.</li>
      </ul>
      <h2>Cayma Hakkı</h2>
      <p>
        Mesafeli Satış Sözleşmesi kapsamında, tüketici 14 gün içinde herhangi bir gerekçe
        göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.
      </p>
      <p><em>Not: Bu metin bir taslaktır; yürürlükteki mevzuata göre gözden geçirilmelidir.</em></p>
    </ContentPage>
  );
}
