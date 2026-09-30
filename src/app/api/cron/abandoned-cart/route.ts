import { NextResponse } from "next/server";
import { runAbandonedReminders } from "@/lib/reminders";

// Üretimde zamanlanmış görev (cron) bu adresi çağırır:
//   GET /api/cron/abandoned-cart   (Authorization: Bearer <CRON_SECRET>)
// Örn. Vercel Cron veya harici bir cron servisi ile saatte bir.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  // Son 60 dakikadır tamamlanmamış sepetlere hatırlatma gönder
  const sent = await runAbandonedReminders(60);
  return NextResponse.json({ ok: true, sent });
}
