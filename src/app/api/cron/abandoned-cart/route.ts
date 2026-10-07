import { NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { runAbandonedReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";

// Elle tetikleme için (Authorization: Bearer <CRON_SECRET>). Günlük görev: /api/cron/daily
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const sent = await runAbandonedReminders(60);
  return NextResponse.json({ ok: true, sent });
}
