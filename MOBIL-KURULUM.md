# minokyo — Mobil Uygulama (App Store + Google Play)

Uygulama, **canlı siteyi (minokyo.com) native bir kabukta** (Capacitor) açar + PWA.
`capacitor.config.ts` içindeki `server.url` yayına çıkınca `https://minokyo.com` olmalı.

> ⚠️ ÖNCE SİTE YAYINDA OLMALI. Uygulama içerik olarak minokyo.com'u yükler.

## Ne hazır
- ✅ **PWA**: `manifest.webmanifest` + ikon + tema → site telefonda "Ana ekrana ekle" ile kurulabilir.
- ✅ **Android projesi**: `android/` klasörü (Windows'ta Android Studio ile derlenir).
- ⏳ **iOS**: Mac'te tek komutla eklenir (aşağıda). Windows'ta derlenemez.

## Gereken hesaplar
- **Google Play Developer**: 25 $ (tek sefer) → play.google.com/console
- **Apple Developer**: 99 $/yıl → developer.apple.com (iOS için Mac de gerekir)

---

## 1) Uygulama ikonu (gerçek logo)
Şu an geçici SVG ikon var. Gerçek logoyu (kare, 1024×1024 PNG) hazırlayıp otomatik üret:
```bash
npm install -D @capacitor/assets
# logoyu assets/icon.png (1024x1024) ve assets/splash.png (2732x2732) olarak koy
npx capacitor-assets generate
```

## 2) ANDROID (Google Play) — Windows'ta yapılır
1. **Android Studio** kur (+ JDK) → developer.android.com/studio
2. Projeyi aç:
   ```bash
   npx cap sync android
   npx cap open android
   ```
3. Android Studio → **Build > Generate Signed Bundle / APK** → **Android App Bundle (.aab)**
   - İlk seferde bir **keystore** (imza anahtarı) oluştur ve **sakla** (kaybedersen güncelleme yükleyemezsin).
4. Oluşan `.aab` dosyasını **Play Console**'da yeni uygulamaya yükle → mağaza bilgileri (açıklama, ekran görüntüleri, gizlilik politikası: minokyo.com/gizlilik) → incelemeye gönder.

## 3) iOS (App Store) — Mac gerekir (veya bulut-Mac: Codemagic/EAS)
Mac'te:
```bash
npx cap add ios
npx cap sync ios
npx cap open ios   # Xcode açılır
```
Xcode → imzalama (Apple Developer hesabı) → **Product > Archive** → App Store Connect'e yükle → incele.

> Windows'tan iOS: **Codemagic** veya **EAS Build** gibi bulut servisleriyle Mac'siz derleyebilirsin (ücretli/ücretsiz kotalı).

## 4) Her site güncellemesinden sonra
İçerik minokyo.com'dan geldiği için çoğu değişiklik **otomatik** yansır (yeni build gerekmez).
Sadece uygulama kabuğu/ikon/ayar değişirse:
```bash
npx cap sync
```

## 5) Apple onay ipucu
Apple "sadece web sarmalı" uygulamaları reddedebilir. Onay şansını artırmak için:
- Push bildirim ekle (`@capacitor/push-notifications`) — kampanya/sipariş bildirimi
- Splash screen + native ikon (yukarıda)
- Uygulamaya özel bir değer (ör. hızlı sipariş takibi)

İhtiyaç olduğunda push bildirim + native eklentileri birlikte kurabiliriz.
