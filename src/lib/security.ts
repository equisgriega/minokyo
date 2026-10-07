import { headers } from "next/headers";
import { prisma } from "./prisma";

export { escapeHtml } from "./html";

/** İsteği yapan istemcinin IP'si (Vercel x-forwarded-for / x-real-ip başlıkları). */
export async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Sabit pencereli istek sınırı. Tek bir atomik SQL ifadesiyle sayar, bu yüzden
 * birden çok sunucusuz örnek arasında da doğru çalışır.
 * @returns true → izin ver, false → sınır aşıldı
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, NOW() + make_interval(secs => ${windowSec}))
      ON CONFLICT ("key") DO UPDATE SET
        "count"   = CASE WHEN "RateLimit"."resetAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" < NOW() THEN NOW() + make_interval(secs => ${windowSec}) ELSE "RateLimit"."resetAt" END
      RETURNING "count"`;
    return (rows[0]?.count ?? 0) <= limit;
  } catch (e) {
    // Sınırlayıcı arızalanırsa siteyi kilitleme; kaydı düş ve izin ver
    console.error("rateLimit hatası", e);
    return true;
  }
}

/** IP'ye göre kısayol: rateLimitIp("login", 5, 900) → 15 dakikada 5 deneme */
export async function rateLimitIp(action: string, limit: number, windowSec: number): Promise<boolean> {
  return rateLimit(`${action}:${await getClientIp()}`, limit, windowSec);
}
