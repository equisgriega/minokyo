import ContentPage from "@/components/ContentPage";

export const metadata = { title: "İletişim — minokyo" };

export default function Page() {
  return (
    <ContentPage title="İletişim">
      <p>Bize her zaman ulaşabilirsin — sorularını memnuniyetle yanıtlarız.</p>
      <h2>E-posta</h2>
      <p>
        <a href="mailto:merhaba@minokyo.com">merhaba@minokyo.com</a>
      </p>
      <h2>Telefon / WhatsApp</h2>
      <p>+90 000 000 00 00 (Pzt–Cmt · 09:00–18:00)</p>
      <h2>Adres</h2>
      <p>[İşletme adresiniz]</p>
      <h2>Sosyal Medya</h2>
      <p>Instagram: @minokyo · TikTok: @minokyo</p>
    </ContentPage>
  );
}
