import { prisma } from "@/lib/prisma";
import { formatTL } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { select: { total: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = users.map((u) => {
    const valid = u.orders.filter((o) => o.status !== "CANCELLED");
    return {
      id: u.id,
      name: u.name ?? "—",
      email: u.email,
      phone: u.phone ?? "—",
      orderCount: valid.length,
      spent: valid.reduce((s, o) => s + o.total, 0),
    };
  });

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Müşteriler</h1>
      <p className="text-muted mb-6">{rows.length} kayıtlı müşteri</p>

      <div className="bg-white rounded-2xl border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-left">
            <tr>
              <th className="p-4 font-semibold">Ad Soyad</th>
              <th className="p-4 font-semibold">E-posta</th>
              <th className="p-4 font-semibold">Telefon</th>
              <th className="p-4 font-semibold">Sipariş</th>
              <th className="p-4 font-semibold">Toplam Harcama</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {rows.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted">Henüz müşteri yok.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-surface">
                <td className="p-4 font-medium">{r.name}</td>
                <td className="p-4 text-muted">{r.email}</td>
                <td className="p-4 text-muted">{r.phone}</td>
                <td className="p-4">{r.orderCount}</td>
                <td className="p-4 font-semibold text-ink">{formatTL(r.spent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
