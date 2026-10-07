import type { MetadataRoute } from "next";

const BASE = process.env.APP_URL || "https://minokyo.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Kişisel veri veya işlem içeren sayfalar arama motorlarına kapalı
        disallow: ["/admin", "/api", "/odeme", "/hesabim", "/siparis", "/giris", "/kayit", "/onizleme"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
