import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatTL } from "@/lib/money";
import PurchaseTracker from "@/components/PurchaseTracker";
import { carrierName, trackingUrl } from "@/lib/carriers";

export const dynamic = "force-dynamic";

export default async function OrderConfirmPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { items: true },
  });

  if (!order) notFound();

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
        <h1 className="font-display text-3xl font-bold text-[#5a2e86]">Siparişin alındı!</h1>
        <p className="text-[#6b6280] mt-2">
          Sipariş numaran <strong className="text-[#2f2545]">{order.orderNo}</strong>. Teşekkürler{" "}
          {order.fullName.split(" ")[0]}! Detaylar {order.email} adresine gönderilecek.
        </p>
      </div>

      <div className="bg-[#ffffff] border border-[#e3daf0] rounded-2xl p-6">
        <h3 className="font-bold mb-4">Sipariş Detayı</h3>
        <div className="space-y-2 mb-4">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm py-1">
              <span>
                {it.name} <span className="text-[#6b6280]">· {it.size} Yaş × {it.qty}</span>
              </span>
              <span className="font-semibold">{formatTL(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#e3daf0] pt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span>Ara Toplam</span><span>{formatTL(order.subtotal)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[#3f8f6b]">
              <span>İndirim {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>−{formatTL(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between"><span>Kargo</span><span>{order.shipping === 0 ? "Bedava" : formatTL(order.shipping)}</span></div>
          <div className="flex justify-between font-display text-xl font-bold text-[#5a2e86] pt-2 border-t border-[#e3daf0]">
            <span>Toplam</span><span>{formatTL(order.total)}</span>
          </div>
        </div>
      </div>

      {order.carrier && order.trackingNo && (
        <div className="bg-[#ffffff] border border-[#e3daf0] rounded-2xl p-6 mt-5">
          <h3 className="font-bold mb-2">🚚 Kargo Takibi</h3>
          <p className="text-sm text-[#6b6280] mb-3">
            {carrierName(order.carrier)} · Takip No: <strong>{order.trackingNo}</strong>
          </p>
          <a
            href={trackingUrl(order.carrier, order.trackingNo) ?? "#"}
            target="_blank"
            className="inline-block px-6 py-3 rounded-full bg-[#5a2e86] text-white font-semibold text-sm"
          >
            Kargonu Takip Et →
          </a>
        </div>
      )}

      <div className="bg-[#ffffff] border border-[#e3daf0] rounded-2xl p-6 mt-5 text-sm">
        <h3 className="font-bold mb-3">Teslimat Adresi</h3>
        <p className="text-[#6b6280]">
          {order.fullName}<br />
          {order.line}<br />
          {order.district} / {order.city} {order.zip}<br />
          {order.phone}
        </p>
      </div>

      <div className="text-center mt-8">
        <Link href="/urunler" className="px-7 py-3.5 rounded-full bg-[#5a2e86] text-white font-semibold">
          Alışverişe Devam Et
        </Link>
      </div>
    </div>
  );
}
