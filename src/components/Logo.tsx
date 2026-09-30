import Image from "next/image";

// minokyo gerçek logosu (yuvarlak yama rozeti). Beyaz köşeler rounded-full ile kırpılır.
export default function Logo({
  size = 44,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Minokyo"
      width={size}
      height={size}
      priority={priority}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
