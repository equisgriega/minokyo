import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.minokyo.app",
  appName: "minokyo",
  // Native derleme için gerekli (kullanılmıyor; içerik server.url'den yüklenir)
  webDir: "public",
  server: {
    // Uygulama canlı siteyi açar. Yayına çıkınca burası minokyo.com olmalı.
    // Geliştirmede telefonda test için buraya bilgisayarının LAN adresini yazabilirsin:
    // url: "http://192.168.1.147:3000",
    url: "https://minokyo.com",
    cleartext: false,
  },
  backgroundColor: "#f7f2ea",
};

export default config;
