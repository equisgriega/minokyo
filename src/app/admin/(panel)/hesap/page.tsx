import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { changePassword } from "./actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  current: "Mevcut şifre yanlış.",
  short: "Yeni şifre en az 6 karakter olmalı.",
  match: "Yeni şifreler eşleşmiyor.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");
  const { ok, error } = await searchParams;

  const field =
    "w-full px-4 py-3 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2";

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-1">Hesap</h1>
      <p className="text-muted mb-6">{admin!.email}</p>

      <div className="bg-white rounded-2xl border border-line p-6">
        <h2 className="font-bold mb-4">Şifre Değiştir</h2>

        {ok && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            ✅ Şifren başarıyla değiştirildi.
          </div>
        )}
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {ERRORS[error] ?? "Bir hata oluştu."}
          </div>
        )}

        <form action={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Mevcut Şifre</label>
            <input name="current" type="password" required className={field} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Yeni Şifre</label>
            <input name="next" type="password" required minLength={6} placeholder="En az 6 karakter" className={field} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Yeni Şifre (Tekrar)</label>
            <input name="confirm" type="password" required className={field} />
          </div>
          <button className="px-6 py-3 rounded-full bg-ink text-white font-semibold hover:bg-ink-2 transition">
            Şifreyi Değiştir
          </button>
        </form>
      </div>
    </div>
  );
}
