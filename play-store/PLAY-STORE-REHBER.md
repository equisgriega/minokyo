# minokyo — Google Play Yayın Rehberi

Hazır olanlar (bu klasör ve proje):
- ✅ İmzalı uygulama paketi: `play-store/release/minokyo-1.0.0-1.aab` (2,8 MB, hedef Android 16 / SDK 36)
- ✅ Mağaza metinleri: `magaza-metinleri.md`
- ✅ Görseller: simge 512×512, öne çıkan görsel 1024×500, 7 ekran görüntüsü 1080×1920
- ✅ Gizlilik politikası: https://minokyo.com/gizlilik
- ✅ Hesap silme (Google zorunluluğu): uygulama içi **Hesabım → Hesabı Sil** + https://minokyo.com/hesap-silme
- ✅ Çok yakında modundayken bile uygulama mağazayı gösterir (test ve inceleme için)

---

## 0) ⚠️ ÖNCE: İmza anahtarını yedekle
`android/keystore/minokyo-upload.jks` + `android/keystore.properties` (şifre içinde).
**İkisini birlikte** güvenli bir yere (USB bellek + şifre yöneticisi) kopyala. Git'e girmezler.
Kaybedersen güncelleme yükleyemezsin (Google destek ile sıfırlatmak gerekir, günler sürer).

## 1) Geliştirici hesabı (bir kez, 25 $)
play.google.com/console → hesap oluştur.

| Hesap türü | Ne zaman | Önemli fark |
|---|---|---|
| **Kişisel** | Şirket yoksa | Yayına çıkmadan önce **en az 12 test kullanıcısıyla 14 gün kesintisiz kapalı test** zorunlu |
| **Kuruluş** | Şirketin varsa | 14 günlük test şartı yok; **D-U-N-S numarası** gerekir (Dun & Bradstreet'ten ücretsiz, birkaç gün sürer) |

Kimlik doğrulaması ve (kişisel hesapta) telefonla Android cihaz doğrulaması istenir.

## 2) Uygulamayı oluştur
**Tüm uygulamalar → Uygulama oluştur**
- Uygulama adı: `minokyo – Çocuk Giyim`
- Varsayılan dil: **Türkçe – tr-TR**
- Uygulama / oyun: **Uygulama** · Ücretsiz / ücretli: **Ücretsiz**
- Beyanları işaretle → Oluştur

## 3) Uygulama içeriği (Politika → Uygulama içeriği)
Her birini doldur — yanıtlar:

**Gizlilik politikası:** `https://minokyo.com/gizlilik`

**Uygulama erişimi:** "Bazı işlevler kısıtlanmış" seç → talimat ekle:
> Ürünlere göz atma ve sepet giriş gerektirmez. Hesap ve sipariş geçmişi için test hesabı:
> E-posta: `<inceleme hesabının e-postası>` · Şifre: `<şifresi>`

→ Önce sitede **Üye ol** ile inceleme için ayrı bir müşteri hesabı aç (kendi şifreni KULLANMA).

**Reklamlar:** Hayır, uygulamada reklam yok.

**İçerik derecelendirmesi:** Anketi başlat → e-posta → kategori: **"Diğer tüm uygulama türleri"**.
Şiddet, cinsel içerik, kumar, uyuşturucu vb. sorularının hepsi **Hayır**. "Kullanıcılar dijital/fiziksel ürün satın alabiliyor mu?" → **Evet**. Beklenen sonuç: **3+ / Herkes**.

**Hedef kitle ve içerik:** Hedef yaş grubu yalnızca **18 ve üzeri**.
> Neden: Uygulamayı ebeveynler kullanır (satın alma yapar). 13 yaş altını seçmek Aile Politikası'nın ek şartlarını tetikler.
"Mağaza girişi çocukların ilgisini çekebilir mi?" → **Hayır** (ürünler çocuk giyimi ama alıcı yetişkin).

**Haber uygulaması:** Hayır · **Devlet uygulaması:** Hayır · **Finansal özellikler:** Yok · **Sağlık:** Yok

**Hesap silme:** Uygulama hesap oluşturmaya izin veriyor → **Evet**
- Silme bağlantısı: `https://minokyo.com/hesap-silme`
- Uygulama içi yol: Hesabım → Hesabı Sil

**Veri güvenliği (Data safety):**
| Soru | Yanıt |
|---|---|
| Kullanıcı verisi topluyor/paylaşıyor mu? | **Evet** |
| Aktarım sırasında şifreleniyor mu? | **Evet** (HTTPS) |
| Kullanıcı silme isteğinde bulunabilir mi? | **Evet** → `https://minokyo.com/hesap-silme` |

Toplanan veri türleri (hepsi: *Toplanıyor · Paylaşılmıyor · Uygulama işlevselliği + Hesap yönetimi · Zorunlu değil*\*):
| Kategori | Veri | Neden |
|---|---|---|
| Kişisel bilgiler | Ad, E-posta adresi, Telefon numarası, Adres | Sipariş, teslimat, hesap |
| Finansal bilgiler | Satın alma geçmişi | Sipariş takibi |
| Mesajlar | — (yok) | |
| Uygulama etkinliği | Diğer kullanıcı tarafından oluşturulan içerik (ürün yorumları) | Yorumlar |

\* Sipariş vermek için ad/telefon/adres zorunludur → bunlar için "Kullanıcılar bu veri toplamayı atlayamaz" seç.

Notlar:
- **Kart bilgisi uygulama tarafından toplanmaz**; ödeme iyzico'nun güvenli sayfasında yapılır → "Ödeme bilgileri" işaretleme.
- Kargo/e-posta/ödeme hizmet sağlayıcılarına (iyzico, kargo firması, e-posta servisi) adına işlem yapmak için aktarım Google tanımında **"paylaşım" sayılmaz**.
- Meta/TikTok pikselleri şu an **kapalı**. İleride açarsan Veri güvenliği formuna "Uygulama etkileşimleri / Cihaz kimlikleri (Analiz, Pazarlama)" eklemen gerekir.

## 4) Mağaza girişi
`magaza-metinleri.md` içindeki metinleri ve görselleri yükle. Kategori: **Alışveriş**.

## 5) İç test (hemen başlar, ~birkaç dakika–saat)
**Test → Dahili test → Test kullanıcıları** sekmesi → e-posta listesi oluştur (kendi Gmail'in + ekibin, en fazla 100).
**Sürümler → Yeni sürüm oluştur**
1. "Play Uygulama İmzalama" önerilince **Kabul et** (Google uygulama imza anahtarını güvenle saklar; sen yükleme anahtarıyla yüklersin).
2. `play-store/release/minokyo-1.0.0-1.aab` dosyasını yükle.
3. Sürüm notunu yapıştır → **Kaydet → İncele → Dahili teste başla**.
4. Test kullanıcıları sekmesindeki **"Katılım bağlantısı"nı** kopyala → telefonda aç → "Test kullanıcısı ol" → Play Store'dan yükle.

### Telefonda test kontrol listesi
- [ ] Simge (siyah zemin, beyaz m) ve açılış ekranı doğru
- [ ] Ana sayfa, kategoriler, ürün listesi ve Sırala açılıyor
- [ ] Beden seç → sepete ekle → alttaki sabit "Sepete Ekle" çubuğu
- [ ] Ödeme sayfası (kart seçeneği iyzico bağlanana kadar kapalı; Havale/EFT ile test siparişi ver → yönetim panelinden iptal et)
- [ ] Üye ol / giriş / şifremi unuttum / hesabı sil
- [ ] Geri tuşu sayfalar arasında geri gidiyor, ana sayfada uygulamadan çıkıyor
- [ ] Uçak modunda aç → "İnternet bağlantısı yok" sayfası, bağlantı gelince "Tekrar Dene" çalışıyor
- [ ] WhatsApp / Instagram linkleri kendi uygulamalarında açılıyor

## 6) Kapalı test (kişisel hesapta yayın öncesi ZORUNLU)
**Test → Kapalı test → Yeni kanal** → aynı AAB → test kullanıcıları: **en az 12 kişi** (Google hesabıyla katılıp uygulamayı yüklemeli).
**14 gün kesintisiz** test tamamlanınca Kontrol paneli → **"Üretime erişim için başvur"** (birkaç soru: testte ne öğrendin vb.).

## 7) Üretim (yayın)
**Üretim → Ülkeler: Türkiye → Yeni sürüm** → AAB → İncelemeye gönder (genelde 1–7 gün).

---

## Yeni sürüm yükleme (her güncellemede)
Site değişiklikleri uygulamaya **otomatik** yansır (uygulama minokyo.com'u açar) — yeni AAB yalnızca
simge, açılış ekranı, uygulama adı veya native ayar değişince gerekir.
```powershell
powershell -ExecutionPolicy Bypass -File scripts\build-android.ps1 -VersionCode 2 -VersionName 1.0.1
```
`VersionCode` her yüklemede artmalı (1 → 2 → 3…).

## Mağazayı açmadan önce (site tarafı)
- [ ] Gerçek fiyatlar
- [ ] iyzico canlı anahtarları (kartla ödeme)
- [ ] Resend'de minokyo.com alan adı doğrulaması (e-postalar müşterilere gitsin)
- [ ] Vercel'de `CRON_SECRET`
- [ ] WhatsApp numarası
- [ ] `COMING_SOON=false`

## Bilinen risk: "web görünümü" politikası
Google, yalnızca bir web sitesini saran uygulamaları "minimum işlevsellik" gerekçesiyle reddedebilir.
Bunu azaltmak için uygulamada native açılış ekranı, çevrimdışı sayfa, uygulama içi ödeme akışı ve
hesap silme var. Reddedilirse en etkili ek: **sipariş/kargo durumunda push bildirimleri** (Firebase
projesi gerekir — istersen kurarım).
