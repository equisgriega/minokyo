import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { expireStaleOrders } from "@/lib/orders";
import { runAbandonedReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

// Günlük bakım görevi (vercel.json → crons). Vercel Hobby planı günde 1 çalıştırmaya izin verir.
//  1) Ödeme sayfasında terk edilmiş siparişleri iptal et, stok/kuponu iade et
//  2) Terk edilen sepetlere hatırlatma e-postası gönder
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const expired = await expireStaleOrders();
  const reminders = await runAbandonedReminders(60);
  return NextResponse.json({ ok: true, expired, reminders });
}
