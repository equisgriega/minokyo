"use server";

import { requireAdmin } from "@/lib/auth";
import { runAbandonedReminders } from "@/lib/reminders";
import { revalidatePath } from "next/cache";

export async function sendRemindersForm() {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  await runAbandonedReminders(0); // panelden manuel: yaş sınırı yok
  revalidatePath("/admin/notifications");
}
