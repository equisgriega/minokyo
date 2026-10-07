import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatTL } from "@/lib/money";
import { updateOrderStatus, updateShipping, createAutoShipment, issueInvoice } from "../actions";
import { CARRIER_LIST, carrierName, trackingUrl } from "@/lib/carriers";
import { isShippingApiConfigured } from "@/lib/shipping";
import { isParasutConfigured } from "@/lib/parasut";

export const dynamic = "force-dynamic";

const STATUSES = [
  { v: "PENDING", label: "Bekliyor" },
  { v: "PAID", label: "Ödendi" },
  { v: "SHIPPED", label: "Kargoda" },
  { v: "DELIVERED", label: "Teslim Edildi" },
  { v: "CANCELLED", label: "İptal" },
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-muted hover:underline">
        ← Siparişlere dön
      </Link>
      <div className="flex items-center gap-3 mt-2 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold font-mono">{order.orderNo}</h1>
        <span className="text-sm text-muted">{order.createdAt.toLocaleString("tr-TR")}</span>
        <a
          href={`/admin/fatura/${order.id}`}
          target="_blank"
          className="ml-auto px-4 py-2 rounded-full border border-line bg-card text-sm font-semibold hover:border-ink-2 transition"
        >
          🖨️ Fatura / Fiş
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Durum */}
        <div className="bg-white rounded-2xl border border-line p-6">
          <h2 className="font-bold mb-4">Sipariş Durumu</h2>
          <form action={updateOrderStatus} className="flex gap-2">
            <input type="hidden" name="orderId" value={order.id} />
            <select
              name="status"
              defaultValue={order.status}
              className="flex-1 px-4 py-2.5 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
            >
              {STATUSES.map((s) => (
                <option key={s.v} value={s.v}>{s.label}</option>
              ))}
            </select>
            <button className="px-5 py-2.5 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink-2 transition">
              Güncelle
            </button>
          </form>
          <p className="text-xs text-muted mt-3">
            💡 &quot;Kargoda&quot; seçilince müşteriye otomatik kargo bilgilendirme e-postası gönderilir.
          </p>
        </div>

        {/* Müşteri */}
        <div className="bg-white rounded-2xl border border-line p-6 text-sm">
          <h2 className="font-bold mb-4">Müşteri & Teslimat</h2>
          <p className="text-muted leading-relaxed">
            <strong className="text-ink">{order.fullName}</strong><br />
            {order.email}<br />
            {order.phone}<br />
            {order.line}<br />
            {order.district} / {order.city} {order.zip}
            {order.note && (<><br /><span className="italic">Not: {order.note}</span></>)}
          </p>
        </div>
      </div>

      {/* e-fatura */}
      {isParasutConfigured() && (
        <div className="bg-white rounded-2xl border border-line p-6 mt-6">
          <h2 className="font-bold mb-3">🧾 e-Fatura (Paraşüt)</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                order.invoiceStatus === "issued"
                  ? "bg-green-100 text-green-700"
                  : order.invoiceStatus === "failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {order.invoiceStatus === "issued" ? "Kesildi" : order.invoiceStatus === "failed" ? "Başarısız" : "Kesilmedi"}
            </span>
            {order.invoiceUrl && (
              <a href={order.invoiceUrl} target="_blank" className="text-sm text-ink font-semibold underline">
                Faturayı Gör (PDF)
              </a>
            )}
            {order.invoiceStatus !== "issued" && (
              <form action={issueInvoice} className="ml-auto">
                <input type="hidden" name="orderId" value={order.id} />
                <button className="px-4 py-2 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink-2 transition">
                  Fatura Kes
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Kargo */}
      <div className="bg-white rounded-2xl border border-line p-6 mt-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-bold">🚚 Kargo Takibi</h2>
          {isShippingApiConfigured() && !order.trackingNo && (
            <form action={createAutoShipment}>
              <input type="hidden" name="orderId" value={order.id} />
              <button className="px-4 py-2 rounded-full bg-success text-white text-sm font-semibold hover:opacity-90 transition">
                ⚡ Otomatik Kargo Oluştur
              </button>
            </form>
          )}
        </div>
        {order.labelUrl && (
          <a href={order.labelUrl} target="_blank" className="inline-block mb-3 text-sm text-ink font-semibold underline">
            🏷️ Kargo Etiketini Yazdır (PDF)
          </a>
        )}
        {order.carrier && order.trackingNo && (
          <p className="text-sm text-muted mb-4">
            Mevcut: <strong>{carrierName(order.carrier)}</strong> · Takip No: {order.trackingNo}{" "}
            <a
              href={trackingUrl(order.carrier, order.trackingNo) ?? "#"}
              target="_blank"
              className="text-ink font-semibold underline ml-2"
            >
              Takip et →
            </a>
          </p>
        )}
        <form action={updateShipping} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="orderId" value={order.id} />
          <div>
            <label className="block text-xs font-semibold mb-1">Kargo Firması</label>
            <select
              name="carrier"
              defaultValue={order.carrier ?? ""}
              className="px-4 py-2.5 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
            >
              <option value="">Seçin</option>
              {CARRIER_LIST.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold mb-1">Takip Numarası</label>
            <input
              name="trackingNo"
              defaultValue={order.trackingNo ?? ""}
              placeholder="Örn. 1234567890"
              className="w-full px-4 py-2.5 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
            />
          </div>
          <button
            name="ship"
            value="0"
            className="px-5 py-2.5 rounded-full border border-line bg-card text-sm font-semibold hover:border-ink-2 transition"
          >
            Kaydet
          </button>
          <button
            name="ship"
            value="1"
            className="px-5 py-2.5 rounded-full bg-ink text-white text-sm font-semibold hover:bg-ink-2 transition"
          >
            Kaydet & Kargoya Ver
          </button>
        </form>
        <p className="text-xs text-muted mt-3">
          💡 &quot;Kargoya Ver&quot; müşteriye takip linkli e-posta gönderir ve durumu &quot;Kargoda&quot; yapar.
        </p>
      </div>

      {/* Ürünler */}
      <div className="bg-white rounded-2xl border border-line p-6 mt-6">
        <h2 className="font-bold mb-4">Ürünler</h2>
        <div className="space-y-2">
          {order.items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm py-2 border-b border-line-soft last:border-0">
              <span>{it.name} <span className="text-muted">· {it.size} Yaş × {it.qty}</span></span>
              <span className="font-semibold">{formatTL(it.price * it.qty)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-line space-y-1 text-sm">
          <div className="flex justify-between"><span>Ara Toplam</span><span>{formatTL(order.subtotal)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success">
              <span>İndirim {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>−{formatTL(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between"><span>Kargo</span><span>{order.shipping === 0 ? "Bedava" : formatTL(order.shipping)}</span></div>
          <div className="flex justify-between font-bold text-lg text-ink pt-1"><span>Toplam</span><span>{formatTL(order.total)}</span></div>
          <div className="text-xs text-muted pt-2">Ödeme: {order.paymentMethod} · {order.paymentStatus}</div>
        </div>
      </div>
    </div>
  );
}
