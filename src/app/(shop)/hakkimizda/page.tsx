import ContentPage from "@/components/ContentPage";

export const metadata = { title: "Hakkımızda — minokyo" };

export default function Page() {
  return (
    <ContentPage title="Hakkımızda">
      <p>
        <strong>minokyo</strong>, çocukların dünyasına renk katmak için doğdu. Her tasarımımızda üç
        şeyi önemsiyoruz: <strong>rahatlık</strong>, <strong>kalite</strong> ve{" "}
        <strong>neşe</strong>.
      </p>
      <p>
        Kumaşlarımızı hassas ciltler düşünülerek seçiyor, desenlerimizi minik hayal güçlerinden
        ilham alarak çiziyoruz. %100 pamuk, yumuşacık dokular ve gün boyu konfor — çünkü büyümek
        eğlenceli olmalı.
      </p>
      <p>Minik tarzlar, büyük mutluluklar. 💛</p>
    </ContentPage>
  );
}
