import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    // Birim testleri veritabanına bağlanmaz; entegrasyon testleri yalnızca
    // TEST_DATABASE_URL tanımlıysa ve canlı veritabanı DEĞİLSE çalışır.
    testTimeout: 30000,
  },
});
