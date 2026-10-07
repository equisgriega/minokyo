import { prisma } from "@/lib/prisma";
import { formatTL } from "@/lib/money";
import { sendRemindersForm } from "./actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  order_confirmation: "🎉 Sipariş Onayı",
  shipping: "📦 Kargo Bildirimi",
  abandoned_cart: "🛒 Sepet Hatırlatma",
};

const STATUS_LABEL: Record<string, { t: string; cls: string }> = {
  sent: { t: "Gönderildi", cls: "bg-green-100 text-green-700" },
  demo: { t: "Demo", cls: "bg-amber-100 text-amber-700" },
  failed: { t: "Başarısız", cls: "bg-red-100 text-red-700" },
};

export default async function NotificationsPage() {
  const [logs, carts, isDemo] = await Promise.all([
    prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.abandonedCart.findMany({
      where: { recovered: false },
      orderBy: { updatedAt: "desc" },
    }),
    Promise.resolve(!process.env.RESEND_API_KEY),
  ]);

  const pending = carts.filter((c) => !c.reminded);

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">Bildirimler</h1>
      <p className="text-[#6b6b6b] mb-6">E-posta bildirimleri ve sepet hatırlatmaları</p>

      {isDemo && (
        <div className="mb-6 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          ⚙️ <strong>Demo modu aktif.</strong> E-postalar gerçekten gönderilmiyor, aşağıda kaydediliyor.
          Gerçek gönderim için <code>.env</code> dosyasına <code>RESEND_API_KEY</code> ekleyin.
        </div>
      )}

      {/* Terk edilen sepetler */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-lg">🛒 Terk Edilen Sepetler</h2>
            <p className="text-sm text-[#6b6b6b]">
              {pending.length} sepet hatırlatma bekliyor · {carts.length} toplam
            </p>
          </div>
          <form action={sendRemindersForm}>
            <button
              disabled={pending.length === 0}
              className="px-5 py-2.5 rounded-full bg-[#111111] text-white text-sm font-semibold hover:bg-[#444444] transition disabled:opacity-40"
            >
              Hatırlatma Gönder ({pending.length})
            </button>
          </form>
        </div>
        {carts.length === 0 ? (
          <p className="text-sm text-[#6b6b6b]">Terk edilen sepet yok.</p>
        ) : (
          <div className="divide-y divide-[#f0f0f0]">
            {carts.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <span className="font-medium">{c.email}</span>
                  <span className="text-[#6b6b6b] ml-2">{formatTL(c.total)}</span>
                </div>
                {c.reminded ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    Hatırlatıldı
                  </span>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                    Bekliyor
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-[#6b6b6b] mt-4">
          💡 Üretimde bir zamanlanmış görev (cron) bu hatırlatmaları otomatik gönderir.
        </p>
      </div>

      {/* E-posta kayıtları */}
      <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
        <h2 className="font-bold text-lg mb-4">📬 Gönderilen Bildirimler</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-[#6b6b6b]">Henüz bildirim gönderilmedi.</p>
        ) : (
          <div className="divide-y divide-[#f0f0f0]">
            {logs.map((l) => {
              const st = STATUS_LABEL[l.status] ?? { t: l.status, cls: "bg-gray-100 text-gray-600" };
              return (
                <div key={l.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{l.subject}</div>
                    <div className="text-xs text-[#6b6b6b]">
                      {TYPE_LABEL[l.type] ?? l.type} · {l.to} · {l.createdAt.toLocaleString("tr-TR")}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${st.cls}`}>
                    {st.t}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
