import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Header'ın "Hesabım/Giriş" durumunu istemci tarafında çözmesi için hafif uç nokta.
// Böylece mağaza sayfaları (ana sayfa, ürünler) statik/ISR olarak CDN'den servis edilir.
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  return NextResponse.json(
    { user: user ? { name: user.name } : null },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
