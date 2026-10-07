import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTL } from "@/lib/money";
import { logoutCustomer } from "../auth-actions";
import { trackingUrl } from "@/lib/carriers";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Bekliyor", cls: "bg-amber-100 text-amber-700" },
  PAID: { label: "Ödendi", cls: "bg-green-100 text-green-700" },
  SHIPPED: { label: "Kargoda", cls: "bg-blue-100 text-blue-700" },
  DELIVERED: { label: "Teslim Edildi", cls: "bg-green-100 text-green-700" },
  CANCELLED: { label: "İptal", cls: "bg-red-100 text-red-700" },
};

export default async function AccountPage() {
  const user = await getSession();
  if (!user) redirect("/giris");

  const orders = await prisma.order.findMany({
    where: { OR: [{ userId: user.id }, { email: user.email }] },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#111111]">
            Merhaba, {user.name?.split(" ")[0] ?? "hoş geldin"} 👋
          </h1>
          <p className="text-[#6b6b6b]">{user.email}</p>
        </div>
        <form action={logoutCustomer}>
          <button className="px-5 py-2.5 rounded-none border border-[#e5e5e5] bg-[#ffffff] text-sm font-semibold hover:border-[#444444] transition">
            Çıkış Yap
          </button>
        </form>
      </div>

      {user.role === "ADMIN" && (
        <Link
          href="/admin"
          className="block mb-6 bg-[#111111] text-white rounded-2xl px-6 py-4 font-semibold hover:bg-[#444444] transition"
        >
          ⚙️ Yönetim Paneline Git →
        </Link>
      )}

      <h2 className="font-bold text-lg mb-4">Siparişlerim</h2>

      {orders.length === 0 ? (
        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-2xl p-10 text-center">
          <p className="text-[#6b6b6b] mb-4">Henüz siparişin yok.</p>
          <Link href="/urunler" className="px-6 py-3 rounded-none bg-[#111111] text-white font-semibold">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const st = STATUS[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-600" };
            return (
              <div key={o.id} className="bg-[#ffffff] border border-[#e5e5e5] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <span className="font-mono font-semibold">{o.orderNo}</span>
                    <span className="text-sm text-[#6b6b6b] ml-3">
                      {o.createdAt.toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
                <div className="text-sm text-[#6b6b6b] space-y-1 mb-3">
                  {o.items.map((it) => (
                    <div key={it.id}>
                      {it.name} · {it.size} Yaş × {it.qty}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-[#e5e5e5] pt-3">
                  <div className="flex gap-4">
                    <Link href={`/siparis/${o.orderNo}`} className="text-sm text-[#111111] font-semibold hover:underline">
                      Detayı Gör →
                    </Link>
                    {o.carrier && o.trackingNo && (
                      <a
                        href={trackingUrl(o.carrier, o.trackingNo) ?? "#"}
                        target="_blank"
                        className="text-sm text-[#111111] font-semibold hover:underline"
                      >
                        🚚 Kargo Takip →
                      </a>
                    )}
                  </div>
                  <span className="font-display text-lg font-bold text-[#111111]">
                    {formatTL(o.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
