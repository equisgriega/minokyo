"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });
  const ok =
    user &&
    user.role === "ADMIN" &&
    (await bcrypt.compare(password, user.password));

  if (!ok) {
    redirect("/admin/login?error=1");
  }

  await setSession(user!.id, user!.role);
  redirect("/admin");
}
