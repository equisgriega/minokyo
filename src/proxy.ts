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
    pathname.startsWith("/products") || // ürün görselleri
    pathname.startsWith("/hero"); // hero videoları

  if (open) return NextResponse.next();

  // Önizleme çerezi olan (mağaza sahibi) gerçek siteyi görür
  if (req.cookies.get("mnk_preview")?.value === "1") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/cok-yakinda";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
