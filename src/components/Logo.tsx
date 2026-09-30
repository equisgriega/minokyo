import Image from "next/image";

// minokyo logosu (şeffaf). light=true → koyu zeminler için beyaz versiyon.
const AR = 379 / 260; // logo en/boy oranı

export default function Logo({
  size = 48,
  light = false,
  className = "",
  priority = false,
}: {
  size?: number; // yükseklik (px)
  light?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={light ? "/logo-white.png" : "/logo.png"}
      alt="Minokyo"
      width={Math.round(size * AR)}
      height={size}
      priority={priority}
      className={className}
      style={{ height: size, width: "auto" }}
    />
  );
}
