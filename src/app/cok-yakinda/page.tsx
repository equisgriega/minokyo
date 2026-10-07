import ComingSoonForm from "@/components/ComingSoonForm";
import Logo from "@/components/Logo";
import { LeafIcon, SparkleIcon, TruckIcon } from "@/components/Icons";

export const metadata = { title: "minokyo — Çok Yakında" };

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden bg-ink">
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
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 to-ink/85" />

      <div className="relative z-10 max-w-xl">
        <div className="flex justify-center mb-4">
          <Logo light size={120} priority />
        </div>
        <p className="text-white font-semibold tracking-widest uppercase text-sm mb-8">
          Çok Yakında
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
          Minik tarzlar, büyük mutluluklar
        </h1>
        <p className="text-white/85 mb-8">
          Çocuklar için rahat, şık ve kaliteli kıyafetlerle çok yakında buradayız. Açılışta ilk
          haberdar olmak ve <strong className="text-white">%10 indirim</strong> kazanmak için
          e-postanı bırak.
        </p>

        <ComingSoonForm />

        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-10 text-white/80 text-[12px] font-medium uppercase tracking-[0.08em]">
          <span className="flex items-center gap-2"><LeafIcon size={16} /> %100 Pamuk</span>
          <span className="flex items-center gap-2"><SparkleIcon size={16} /> Yumuşak Doku</span>
          <span className="flex items-center gap-2"><TruckIcon size={16} /> Hızlı Kargo</span>
        </div>
        <div className="mt-6 text-white/60 text-sm">Instagram · TikTok: @minokyo</div>
      </div>
    </div>
  );
}
