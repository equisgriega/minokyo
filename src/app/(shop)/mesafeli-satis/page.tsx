import ContentPage from "@/components/ContentPage";

export const metadata = { title: "Mesafeli Satış Sözleşmesi — minokyo" };

export default function Page() {
  return (
    <ContentPage title="Mesafeli Satış Sözleşmesi" updated="19.09.2026">
      <h2>1. Taraflar</h2>
      <p>
        İşbu sözleşme, SATICI <strong>minokyo</strong> [ünvan / adres / vergi no] ile ALICI (sipariş
        veren tüketici) arasında aşağıdaki şartlarla kurulmuştur.
      </p>
      <h2>2. Konu</h2>
      <p>
        Sözleşmenin konusu, ALICI'nın minokyo internet sitesinden elektronik ortamda sipariş verdiği
        ürünün satışı ve teslimine ilişkin 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
        Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca tarafların hak ve yükümlülükleridir.
      </p>
      <h2>3. Ürün ve Ödeme</h2>
      <p>
        Ürünlerin türü, miktarı, satış bedeli ve ödeme şekli sipariş sayfasında belirtildiği
        gibidir. Fiyatlara KDV dahildir.
      </p>
      <h2>4. Teslimat</h2>
      <p>
        Ürün, sipariş onayından sonra kargoya verilir ve ALICI'nın belirttiği adrese teslim edilir.
        Teslimat ve kargo koşulları İade & Teslimat sayfasında belirtilmiştir.
      </p>
      <h2>5. Cayma Hakkı</h2>
      <p>
        ALICI, ürünü teslim aldığı tarihten itibaren <strong>14 gün</strong> içinde herhangi bir
        gerekçe göstermeksizin cayma hakkına sahiptir. Cayma hakkının kullanımı için ürünün
        kullanılmamış ve yeniden satılabilir durumda olması gerekir.
      </p>
      <h2>6. Uyuşmazlık</h2>
      <p>
        Uyuşmazlıklarda ALICI'nın yerleşim yerindeki Tüketici Hakem Heyetleri ve Tüketici
        Mahkemeleri yetkilidir.
      </p>
      <p><em>Not: Bu metin bir taslaktır; işletme bilgilerinizle doldurulmalı ve hukuki olarak gözden geçirilmelidir.</em></p>
    </ContentPage>
  );
}
