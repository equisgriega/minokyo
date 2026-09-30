import { prisma } from "@/lib/prisma";
import { formatTL } from "@/lib/money";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim",
  CANCELLED: "İptal",
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Siparişler</h1>
      <p className="text-[#6b5c51] mb-6">{orders.length} sipariş</p>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e6dccd] p-10 text-center text-[#6b5c51]">
          Henüz sipariş yok. Vitrin yayına girince siparişler burada listelenecek.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e6dccd] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#faf7f1] text-[#6b5c51] text-left">
              <tr>
                <th className="p-4 font-semibold">Sipariş No</th>
                <th className="p-4 font-semibold">Müşteri</th>
                <th className="p-4 font-semibold">Ürün</th>
                <th className="p-4 font-semibold">Tutar</th>
                <th className="p-4 font-semibold">Ödeme</th>
                <th className="p-4 font-semibold">Durum</th>
                <th className="p-4 font-semibold">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0e9dd]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#faf7f1] transition">
                  <td className="p-4 font-mono font-medium">
                    <Link href={`/admin/orders/${o.id}`} className="text-[#5c4230] hover:underline">
                      {o.orderNo}
                    </Link>
                  </td>
                  <td className="p-4">{o.fullName}</td>
                  <td className="p-4 text-[#6b5c51]">
                    {o.items.reduce((s, i) => s + i.qty, 0)} ürün
                  </td>
                  <td className="p-4 font-semibold">{formatTL(o.total)}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        o.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {o.paymentStatus === "paid" ? "Ödendi" : "Ödenmedi"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-[#efe7db] text-[#5c4230] px-2.5 py-1 rounded-full">
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#6b5c51]">
                    {o.createdAt.toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
