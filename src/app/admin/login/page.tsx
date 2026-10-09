import Link from "next/link";
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
    <div className="min-h-screen flex items-center justify-center bg-subtle px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-line p-8">
        <div className="text-center mb-6">
          <div className="text-2xl font-extrabold text-ink">minokyo</div>
          <p className="text-sm text-muted mt-1">Yönetim Paneli</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error === "rate" ? "Çok fazla deneme yapıldı. Lütfen 15 dakika sonra tekrar deneyin." : "E-posta veya şifre hatalı."}
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-ink">E-posta</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-ink">Şifre</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-ink text-white font-semibold hover:bg-ink-2 transition"
          >
            Giriş Yap
          </button>
        </form>
        <p className="text-center mt-4">
          <Link href="/sifremi-unuttum" className="text-[13px] text-muted hover:text-ink underline underline-offset-2">
            Şifremi unuttum
          </Link>
        </p>

        <p className="text-xs text-muted text-center mt-5">
          Demo giriş: admin@minokyo.com / admin123
        </p>
      </div>
    </div>
  );
}
