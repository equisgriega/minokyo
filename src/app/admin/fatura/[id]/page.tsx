import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatTL } from "@/lib/money";
import { carrierName } from "@/lib/carriers";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await requireAdmin())) redirect("/admin/login");
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="min-h-screen bg-white text-[#222] p-8">
      <style>{`@media print { .no-print { display: none !important; } body { background: #fff; } }`}</style>

      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <a href={`/admin/orders/${order.id}`} className="no-print text-sm text-[#6b5c51] hover:underline">
            ← Siparişe dön
          </a>
          <PrintButton />
        </div>

        <div className="border border-[#ddd] rounded-2xl p-8">
          {/* Başlık */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-[#eee]">
            <div>
              <div className="text-2xl font-extrabold text-[#5c4230]">minokyo</div>
              <div className="text-sm text-[#666]">Minik tarzlar, büyük mutluluklar</div>
              <div className="text-xs text-[#999] mt-2">[İşletme ünvanı · Vergi Dairesi / No · Adres]</div>
            </div>
            <div className="text-right text-sm">
              <div className="font-bold text-lg">FİŞ / FATURA</div>
              <div className="font-mono">{order.orderNo}</div>
              <div className="text-[#666]">{order.createdAt.toLocaleDateString("tr-TR")}</div>
            </div>
          </div>

          {/* Alıcı */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
            <div>
              <div className="font-semibold mb-1">Alıcı</div>
              <div className="text-[#444] leading-relaxed">
                {order.fullName}<br />
                {order.line}<br />
                {order.district} / {order.city} {order.zip}<br />
                {order.phone}<br />
                {order.email}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold mb-1">Ödeme / Kargo</div>
              <div className="text-[#444]">
                Ödeme: {order.paymentMethod} ({order.paymentStatus})<br />
                {order.carrier ? `Kargo: ${carrierName(order.carrier)}` : ""}<br />
                {order.trackingNo ? `Takip: ${order.trackingNo}` : ""}
              </div>
            </div>
          </div>

          {/* Ürünler */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-[#ddd] text-left text-[#666]">
                <th className="py-2">Ürün</th>
                <th className="py-2">Beden</th>
                <th className="py-2 text-center">Adet</th>
                <th className="py-2 text-right">Birim</th>
                <th className="py-2 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="border-b border-[#f0f0f0]">
                  <td className="py-2">{it.name}</td>
                  <td className="py-2">{it.size} Yaş</td>
                  <td className="py-2 text-center">{it.qty}</td>
                  <td className="py-2 text-right">{formatTL(it.price)}</td>
                  <td className="py-2 text-right">{formatTL(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Toplam */}
          <div className="ml-auto w-64 text-sm space-y-1">
            <div className="flex justify-between"><span>Ara Toplam</span><span>{formatTL(order.subtotal)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#3f8f6b]">
                <span>İndirim {order.couponCode ? `(${order.couponCode})` : ""}</span>
                <span>−{formatTL(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between"><span>Kargo</span><span>{order.shipping === 0 ? "Bedava" : formatTL(order.shipping)}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#ddd] text-[#5c4230]">
              <span>Genel Toplam</span><span>{formatTL(order.total)}</span>
            </div>
            <div className="text-xs text-[#999] pt-1">Fiyatlara KDV dahildir.</div>
          </div>

          <p className="text-center text-xs text-[#999] mt-8">
            minokyo · merhaba@minokyo.com · Bizi tercih ettiğin için teşekkürler! 💛
          </p>
        </div>
      </div>
    </div>
  );
}
