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
