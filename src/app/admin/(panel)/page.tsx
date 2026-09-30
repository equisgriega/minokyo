import { prisma } from "@/lib/prisma";
import { formatTL } from "@/lib/money";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const notCancelled = { status: { not: "CANCELLED" as const } };

  const [
    productCount,
    orderCount,
    pendingOrders,
    stockAgg,
    lowStock,
    revenueAgg,
    todayAgg,
    weekAgg,
    bestSeller,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.variant.aggregate({ _sum: { stock: true } }),
    prisma.variant.findMany({
      where: { stock: { lte: 3 } },
      include: { product: { select: { name: true, slug: true, id: true } } },
      orderBy: { stock: "asc" },
      take: 20,
    }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { ...notCancelled, createdAt: { gte: startToday } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { ...notCancelled, createdAt: { gte: start7 } },
    }),
    prisma.orderItem.groupBy({
      by: ["name"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 1,
    }),
  ]);

  const best = bestSeller[0];

  const stats = [
    { label: "Toplam Ürün", value: productCount, icon: "👕" },
    { label: "Toplam Sipariş", value: orderCount, icon: "📦" },
    { label: "Bekleyen Sipariş", value: pendingOrders, icon: "⏳" },
    { label: "Toplam Stok (adet)", value: stockAgg._sum.stock ?? 0, icon: "🏬" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-1">Panel</h1>
      <p className="text-[#6b6280] mb-6">Mağazanın genel durumu</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e3daf0] p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-[#5a2e86]">{s.value}</div>
            <div className="text-sm text-[#6b6280]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Satış özeti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#e3daf0] p-5">
          <div className="text-sm text-[#6b6280] mb-1">Bugünkü Ciro</div>
          <div className="text-2xl font-bold text-[#3f8f6b]">{formatTL(todayAgg._sum.total ?? 0)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e3daf0] p-5">
          <div className="text-sm text-[#6b6280] mb-1">Son 7 Gün Ciro</div>
          <div className="text-2xl font-bold text-[#3f8f6b]">{formatTL(weekAgg._sum.total ?? 0)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#e3daf0] p-5">
          <div className="text-sm text-[#6b6280] mb-1">En Çok Satan</div>
          <div className="text-base font-bold text-[#5a2e86] leading-tight">
            {best ? best.name : "—"}
          </div>
          {best && (
            <div className="text-xs text-[#6b6280] mt-0.5">{best._sum.qty ?? 0} adet satıldı</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e3daf0] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">⚠️ Kritik Stok Uyarıları</h2>
          <span className="text-sm text-[#6b6280]">Stok ≤ 3</span>
        </div>
        {lowStock.length === 0 ? (
          <p className="text-[#6b6280] text-sm">Tüm ürünlerde stok yeterli. 🎉</p>
        ) : (
          <div className="divide-y divide-[#ece7f5]">
            {lowStock.map((v) => (
              <Link
                key={v.id}
                href={`/admin/products/${v.product.id}`}
                className="flex items-center justify-between py-3 hover:bg-[#f4f0fa] -mx-2 px-2 rounded-lg transition"
              >
                <span className="text-sm font-medium">{v.product.name}</span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-[#6b6280]">Beden {v.size} Yaş</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      v.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {v.stock === 0 ? "TÜKENDİ" : `${v.stock} adet`}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-[#6b6280] mt-6">
        Ödenmiş sipariş cirosu: {formatTL(revenueAgg._sum.total ?? 0)}
      </p>
    </div>
  );
}
