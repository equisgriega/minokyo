import { describe, it, expect } from "vitest";
import { generateResetToken, hashResetToken, isUsableReset } from "@/lib/password-reset";

describe("şifre sıfırlama belirteci", () => {
  it("her seferinde farklı, tahmin edilemez belirteç üretir", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a.token).not.toBe(b.token);
    expect(a.token.length).toBeGreaterThanOrEqual(43); // 256 bit base64url
  });
  it("veritabanına belirtecin kendisi değil özeti yazılır", () => {
    const { token, tokenHash } = generateResetToken();
    expect(tokenHash).not.toContain(token);
    expect(tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashResetToken(token)).toBe(tokenHash);
  });
  it("süresi dolmuş, kullanılmış veya olmayan link geçersiz", () => {
    const now = new Date("2026-10-09T12:00:00Z");
    const later = new Date("2026-10-09T12:30:00Z");
    const earlier = new Date("2026-10-09T11:59:00Z");
    expect(isUsableReset({ expiresAt: later, usedAt: null }, now)).toBe(true);
    expect(isUsableReset({ expiresAt: earlier, usedAt: null }, now)).toBe(false);
    expect(isUsableReset({ expiresAt: later, usedAt: earlier }, now)).toBe(false);
    expect(isUsableReset(null, now)).toBe(false);
  });
});
