import { prisma } from "@/lib/prisma";
import { formatTL } from "@/lib/money";
import { createCoupon, toggleCoupon, deleteCoupon } from "./actions";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const field =
    "w-full px-3 py-2 rounded-xl border border-line bg-subtle text-sm focus:outline-none focus:border-ink-2";

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Kuponlar</h1>
      <p className="text-muted mb-6">İndirim kodları oluştur ve yönet</p>

      {/* Yeni kupon */}
      <form action={createCoupon} className="bg-white rounded-2xl border border-line p-6 mb-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1">Kod</label>
          <input name="code" required placeholder="İLK10" className={field} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Tür</label>
          <select name="type" className={field}>
            <option value="percent">Yüzde (%)</option>
            <option value="fixed">Sabit (TL)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Değer (% veya TL)</label>
          <input name="value" type="number" step="0.01" required placeholder="10" className={field} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Min. Sepet (TL)</label>
          <input name="minSubtotal" type="number" step="0.01" placeholder="0" className={field} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Kullanım Limiti</label>
          <input name="usageLimit" type="number" placeholder="sınırsız" className={field} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Son Kullanım</label>
          <input name="expiresAt" type="date" className={field} />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <button className="px-6 py-2.5 rounded-full bg-ink text-white font-semibold hover:bg-ink-2 transition">
            Kupon Oluştur
          </button>
        </div>
      </form>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="p-4 font-semibold">Kod</th>
              <th className="p-4 font-semibold">İndirim</th>
              <th className="p-4 font-semibold">Min. Sepet</th>
              <th className="p-4 font-semibold">Kullanım</th>
              <th className="p-4 font-semibold">Durum</th>
              <th className="p-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {coupons.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted">Henüz kupon yok.</td></tr>
            )}
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-surface">
                <td className="p-4 font-mono font-semibold">{c.code}</td>
                <td className="p-4">{c.type === "percent" ? `%${c.value}` : formatTL(c.value)}</td>
                <td className="p-4">{c.minSubtotal > 0 ? formatTL(c.minSubtotal) : "—"}</td>
                <td className="p-4">{c.usedCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ""}</td>
                <td className="p-4">
                  <form action={toggleCoupon}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                      {c.active ? "Aktif" : "Pasif"}
                    </button>
                  </form>
                </td>
                <td className="p-4 text-right">
                  <form action={deleteCoupon}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-red-600 text-sm hover:underline">Sil</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
