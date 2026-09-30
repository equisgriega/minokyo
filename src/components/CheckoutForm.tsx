"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { formatTL } from "@/lib/money";
import { placeOrder, saveAbandonedCart, validateCoupon } from "@/app/(shop)/odeme/actions";
import { trackInitiateCheckout } from "@/lib/track";

const FREE_SHIP_LIMIT = 50000;
const SHIP_COST = 4990;

export type DefaultCustomer = {
  email?: string;
  phone?: string;
  fullName?: string;
};

export default function CheckoutForm({
  defaults,
  paymentError,
}: {
  defaults: DefaultCustomer;
  paymentError?: boolean;
}) {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    paymentError ? "Ödeme tamamlanamadı veya iptal edildi. Lütfen tekrar deneyin." : ""
  );
  const [pay, setPay] = useState("card");

  // Kupon
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  async function applyCoupon() {
    if (!coupon.trim()) return;
    const res = await validateCoupon(coupon, subtotal);
    if (res.ok) {
      setDiscount(res.discount);
      setAppliedCode(res.code);
      setCouponMsg({ ok: true, text: `${res.label} uygulandı (−${formatTL(res.discount)})` });
    } else {
      setDiscount(0);
      setAppliedCode(null);
      setCouponMsg({ ok: false, text: res.error });
    }
  }

  const shipping = subtotal >= FREE_SHIP_LIMIT ? 0 : items.length ? SHIP_COST : 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  // Sepet hatırlatma: e-posta + ürün varsa yarım kalan sepeti kaydet
  const capturedRef = useRef("");
  function captureCart(email: string, name?: string) {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@") || items.length === 0) return;
    if (capturedRef.current === e) return;
    capturedRef.current = e;
    saveAbandonedCart({
      email: e,
      name,
      items: items.map((i) => ({ name: i.name, size: i.size, qty: i.qty, price: i.price })),
      total: subtotal,
    });
  }
  useEffect(() => {
    if (defaults.email && items.length) captureCart(defaults.email, defaults.fullName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Ödeme başlatma olayı (reklam takibi) — sepet hazır olunca bir kez
  useEffect(() => {
    if (ready && items.length) {
      trackInitiateCheckout(
        subtotal,
        items.map((i) => ({ id: i.slug, quantity: i.qty, item_price: i.price / 100 }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const res = await placeOrder({
      items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      customer: {
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || ""),
        fullName: String(fd.get("fullName") || ""),
        line: String(fd.get("line") || ""),
        city: String(fd.get("city") || ""),
        district: String(fd.get("district") || ""),
        zip: String(fd.get("zip") || ""),
        note: String(fd.get("note") || ""),
      },
      paymentMethod: pay,
      couponCode: appliedCode ?? undefined,
    });
    if (res.ok) {
      clear();
      if (res.paymentUrl) {
        // iyzico ödeme sayfasına yönlendir
        window.location.href = res.paymentUrl;
        return;
      }
      router.push(`/siparis/${res.orderNo}`);
    } else {
      setLoading(false);
      setError(res.error);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (ready && items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-20 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="font-display text-2xl font-bold text-[#5a2e86] mb-2">Sepetin boş</h1>
        <p className="text-[#6b6280] mb-6">Ödemeye geçmek için önce sepetine ürün ekle.</p>
        <Link href="/urunler" className="px-7 py-3.5 rounded-full bg-[#5a2e86] text-white font-semibold">
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  const field =
    "w-full px-4 py-3 rounded-xl border border-[#e3daf0] bg-[#f7f4fb] focus:outline-none focus:border-[#7a4fb0]";

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display text-3xl font-bold text-[#5a2e86] mb-1">Ödeme</h1>
      <p className="text-[#6b6280] mb-6">Teslimat bilgilerini doldur, siparişini tamamla.</p>

      {error && (
        <div className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1.5fr_1fr] gap-7 items-start">
        <div className="space-y-5">
          <section className="bg-[#ffffff] border border-[#e3daf0] rounded-2xl p-6">
            <h3 className="font-bold mb-4">İletişim</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input name="email" type="email" required placeholder="E-posta *" defaultValue={defaults.email} onBlur={(e) => captureCart(e.target.value)} className={field} />
              <input name="phone" type="tel" required placeholder="Telefon *" defaultValue={defaults.phone} className={field} />
            </div>
          </section>

          <section className="bg-[#ffffff] border border-[#e3daf0] rounded-2xl p-6">
            <h3 className="font-bold mb-4">Teslimat Adresi</h3>
            <div className="space-y-4">
              <input name="fullName" required placeholder="Ad Soyad *" defaultValue={defaults.fullName} className={field} />
              <textarea name="line" required rows={2} placeholder="Adres (mahalle, sokak, no) *" className={field} />
              <div className="grid sm:grid-cols-3 gap-4">
                <input name="city" required placeholder="İl *" className={field} />
                <input name="district" required placeholder="İlçe *" className={field} />
                <input name="zip" placeholder="Posta Kodu" className={field} />
              </div>
              <textarea name="note" rows={2} placeholder="Sipariş notu (opsiyonel)" className={field} />
            </div>
          </section>

          <section className="bg-[#ffffff] border border-[#e3daf0] rounded-2xl p-6">
            <h3 className="font-bold mb-4">Ödeme Yöntemi</h3>
            <div className="space-y-3">
              {[
                { v: "card", t: "Kredi / Banka Kartı", d: "Yakında: iyzico ile güvenli ödeme" },
                { v: "transfer", t: "Havale / EFT", d: "Sipariş sonrası hesap bilgileri iletilir" },
                { v: "door", t: "Kapıda Ödeme", d: "Teslimatta nakit veya kart" },
              ].map((o) => (
                <label
                  key={o.v}
                  className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition ${
                    pay === o.v ? "border-[#5a2e86] bg-[#f7f4fb]" : "border-[#e3daf0]"
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={pay === o.v}
                    onChange={() => setPay(o.v)}
                    className="mt-1 accent-[#5a2e86]"
                  />
                  <span>
                    <strong className="block text-sm">{o.t}</strong>
                    <small className="text-[#6b6280]">{o.d}</small>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-[#6b6280] mt-3 bg-[#f7f4fb] p-3 rounded-xl">
              💡 Kart ile online ödeme, ödeme altyapısı bağlandığında aktifleşecek. Şu an sipariş kaydı oluşturulur.
            </p>
          </section>
        </div>

        <aside className="bg-[#ffffff] border border-[#e3daf0] rounded-2xl p-6 lg:sticky lg:top-24">
          <h3 className="font-bold mb-4">Sipariş Özeti</h3>
          <div className="space-y-3 mb-4">
            {items.map((i) => (
              <div key={i.variantId} className="flex gap-3">
                <Image src={i.image} alt={i.name} width={48} height={60} className="rounded-lg object-cover w-12 h-[60px]" />
                <div className="flex-1 text-sm">
                  <div className="font-medium leading-tight">{i.name}</div>
                  <div className="text-xs text-[#6b6280]">Beden: {i.size} · Adet: {i.qty}</div>
                </div>
                <div className="text-sm font-semibold text-[#5a2e86] whitespace-nowrap">
                  {formatTL(i.price * i.qty)}
                </div>
              </div>
            ))}
          </div>
          {/* Kupon */}
          <div className="border-t border-[#e3daf0] pt-3 mb-3">
            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="İndirim kodu"
                className="flex-1 px-3 py-2 rounded-xl border border-[#e3daf0] bg-[#f7f4fb] text-sm focus:outline-none focus:border-[#7a4fb0]"
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="px-4 py-2 rounded-xl bg-[#ece7f5] text-[#5a2e86] text-sm font-semibold hover:bg-[#5a2e86] hover:text-white transition"
              >
                Uygula
              </button>
            </div>
            {couponMsg && (
              <p className={`text-xs mt-1.5 ${couponMsg.ok ? "text-[#3f8f6b]" : "text-red-600"}`}>
                {couponMsg.text}
              </p>
            )}
          </div>
          <div className="border-t border-[#e3daf0] pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Ara Toplam</span><span>{formatTL(subtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-[#3f8f6b]">
                <span>İndirim {appliedCode ? `(${appliedCode})` : ""}</span>
                <span>−{formatTL(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Kargo</span>
              <span>{shipping === 0 ? "Bedava" : formatTL(shipping)}</span>
            </div>
            <div className="flex justify-between font-display text-xl font-bold text-[#5a2e86] pt-2 border-t border-[#e3daf0]">
              <span>Toplam</span><span>{formatTL(total)}</span>
            </div>
          </div>
          {shipping === 0 ? (
            <p className="text-xs text-[#3f8f6b] mt-2 font-medium">🎉 Kargo bedava!</p>
          ) : (
            <p className="text-xs text-[#6b6280] mt-2">
              {formatTL(FREE_SHIP_LIMIT - subtotal)} daha ekleyin, kargo bedava olsun.
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 py-4 rounded-full bg-[#5a2e86] text-white font-semibold text-lg hover:bg-[#7a4fb0] transition disabled:opacity-60"
          >
            {loading ? "İşleniyor..." : "Siparişi Tamamla"}
          </button>
        </aside>
      </form>
    </div>
  );
}
