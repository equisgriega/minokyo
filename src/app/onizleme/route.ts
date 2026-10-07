import { NextResponse } from "next/server";

// Mağaza sahibi için gizli önizleme: /onizleme?key=<PREVIEW_KEY>
// "Çok Yakında" modundayken bile gerçek siteyi görmeni sağlar (çerez bırakır).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const expected = process.env.PREVIEW_KEY;

  if (!expected || key !== expected) {
    return NextResponse.json({ error: "Geçersiz önizleme anahtarı" }, { status: 401 });
  }

  const res = NextResponse.redirect(new URL("/", request.url));
  // Çerez değeri gizli anahtarın kendisi: tahmin edilemez, proxy bununla karşılaştırır
  res.cookies.set("mnk_preview", expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}
