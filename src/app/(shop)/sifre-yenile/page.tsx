import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ResetPasswordForm } from "@/components/PasswordResetForms";
import { hashResetToken, isUsableReset } from "@/lib/password-reset";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yeni Şifre — minokyo", robots: { index: false } };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const token = typeof t === "string" ? t.slice(0, 200) : "";
  // Link açılırken kontrol: geçersizse formu hiç gösterme
  const reset = token
    ? await prisma.passwordReset.findUnique({
        where: { tokenHash: hashResetToken(token) },
        select: { expiresAt: true, usedAt: true },
      })
    : null;
  const valid = isUsableReset(reset);

  return (
    <div className="max-w-md mx-auto px-5 py-14">
      <div className="bg-card border border-line p-8">
        <h1 className="text-2xl font-bold text-ink text-center mb-1">Yeni Şifre Belirle</h1>
        {valid ? (
          <>
            <p className="text-sm text-muted text-center mb-6">Hesabın için yeni bir şifre seç.</p>
            <ResetPasswordForm token={token} />
          </>
        ) : (
          <>
            <p className="text-sm text-muted text-center mt-3 mb-6">
              Bu link geçersiz, süresi dolmuş veya daha önce kullanılmış.
            </p>
            <Link
              href="/sifremi-unuttum"
              className="block text-center w-full py-3.5 bg-ink text-white font-semibold hover:bg-ink-2 transition"
            >
              Yeni Link İste
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
