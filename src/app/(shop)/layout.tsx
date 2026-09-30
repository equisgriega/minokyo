import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getSession } from "@/lib/auth";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  return (
    <CartProvider>
      <Analytics />
      <Header
        user={user ? { name: user.name, email: user.email } : null}
      />
      <div className="flex-1">{children}</div>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <CookieConsent />
    </CartProvider>
  );
}
