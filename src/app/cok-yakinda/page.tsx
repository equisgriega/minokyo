import ComingSoonForm from "@/components/ComingSoonForm";

export const metadata = { title: "minokyo — Çok Yakında" };

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden bg-[#5c4230]">
      {/* Arka plan video */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        src="/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{ transform: "scale(1.08)" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#5c4230]/70 to-[#3b2f28]/85" />

      <div className="relative z-10 max-w-xl">
        <div className="font-display text-5xl md:text-6xl font-extrabold text-white mb-3">minokyo</div>
        <p className="text-[#f4d06f] font-semibold tracking-widest uppercase text-sm mb-8">
          Çok Yakında
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
          Minik tarzlar, büyük mutluluklar
        </h1>
        <p className="text-white/85 mb-8">
          Çocuklar için rahat, şık ve kaliteli kıyafetlerle çok yakında buradayız. Açılışta ilk
          haberdar olmak ve <strong className="text-[#f4d06f]">%10 indirim</strong> kazanmak için
          e-postanı bırak.
        </p>

        <ComingSoonForm />

        <div className="flex gap-5 justify-center mt-10 text-white/80 text-sm font-medium">
          <span>🌱 %100 Pamuk</span>
          <span>☁️ Yumuşak Doku</span>
          <span>🚚 Hızlı Kargo</span>
        </div>
        <div className="mt-6 text-white/60 text-sm">Instagram · TikTok: @minokyo</div>
      </div>
    </div>
  );
}
