import type { NextConfig } from "next";

// Tüm sayfalara eklenen güvenlik başlıkları.
// Not: script-src kısıtlanmadı — Next.js ve Meta/TikTok pikselleri satır içi script kullanıyor;
// bunu daraltmak nonce tabanlı CSP gerektirir. Buradaki yönergeler hiçbir özelliği bozmaz.
const securityHeaders = [
  // Siteyi başka sitelerde çerçeveye alıp tıklatma (clickjacking) engeli
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Content-Security-Policy",
    value: [
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      // Formlar yalnızca kendi sitemize ve iyzico'ya gönderilebilir
      "form-action 'self' https://*.iyzipay.com",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
];

const nextConfig: NextConfig = {
  // Geliştirmede telefon/başka cihazdan ağ IP'siyle erişim için (HMR/canlı yenileme).
  // IP'niz değişirse buradaki değeri güncelleyin.
  allowedDevOrigins: ["192.168.1.147", "192.168.1.*"],
  // iyzipay dinamik require kullanıyor; Node native require ile dışarıda bırak.
  serverExternalPackages: ["iyzipay"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
