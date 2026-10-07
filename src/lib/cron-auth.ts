import crypto from "crypto";

/**
 * Zamanlanmış görev uç noktası yetkisi. Vercel Cron, CRON_SECRET tanımlıysa
 * isteğe otomatik olarak "Authorization: Bearer <CRON_SECRET>" ekler.
 * Canlıda CRON_SECRET tanımlı değilse uç nokta tamamen kapalıdır.
 */
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production"; // yalnızca yerelde serbest
  const given = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}
