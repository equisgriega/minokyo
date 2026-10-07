import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "minokyo — Çocuk Giyim",
    short_name: "minokyo",
    description: "Çocuklar için rahat, şık ve kaliteli kıyafetler.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafafa",
    theme_color: "#111111",
    lang: "tr",
    categories: ["shopping", "kids"],
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
