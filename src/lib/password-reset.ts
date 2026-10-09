import crypto from "crypto";

/** Sıfırlama linkinin geçerlilik süresi (dakika) */
export const RESET_TTL_MIN = 30;

/** Veritabanında linkin kendisi değil SHA-256 özeti tutulur (sızıntıda link kullanılamaz). */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** 256 bit rastgele, URL'de güvenli belirteç + özeti */
export function generateResetToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}

export function isUsableReset(r: { expiresAt: Date; usedAt: Date | null } | null, now = new Date()): boolean {
  return !!r && !r.usedAt && r.expiresAt > now;
}
