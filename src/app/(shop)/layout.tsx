import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Analytics />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <CookieConsent />
    </CartProvider>
  );
}
