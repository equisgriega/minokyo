import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.minokyo.app",
  appName: "minokyo",
  // Küçük native kabuk (logo + bağlantı yok sayfası). Mağaza içeriği server.url'den yüklenir.
  webDir: "mobile-shell",
  // Site, uygulamadan gelen istekleri bu etiketle tanır (ör. çok yakında modunda test için)
  appendUserAgent: "MinokyoApp/1.0",
  backgroundColor: "#faf8f5",
  server: {
    // Geliştirmede telefonda test için bilgisayarının LAN adresini yazabilirsin:
    // url: "http://192.168.1.147:3000",
    url: "https://minokyo.com",
    cleartext: false,
    // İnternet yoksa / site açılamazsa gösterilecek yerel sayfa
    errorPath: "offline.html",
    // Ödeme sayfası uygulama içinde açılsın (dışarı fırlarsa ödeme dönüşü kaybolur).
    // Bunlar dışındaki alan adları (WhatsApp, Instagram...) sistem tarayıcısında/uygulamasında açılır.
    allowNavigation: ["*.iyzipay.com", "*.iyzico.com"],
  },
  plugins: {
    SystemBars: {
      // İçerik durum çubuğunun ALTINDAN başlar (header saat/pil simgeleriyle çakışmaz)
      insetsHandling: "native",
      // Açık zemin → koyu simgeler
      style: "LIGHT",
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    // Yayın sürümünde WebView hata ayıklama kapalı
    webContentsDebuggingEnabled: false,
  },
};

export default config;
