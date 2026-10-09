/**
 * Sipariş entegrasyon testleri — GERÇEK veritabanına yazar.
 *
 * Yalnızca ayrı bir test veritabanında çalışır:
 *   TEST_DATABASE_URL="postgresql://...neon-dev-dalı..." npm test
 *
 * Güvenlik: TEST_DATABASE_URL tanımlı değilse testler atlanır; canlı veritabanıyla
 * (.env içindeki DATABASE_URL/DIRECT_URL) aynı sunucuyu gösteriyorsa test KENDİNİ REDDEDER.
 */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TEST_DB = process.env.TEST_DATABASE_URL;

function hostOf(url?: string) {
  try {
    return url ? new URL(url).hostname.replace("-pooler", "") : "";
  } catch {
    return "";
  }
}
function prodHosts(): string[] {
  try {
    const env = fs.readFileSync(path.resolve(__dirname, "../../.env"), "utf8");
    return ["DATABASE_URL", "DIRECT_URL"]
      .map((k) => env.match(new RegExp(`^${k}="?([^"\\n]+)`, "m"))?.[1])
      .map(hostOf)
      .filter(Boolean);
  } catch {
    return [];
  }
}

if (TEST_DB && prodHosts().includes(hostOf(TEST_DB))) {
  throw new Error("TEST_DATABASE_URL canlı veritabanını gösteriyor! Entegrasyon testleri iptal edildi.");
}

// Sunucu işlemleri istek bağlamı bekler → sahte çerez/başlık
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set() {}, delete() {} }),
  headers: async () => new Headers({ "x-forwarded-for": `test-${Math.random()}` }),
}));

describe.skipIf(!TEST_DB)("sipariş akışı (entegrasyon)", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any, placeOrder: any, cancelOrder: any;
  const tag = `t${Date.now()}`;
  let variantId = "";
  let productId = "";

  const customer = {
    email: `${tag}@test.minokyo`,
    phone: "05551234567",
    fullName: "Test Müşteri",
    line: "Test Sokak No:1",
    city: "İstanbul",
    district: "Kadıköy",
  };
  const order = (items: { variantId: string; qty: number }[], extra: object = {}) =>
    placeOrder({ items, customer, paymentMethod: "transfer", ...extra });

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DB;
    delete process.env.RESEND_API_KEY; // e-postalar demo modunda kalsın
    delete process.env.IYZICO_API_KEY;
    ({ prisma } = await import("@/lib/prisma"));
    ({ placeOrder } = await import("@/app/(shop)/odeme/actions"));
    ({ cancelOrder } = await import("@/lib/orders"));
    const p = await prisma.product.create({
      data: {
        name: `Test Ürün ${tag}`,
        slug: `test-${tag}`,
        description: "test",
        price: 30000,
        variants: { create: { size: "3", sku: `SKU-${tag}`, stock: 1 } },
      },
      include: { variants: true },
    });
    productId = p.id;
    variantId = p.variants[0].id;
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.order.deleteMany({ where: { email: customer.email } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.coupon.deleteMany({ where: { code: { startsWith: "T" + tag.toUpperCase() } } });
    await prisma.$disconnect();
  });

  const setStock = (stock: number) => prisma.variant.update({ where: { id: variantId }, data: { stock } });
  const stock = async () => (await prisma.variant.findUnique({ where: { id: variantId } })).stock;

  it("son 1 adete aynı anda gelen iki siparişten yalnızca biri geçer (fazla satış yok)", async () => {
    await setStock(1);
    const [a, b] = await Promise.all([order([{ variantId, qty: 1 }]), order([{ variantId, qty: 1 }])]);
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1);
    expect([a, b].find((r) => !r.ok).error).toMatch(/stok yetersiz/i);
    expect(await stock()).toBe(0);
  });

  it("aynı beden iki ayrı satırda gönderilse de stok aşılamaz", async () => {
    await setStock(1);
    const r = await order([
      { variantId, qty: 1 },
      { variantId, qty: 1 },
    ]);
    expect(r.ok).toBe(false);
    expect(await stock()).toBe(1);
  });

  it("kupon kullanım limiti eşzamanlı siparişlerde de aşılmaz", async () => {
    await setStock(10);
    const code = `T${tag.toUpperCase()}`;
    await prisma.coupon.create({ data: { code, type: "percent", value: 10, usageLimit: 1 } });
    const [a, b] = await Promise.all([
      order([{ variantId, qty: 1 }], { couponCode: code }),
      order([{ variantId, qty: 1 }], { couponCode: code }),
    ]);
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1);
    expect((await prisma.coupon.findUnique({ where: { code } })).usedCount).toBe(1);
  });

  it("iptal stoğu ve kuponu bir kez iade eder (iki kez çağrılsa da)", async () => {
    await setStock(5);
    const code = `T${tag.toUpperCase()}X`;
    await prisma.coupon.create({ data: { code, type: "fixed", value: 1000 } });
    const r = await order([{ variantId, qty: 2 }], { couponCode: code });
    expect(r.ok).toBe(true);
    expect(await stock()).toBe(3);
    expect(await cancelOrder(r.orderNo)).toBe(true);
    expect(await cancelOrder(r.orderNo)).toBe(false); // ikinci çağrı etkisiz
    expect(await stock()).toBe(5);
    expect((await prisma.coupon.findUnique({ where: { code } })).usedCount).toBe(0);
  });

  it("iyzico bağlı değilken kartla ödeme reddedilir", async () => {
    const r = await placeOrder({ items: [{ variantId, qty: 1 }], customer, paymentMethod: "card" });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/kart/i);
  });

  it("sipariş erişim anahtarı 32 karakter ve tahmin edilemez", async () => {
    await setStock(5);
    const r = await order([{ variantId, qty: 1 }]);
    expect(r.ok).toBe(true);
    expect(r.token).toMatch(/^[0-9a-f]{32}$/);
    expect(r.orderNo).toMatch(/^MNK[A-Z2-9]{6}$/);
  });
});

describe.skipIf(!TEST_DB)("şifre sıfırlama akışı (entegrasyon)", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any, requestPasswordReset: any, resetPassword: any, hashResetToken: any;
  const email = `reset${Date.now()}@test.minokyo`;

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DB;
    delete process.env.RESEND_API_KEY;
    ({ prisma } = await import("@/lib/prisma"));
    ({ requestPasswordReset, resetPassword } = await import("@/app/(shop)/sifre-actions"));
    ({ hashResetToken } = await import("@/lib/password-reset"));
    await prisma.user.create({ data: { email, name: "Test", password: "x", role: "CUSTOMER" } });
  });
  afterAll(async () => {
    if (!prisma) return;
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  const fd = (o: Record<string, string>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) f.set(k, v);
    return f;
  };

  it("kayıtlı olmayan e-postaya da aynı yanıt verilir (hesap varlığı sızmaz)", async () => {
    const a = await requestPasswordReset(fd({ email }));
    const b = await requestPasswordReset(fd({ email: `yok${Date.now()}@test.minokyo` }));
    expect(a).toEqual(b);
  });

  it("link bir kez kullanılır, şifre değişir ve oturum sürümü artar", async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    const token = "test-belirteci-" + Date.now() + "-xxxxxxxxxxxx";
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
    await prisma.passwordReset.create({
      data: { userId: user.id, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + 600000) },
    });
    const r1 = await resetPassword(fd({ token, password: "yeniSifre123", confirm: "yeniSifre123" }));
    expect(r1.ok).toBe(true);
    const r2 = await resetPassword(fd({ token, password: "baskaSifre123", confirm: "baskaSifre123" }));
    expect(r2.ok).toBe(false);
    const after = await prisma.user.findUnique({ where: { email } });
    expect(after.password).not.toBe("x");
    expect(after.sessionVersion).toBe(user.sessionVersion + 1);
  });

  it("süresi dolmuş link reddedilir", async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    const token = "eski-belirtec-" + Date.now() + "-xxxxxxxxxxxx";
    await prisma.passwordReset.create({
      data: { userId: user.id, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() - 1000) },
    });
    const r = await resetPassword(fd({ token, password: "yeniSifre123", confirm: "yeniSifre123" }));
    expect(r.ok).toBe(false);
  });
});

