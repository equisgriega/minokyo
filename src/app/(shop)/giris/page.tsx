import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { loginCustomer } from "../auth-actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getSession();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/hesabim");

  const field =
    "w-full px-4 py-3 rounded-xl border border-[#e6dccd] bg-[#f7f2ea] focus:outline-none focus:border-[#7a5a42]";

  return (
    <div className="max-w-md mx-auto px-5 py-14">
      <div className="bg-[#fffdf9] border border-[#e6dccd] rounded-3xl p-8">
        <h1 className="font-display text-2xl font-bold text-[#5c4230] text-center mb-1">
          Giriş Yap
        </h1>
        <p className="text-sm text-[#6b5c51] text-center mb-6">Hesabına hoş geldin</p>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            E-posta veya şifre hatalı.
          </div>
        )}

        <form action={loginCustomer} className="space-y-4">
          <input name="email" type="email" required placeholder="E-posta" className={field} />
          <input name="password" type="password" required placeholder="Şifre" className={field} />
          <button className="w-full py-3.5 rounded-full bg-[#5c4230] text-white font-semibold hover:bg-[#7a5a42] transition">
            Giriş Yap
          </button>
        </form>

        <p className="text-sm text-center text-[#6b5c51] mt-5">
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="text-[#5c4230] font-semibold hover:underline">
            Üye ol
          </Link>
        </p>
      </div>
    </div>
  );
}
