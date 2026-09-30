import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { registerCustomer } from "../auth-actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  invalid: "Lütfen bilgileri kontrol edin (şifre en az 6 karakter).",
  exists: "Bu e-posta ile zaten bir hesap var. Giriş yapın.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getSession();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/hesabim");

  const field =
    "w-full px-4 py-3 rounded-xl border border-[#e3daf0] bg-[#f7f4fb] focus:outline-none focus:border-[#7a4fb0]";

  return (
    <div className="max-w-md mx-auto px-5 py-14">
      <div className="bg-[#ffffff] border border-[#e3daf0] rounded-3xl p-8">
        <h1 className="font-display text-2xl font-bold text-[#5a2e86] text-center mb-1">Üye Ol</h1>
        <p className="text-sm text-[#6b6280] text-center mb-6">
          İlk siparişinde %10 indirim seni bekliyor 🎉
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {ERRORS[error] ?? "Bir hata oluştu."}
          </div>
        )}

        <form action={registerCustomer} className="space-y-4">
          <input name="name" required placeholder="Ad Soyad" className={field} />
          <input name="email" type="email" required placeholder="E-posta" className={field} />
          <input name="phone" type="tel" placeholder="Telefon (opsiyonel)" className={field} />
          <input name="password" type="password" required placeholder="Şifre (en az 6 karakter)" className={field} />
          <button className="w-full py-3.5 rounded-full bg-[#5a2e86] text-white font-semibold hover:bg-[#7a4fb0] transition">
            Hesap Oluştur
          </button>
        </form>

        <p className="text-sm text-center text-[#6b6280] mt-5">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="text-[#5a2e86] font-semibold hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
