import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SECRET = process.env.AUTH_SECRET || "dev-secret-degistir";
const COOKIE = "mnk_session";
const MAXAGE = 60 * 60 * 24 * 7; // 7 gün

type Payload = { uid: string; role: string; exp: number };

function sign(data: string) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createToken(uid: string, role: string) {
  const payload: Payload = { uid, role, exp: Date.now() + MAXAGE * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyToken(token?: string): Payload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig || sign(body) !== sig) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    return p.exp < Date.now() ? null : p;
  } catch {
    return null;
  }
}

export async function setSession(uid: string, role: string) {
  const c = await cookies();
  c.set(COOKIE, createToken(uid, role), {
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
  return prisma.user.findUnique({
    where: { id: payload.uid },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function requireAdmin() {
  const user = await getSession();
  return user && user.role === "ADMIN" ? user : null;
}
