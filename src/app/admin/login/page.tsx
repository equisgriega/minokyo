import { login } from "./actions";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (await requireAdmin()) redirect("/admin");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f2ea] px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-[#e6dccd] p-8">
        <div className="text-center mb-6">
          <div className="text-2xl font-extrabold text-[#5c4230]">minokyo</div>
          <p className="text-sm text-[#6b5c51] mt-1">Yönetim Paneli</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            E-posta veya şifre hatalı.
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#3b2f28]">E-posta</label>
            <input
              type="email"
              name="email"
              required
              defaultValue="admin@minokyo.com"
              className="w-full px-4 py-3 rounded-xl border border-[#e6dccd] bg-[#f7f2ea] focus:outline-none focus:border-[#7a5a42]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[#3b2f28]">Şifre</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#e6dccd] bg-[#f7f2ea] focus:outline-none focus:border-[#7a5a42]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#5c4230] text-white font-semibold hover:bg-[#7a5a42] transition"
          >
            Giriş Yap
          </button>
        </form>

        <p className="text-xs text-[#6b5c51] text-center mt-5">
          Demo giriş: admin@minokyo.com / admin123
        </p>
      </div>
    </div>
  );
}
