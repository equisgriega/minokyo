import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatTL } from "@/lib/money";
import PurchaseTracker from "@/components/PurchaseTracker";
import { carrierName, trackingUrl } from "@/lib/carriers";

export const dynamic = "force-dynamic";

export const metadata = { robots: { index: false, follow: false } };

export default async function OrderConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNo: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { orderNo } = await params;
  const { t } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { items: true },
  });

  if (!order) notFound();

  // KVKK: ad/adres/telefon yalnızca e-postadaki anahtarlı linkle, siparişin sahibi
  // veya yönetici tarafından görülebilir. Aksi halde "bulunamadı" (var olduğu da sızmaz).
  const tokenOk =
    typeof t === "string" &&
    t.length === order.accessToken.length &&
    crypto.timingSafeEqual(Buffer.from(t), Buffer.from(order.accessToken));
  if (!tokenOk) {
    const user = await getSession();
    const allowed = user && (user.role === "ADMIN" || (order.userId && order.userId === user.id));
    if (!allowed) notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-14">
      <PurchaseTracker
        orderNo={order.orderNo}
        value={order.total}
        contents={order.items.map((it) => ({
          id: it.productId ?? it.id,
          quantity: it.qty,
          item_price: it.price / 100,
        }))}
      />
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="font-display text-3xl font-bold text-ink">Siparişin alındı!</h1>
        <p className="text-muted mt-2">
          Sipariş numaran <strong className="text-ink">{order.orderNo}</strong>. Teşekkürler{" "}
          {order.fullName.split(" ")[0]}! Detaylar {order.email} adresine gönderilecek.
        </p>
      </div>

      <div className="bg-card border border-line rounded-2xl p-6">
        <h3 className="font-bold mb-4">Sipariş Detayı</h3>
        <div className="space-y-2 mb-4">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm py-1">
              <span>
                {it.name} <span className="text-muted">· {it.size} Yaş × {it.qty}</span>
              </span>
              <span className="font-semibold">{formatTL(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-line pt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span>Ara Toplam</span><span>{formatTL(order.subtotal)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success">
              <span>İndirim {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>−{formatTL(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between"><span>Kargo</span><span>{order.shipping === 0 ? "Bedava" : formatTL(order.shipping)}</span></div>
          <div className="flex justify-between font-display text-xl font-bold text-ink pt-2 border-t border-line">
            <span>Toplam</span><span>{formatTL(order.total)}</span>
          </div>
        </div>
      </div>

      {order.carrier && order.trackingNo && (
        <div className="bg-card border border-line rounded-2xl p-6 mt-5">
          <h3 className="font-bold mb-2">🚚 Kargo Takibi</h3>
          <p className="text-sm text-muted mb-3">
            {carrierName(order.carrier)} · Takip No: <strong>{order.trackingNo}</strong>
          </p>
          <a
            href={trackingUrl(order.carrier, order.trackingNo) ?? "#"}
            target="_blank"
            className="inline-block px-6 py-3 rounded-none bg-ink text-white font-semibold text-sm"
          >
            Kargonu Takip Et →
          </a>
        </div>
      )}

      <div className="bg-card border border-line rounded-2xl p-6 mt-5 text-sm">
        <h3 className="font-bold mb-3">Teslimat Adresi</h3>
        <p className="text-muted">
          {order.fullName}<br />
          {order.line}<br />
          {order.district} / {order.city} {order.zip}<br />
          {order.phone}
        </p>
      </div>

      <div className="text-center mt-8">
        <Link href="/urunler" className="px-7 py-3.5 rounded-none bg-ink text-white font-semibold">
          Alışverişe Devam Et
        </Link>
      </div>
    </div>
  );
}
