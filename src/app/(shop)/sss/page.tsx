import ContentPage from "@/components/ContentPage";

export const metadata = { title: "Sıkça Sorulan Sorular — minokyo" };

const faqs = [
  { q: "Kargo ne kadar sürede gelir?", a: "Siparişler 1–3 iş günü içinde kargoya verilir; teslimat genellikle 1–4 iş günü sürer." },
  { q: "Kargo ücreti ne kadar?", a: "500 TL ve üzeri alışverişlerde kargo ücretsizdir. Altındaki siparişlerde 49,90 TL kargo ücreti uygulanır." },
  { q: "Beden seçimini nasıl yapmalıyım?", a: "Ürün sayfasındaki Beden Tablosu'ndan çocuğunuzun yaş/boy bilgisine göre doğru bedeni seçebilirsiniz." },
  { q: "İade ve değişim mümkün mü?", a: "Evet. Ürünü teslim aldıktan sonra 14 gün içinde koşulsuz iade veya değişim yapabilirsiniz." },
  { q: "Hangi ödeme yöntemleri var?", a: "Kredi/banka kartı, havale/EFT ve kapıda ödeme seçenekleri mevcuttur." },
  { q: "Ürünler hangi kumaştan?", a: "Ürünlerimiz ağırlıklı olarak %100 pamuk ve hassas ciltler için uygun yumuşak kumaşlardan üretilir." },
];

export default function Page() {
  return (
    <ContentPage title="Sıkça Sorulan Sorular">
      {faqs.map((f) => (
        <div key={f.q}>
          <h2>{f.q}</h2>
          <p>{f.a}</p>
        </div>
      ))}
    </ContentPage>
  );
}
