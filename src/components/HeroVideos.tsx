"use client";

import { useEffect, useRef, useState } from "react";

/**
 * bgstore tarzı: birden fazla videoyu sırayla, yumuşak geçişle döndürür.
 * Tek video verilirse sürekli döner (loop). Siyah şeritleri gizlemek için
 * hafif yakınlaştırma (scale) + object-cover kullanılır.
 */
export default function HeroVideos({
  videos,
  poster,
  zoom = 1.08,
}: {
  videos: string[];
  poster?: string;
  zoom?: number;
}) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLVideoElement>(null);
  const single = videos.length <= 1;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [index]);

  return (
    <video
      key={index}
      ref={ref}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ transform: `scale(${zoom})`, animation: "heroFade 1.2s ease" }}
      src={videos[index]}
      poster={poster}
      autoPlay
      muted
      playsInline
      preload="auto"
      loop={single}
      onEnded={() => {
        if (!single) setIndex((i) => (i + 1) % videos.length);
      }}
      aria-hidden="true"
    />
  );
}
