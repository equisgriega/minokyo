// minokyo logosu — mor "m" markası + gülümseme + "Minokyo" yazısı.
// Kullanıcının orijinal logosuna sadık, temiz SVG olarak yeniden çizildi.
// Renkler: mor #5a2e86, hardal #e4b33e.

function Mark({ purple, yellow, size }: { purple: string; yellow: string; size: number }) {
  return (
    <svg
      viewBox="0 0 110 104"
      width={size}
      height={(size * 104) / 110}
      fill="none"
      aria-hidden="true"
    >
      {/* m harfi (yuvarlak, kalın) */}
      <path
        d="M20 82 V52 Q20 37 37 37 Q54 37 54 52 V82 M54 52 Q54 37 71 37 Q88 37 88 52 V82"
        stroke={purple}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* gülümseme */}
      <path
        d="M15 84 Q54 106 97 74"
        stroke={purple}
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* sarı nokta */}
      <circle cx="95" cy="40" r="6.5" fill={yellow} />
    </svg>
  );
}

export default function Logo({
  layout = "horizontal",
  light = false,
  size = 30,
  className = "",
}: {
  layout?: "horizontal" | "stacked";
  light?: boolean;
  size?: number;
  className?: string;
}) {
  const purple = light ? "#ffffff" : "var(--brand-purple)";
  const yellow = "var(--brand-yellow)";

  if (layout === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-1 ${className}`}>
        <Mark purple={purple} yellow={yellow} size={size} />
        <span
          className="font-display font-extrabold leading-none"
          style={{ color: purple, fontSize: size * 0.9 }}
        >
          Minokyo
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark purple={purple} yellow={yellow} size={size} />
      <span
        className="font-display font-extrabold leading-none"
        style={{ color: purple, fontSize: size * 0.85 }}
      >
        Minokyo
      </span>
    </span>
  );
}
