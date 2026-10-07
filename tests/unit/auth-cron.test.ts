import { describe, it, expect, vi, afterEach } from "vitest";

// auth.ts next/headers kullanır; birim testinde istek bağlamı yok → sahte modül
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set() {}, delete() {} }),
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
  vi.resetModules();
});

describe("oturum belirteci", () => {
  it("imzalı belirteç doğrulanır; kurcalanan veya bozuk olan reddedilir", async () => {
    const { createToken, verifyToken } = await import("@/lib/auth");
    const t = createToken("u1", "CUSTOMER", 0);
    expect(verifyToken(t)?.uid).toBe("u1");

    const [body, sig] = t.split(".");
    // Rol yükseltme denemesi: gövdeyi ADMIN yapıp eski imzayı kullan
    const forged = Buffer.from(
      JSON.stringify({ uid: "u1", role: "ADMIN", sv: 0, exp: Date.now() + 1e6 })
    ).toString("base64url");
    expect(verifyToken(`${forged}.${sig}`)).toBeNull();
    expect(verifyToken(`${body}.xxx`)).toBeNull();
    expect(verifyToken("bozuk")).toBeNull();
    expect(verifyToken(undefined)).toBeNull();
  });

  it("süresi dolan belirteç reddedilir", async () => {
    const { createToken, verifyToken } = await import("@/lib/auth");
    const t = createToken("u1", "CUSTOMER", 0);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 8 * 24 * 3600 * 1000); // 8 gün sonra (ömür 7 gün)
    expect(verifyToken(t)).toBeNull();
  });

  it("canlıda AUTH_SECRET yoksa belirteç üretmeyi reddeder", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_SECRET", "");
    const { createToken } = await import("@/lib/auth");
    expect(() => createToken("u1", "ADMIN", 0)).toThrow(/AUTH_SECRET/);
  });
});

describe("cron yetkisi", () => {
  const req = (auth?: string) =>
    new Request("http://x/api/cron/daily", { headers: auth ? { authorization: auth } : {} });

  it("canlıda CRON_SECRET yoksa her isteği reddeder", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CRON_SECRET", "");
    const { isAuthorizedCron } = await import("@/lib/cron-auth");
    expect(isAuthorizedCron(req())).toBe(false);
    expect(isAuthorizedCron(req("Bearer herhangi"))).toBe(false);
  });

  it("doğru anahtarı kabul eder, yanlışı reddeder", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    const { isAuthorizedCron } = await import("@/lib/cron-auth");
    expect(isAuthorizedCron(req("Bearer s3cret"))).toBe(true);
    expect(isAuthorizedCron(req("Bearer yanlis"))).toBe(false);
    expect(isAuthorizedCron(req())).toBe(false);
  });
});
