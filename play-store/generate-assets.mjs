// Google Play mağaza görsellerini üretir: telefon ekran görüntüleri (1080x1920),
// öne çıkan görsel (1024x500) ve uygulama ikonu (512x512).
// Çalıştırma: node play-store/generate-assets.mjs
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT = path.resolve("play-store");
const SITE = "https://minokyo.com";
const UA = "Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36 MinokyoApp/1.0";

const browser = await chromium.launch();

// ---- Telefon ekran görüntüleri: 412x732 CSS px × 2.625 = 1080x1922 → 1080x1920'ye kırpılır
const ctx = await browser.newContext({
  viewport: { width: 412, height: 731 },
  deviceScaleFactor: 1080 / 412,
  isMobile: true,
  hasTouch: true,
  userAgent: UA,
  locale: "tr-TR",
});
// Çerez bandı görünmesin (reddedilmiş say), WhatsApp butonu ekranı kapatmasın
await ctx.addInitScript(() => {
  try { localStorage.setItem("mnk_consent", "denied"); } catch {}
});
const page = await ctx.newPage();
await page.addStyleTag?.({ content: "" }).catch(() => {});

async function shot(name, url, prepare) {
  await page.goto(SITE + url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: 'a[aria-label="WhatsApp ile yaz"]{display:none!important}' });
  if (prepare) await prepare();
  await page.waitForTimeout(1200);
  const file = path.join(OUT, "screenshots", name);
  const buf = await page.screenshot();
  await sharp(buf).resize(1080, 1920, { fit: "cover", position: "top" }).png().toFile(file);
  console.log("✓", name);
}

await shot("01-ana-sayfa.png", "/", async () => page.waitForTimeout(2500));
await shot("02-kategoriler.png", "/", async () => {
  await page.locator("h2", { hasText: "Kategoriler" }).scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -90));
});
await shot("03-urunler.png", "/urunler");
await shot("04-urun-detay.png", "/urun/milk-club-tayt-takim");
await shot("05-beden-secimi.png", "/urun/milk-club-tayt-takim", async () => {
  await page.getByText("Beden (Yaş)").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -140));
  await page.getByRole("button", { name: /^4\s*yaş$/i }).first().click();
});
await shot("06-sepet.png", "/urun/milk-club-tayt-takim", async () => {
  await page.getByRole("button", { name: /^4\s*yaş$/i }).first().click();
  await page.getByRole("button", { name: /^sepete ekle$/i }).first().click();
  await page.waitForTimeout(800);
});
await shot("07-kampanya.png", "/", async () => {
  await page.locator("h2", { hasText: /oyun hiç bitmesin/i }).scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -380));
});
await ctx.close();

// ---- Öne çıkan görsel 1024x500 (HTML'den)
const logo = fs.readFileSync("public/logo-white.png").toString("base64");
const photo = fs.readFileSync("public/editorial/campaign-1.jpg").toString("base64");
const fctx = await browser.newContext({ viewport: { width: 1024, height: 500 } });
const fpage = await fctx.newPage();
await fpage.setContent(`<!doctype html><html lang="tr"><body style="margin:0">
  <div style="width:1024px;height:500px;display:flex;background:#141414;font-family:'Segoe UI',Inter,Arial,sans-serif;overflow:hidden">
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 56px;color:#fff">
      <img src="data:image/png;base64,${logo}" style="height:96px;width:auto;align-self:flex-start;margin-bottom:28px"/>
      <div style="font-size:38px;font-weight:800;line-height:1.08;text-transform:uppercase;letter-spacing:-.5px">Minik tarzlar,<br/>büyük mutluluklar</div>
      <div style="font-size:17px;opacity:.75;margin-top:16px">Rahat, şık ve %100 pamuk çocuk giyim</div>
    </div>
    <div style="width:430px;background:url(data:image/jpeg;base64,${photo}) center 20%/cover"></div>
  </div></body></html>`);
await fpage.screenshot({ path: path.join(OUT, "feature-graphic-1024x500.png") });
await fctx.close();
console.log("✓ feature-graphic-1024x500.png");

// ---- Uygulama ikonu 512x512 (siyah zemin + beyaz m sembolü, launcher ile aynı)
const sym = await sharp("public/logo-white.png").extract({ left: 0, top: 0, width: 379, height: 123 }).trim().png().toBuffer();
const symR = await sharp(sym).resize(300, 300, { fit: "inside" }).toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#141414" } })
  .composite([{ input: symR, gravity: "center" }])
  .png()
  .toFile(path.join(OUT, "icon-512.png"));
console.log("✓ icon-512.png");

await browser.close();
