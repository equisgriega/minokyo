import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "minokyo — Çocuk Giyim",
    short_name: "minokyo",
    description: "Çocuklar için rahat, şık ve kaliteli kıyafetler.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f2ea",
    theme_color: "#5c4230",
    lang: "tr",
    categories: ["shopping", "kids"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
