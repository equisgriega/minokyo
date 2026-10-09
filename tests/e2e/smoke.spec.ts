import { test, expect } from "@playwright/test";

// Hero videoları testleri yavaşlatmasın
test.beforeEach(async ({ page }) => {
  await page.route(/\.mp4$/, (r) => r.abort());
});

test("ana sayfa: kategoriler, öne çıkanlar ve kampanya görünür", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /kategoriler/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /öne çıkanlar/i })).toBeVisible();
  await expect(page.getByText(/bu kış, oyun hiç bitmesin/i)).toBeVisible();
  // Yatay taşma yok
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("ürün: beden seçmeden eklenmez, seçince sepete eklenir", async ({ page }) => {
  await page.goto("/urun/milk-club-tayt-takim");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Milk Club");
  await expect(page.getByText(/\d+,\d{2} TL/).first()).toBeVisible();

  const add = page.getByRole("button", { name: /^sepete ekle$/i }).first();
  await add.click();
  await expect(page.getByText("Lütfen bir beden seçin.")).toBeVisible();

  await page.getByRole("button", { name: /^4\s*yaş$/i }).first().click();
  await add.click();
  await expect(page.getByRole("heading", { name: /sepetim \(1\)/i })).toBeVisible();
});

test("ödeme sayfası: iyzico yokken kart seçeneği kapalı", async ({ page }) => {
  await page.goto("/urun/milk-club-tayt-takim");
  await page.getByRole("button", { name: /^4\s*yaş$/i }).first().click();
  await page.getByRole("button", { name: /^sepete ekle$/i }).first().click();
  await page.goto("/odeme");
  const card = page.getByRole("radio").first();
  await expect(card).toBeDisabled();
  await expect(page.getByRole("radio").nth(1)).toBeChecked(); // Havale/EFT varsayılan
});

test("güvenlik: sipariş sayfası anahtarsız açılmaz", async ({ page }) => {
  const res = await page.goto("/siparis/MNKABCDEF");
  expect(res?.status()).toBe(404);
});

test("güvenlik: admin paneli girişe yönlendirir, başlıklar mevcut", async ({ page, request }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);

  const r = await request.get("/");
  expect(r.headers()["x-frame-options"]).toBe("SAMEORIGIN");
  expect(r.headers()["x-content-type-options"]).toBe("nosniff");
  expect(r.headers()["content-security-policy"]).toContain("frame-ancestors 'self'");
});

test("güvenlik: cron uç noktası anahtarsız çalışmaz", async ({ request }) => {
  const r = await request.get("/api/cron/daily");
  expect(r.status()).toBe(401);
});

test("SEO: robots.txt ve sitemap.xml", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Disallow: /admin");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/urun/");
});

test("sırala: fiyata göre artan/azalan çalışır, ad sıralaması yok", async ({ page, isMobile }) => {
  const prices = async () =>
    (await page.locator("a[href^='/urun/'] p").allInnerTexts())
      .map((t) => t.match(/([\d.]+),(\d{2}) TL/))
      .filter(Boolean)
      .map((m) => Number(m![1].replace(/\./g, "")) * 100 + Number(m![2]));

  await page.goto("/urunler");
  if (isMobile) {
    await page.getByRole("button", { name: /^sırala/i }).click();
    const dialog = page.getByRole("dialog", { name: "Sırala" });
    await expect(dialog.getByText("Ürün Adına Göre")).toHaveCount(0);
    await dialog.getByLabel("Fiyata Göre (Artan)").check();
    await dialog.getByRole("button", { name: /uygula/i }).click();
  } else {
    await page.getByRole("button", { name: /sırala:/i }).click();
    await expect(page.getByRole("option", { name: /ürün adı/i })).toHaveCount(0);
    await page.getByRole("option", { name: "Fiyata Göre (Artan)" }).click();
  }
  await expect(page).toHaveURL(/sirala=fiyat-artan/);
  const asc = await prices();
  expect(asc.length).toBeGreaterThan(1);
  expect(asc).toEqual([...asc].sort((a, b) => a - b));

  await page.goto("/urunler?sirala=fiyat-azalan&cinsiyet=kiz");
  const desc = await prices();
  expect(desc).toEqual([...desc].sort((a, b) => b - a));
  // Filtre değişince sıralama korunur
  await expect(page.getByRole("link", { name: "Erkek", exact: true })).toHaveAttribute("href", /sirala=fiyat-azalan/);
});

test("şifremi unuttum: giriş sayfasında link var, geçersiz sıfırlama linki reddedilir", async ({ page }) => {
  await page.goto("/giris");
  await page.getByRole("link", { name: "Şifremi unuttum" }).click();
  await expect(page.getByRole("heading", { name: "Şifremi Unuttum" })).toBeVisible();
  await expect(page.getByRole("button", { name: /sıfırlama linki gönder/i })).toBeVisible();

  await page.goto("/sifre-yenile?t=gecersiz-belirtec-123456789012345");
  await expect(page.getByText(/geçersiz, süresi dolmuş/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Yeni Link İste" })).toBeVisible();
});
