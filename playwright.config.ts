import { defineConfig, devices } from "@playwright/test";

/**
 * Uçtan uca duman testleri. Bu testler VERİTABANINA YAZMAZ (sipariş/yorum göndermez);
 * sadece sayfaları gezer, sepete ekler (tarayıcı hafızası) ve güvenlik kontrollerini doğrular.
 *
 * Çalıştırma: npm run build && npm run test:e2e
 */
const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "masaustu", use: { ...devices["Desktop Chrome"] } },
    { name: "mobil", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Çok Yakında modu kapalı olsun ki mağaza sayfaları test edilebilsin
    env: { COMING_SOON: "false" },
  },
});
