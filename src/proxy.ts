import { NextResponse, type NextRequest } from "next/server";

// COMING_SOON=true iken vitrin "Çok Yakında" sayfasına yönlendirilir.
// /admin, /api ve önizleme çerezi olanlar hariç. (Next 16: proxy = eski middleware)
export function proxy(req: NextRequest) {
  if (process.env.COMING_SOON !== "true") return NextResponse.next();

  const { pathname } = req.nextUrl;

  const open =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/cok-yakinda") ||
    pathname.startsWith("/onizleme") ||
    // Şifre sıfırlama: çok yakında modunda da çalışsın (yönetici şifresini unutursa)
    pathname.startsWith("/sifremi-unuttum") ||
    pathname.startsWith("/sifre-yenile") ||
    // Google Play hesap silme bağlantısı herkese açık olmalı
    pathname.startsWith("/hesap-silme") ||
    pathname.includes("."); // statik dosyalar (logo.png, .svg, manifest, hero.mp4, ürün görselleri vb.)

  if (open) return NextResponse.next();

  // Mobil uygulama (Google Play test/inceleme) çok yakında modunda da mağazayı görür.
  // Not: kullanıcı ajanı taklit edilebilir; çok yakında sayfası bir güvenlik önlemi değil, vitrin perdesidir.
  // Mağaza açılınca (COMING_SOON=false) bu satırın etkisi kalmaz.
  if ((req.headers.get("user-agent") || "").includes("MinokyoApp/")) return NextResponse.next();

  // Önizleme çerezi olan (mağaza sahibi) gerçek siteyi görür
  const key = process.env.PREVIEW_KEY;
  if (key && req.cookies.get("mnk_preview")?.value === key) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/cok-yakinda";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
