import Link from "next/link";
import { ForgotPasswordForm } from "@/components/PasswordResetForms";

export const metadata = { title: "Şifremi Unuttum — minokyo", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-5 py-14">
      <div className="bg-card border border-line p-8">
        <h1 className="text-2xl font-bold text-ink text-center mb-1">Şifremi Unuttum</h1>
        <p className="text-sm text-muted text-center mb-6">
          E-posta adresini yaz, sana şifre sıfırlama linki gönderelim.
        </p>
        <ForgotPasswordForm />
        <p className="text-sm text-center text-muted mt-5">
          Şifreni hatırladın mı?{" "}
          <Link href="/giris" className="text-ink font-semibold hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}
