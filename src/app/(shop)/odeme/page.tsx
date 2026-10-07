import { getSession } from "@/lib/auth";
import CheckoutForm from "@/components/CheckoutForm";
import { isIyzicoConfigured } from "@/lib/iyzico";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSession();
  const { error } = await searchParams;
  return (
    <CheckoutForm
      defaults={{
        email: user?.email ?? "",
        fullName: user?.name ?? "",
      }}
      paymentError={error === "payment"}
      cardEnabled={isIyzicoConfigured() || process.env.DEMO_PAYMENTS === "true"}
    />
  );
}
