import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Geliştirmede telefon/başka cihazdan ağ IP'siyle erişim için (HMR/canlı yenileme).
  // IP'niz değişirse buradaki değeri güncelleyin.
  allowedDevOrigins: ["192.168.1.147", "192.168.1.*"],
  // iyzipay dinamik require kullanıyor; Node native require ile dışarıda bırak.
  serverExternalPackages: ["iyzipay"],
};

export default nextConfig;
