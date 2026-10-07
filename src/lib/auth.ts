import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE = "mnk_session";
const MAXAGE = 60 * 60 * 24 * 7; // 7 gün
const DEV_SECRET = "dev-secret-degistir";

// Canlıda AUTH_SECRET zorunlu: varsayılan anahtarla imzalanan oturumlar sahte üretilebilir.
// Kontrol çalışma anında yapılır (derleme sırasında env eksik olsa bile build kırılmaz).
function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s !== DEV_SECRET) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET tanımlı değil — canlıda oturum açılamaz.");
  }
  return DEV_SECRET;
}

// sv = sessionVersion: şifre değişince artar, eski oturumlar geçersizleşir
type Payload = { uid: string; role: string; sv: number; exp: number };

function sign(data: string) {
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createToken(uid: string, role: string, sv: number) {
  const payload: Payload = { uid, role, sv, exp: Date.now() + MAXAGE * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyToken(token?: string): Payload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  // Sabit zamanlı karşılaştırma (zamanlama saldırısına karşı)
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    return p.exp < Date.now() ? null : p;
  } catch {
    return null;
  }
}

export async function setSession(uid: string, role: string, sv: number) {
  const c = await cookies();
  c.set(COOKIE, createToken(uid, role, sv), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAXAGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function getSession() {
  const c = await cookies();
  const payload = verifyToken(c.get(COOKIE)?.value);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, email: true, name: true, role: true, sessionVersion: true },
  });
  // Şifre değiştiyse (sürüm arttıysa) eski oturum geçersiz
  if (!user || user.sessionVersion !== (payload.sv ?? 0)) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function requireAdmin() {
  const user = await getSession();
  return user && user.role === "ADMIN" ? user : null;
}
