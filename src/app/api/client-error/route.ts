import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitIp } from "@/lib/security";

export const dynamic = "force-dynamic";

const cut = (v: unknown, n: number) => (typeof v === "string" && v ? v.slice(0, n) : null);

// Tarayıcı/uygulamada oluşan hataları kaydeder (test cihazlarındaki sorunları görmek için)
export async function POST(request: Request) {
  if (!(await rateLimitIp("client-error", 20, 3600))) return new NextResponse(null, { status: 429 });
  try {
    const b = await request.json();
    const message = cut(b?.message, 500);
    if (!message) return new NextResponse(null, { status: 400 });
    await prisma.clientError.create({
      data: {
        message,
        stack: cut(b?.stack, 3000),
        digest: cut(b?.digest, 100),
        url: cut(b?.url, 500),
        userAgent: cut(request.headers.get("user-agent"), 400),
      },
    });
  } catch (e) {
    console.error("client-error kaydı başarısız", e);
  }
  return new NextResponse(null, { status: 204 });
}
