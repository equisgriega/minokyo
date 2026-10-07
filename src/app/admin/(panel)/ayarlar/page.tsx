import { formatTL } from "@/lib/money";

export const dynamic = "force-dynamic";

const BASE = process.env.APP_URL || "http://localhost:3000";

type Row = { label: string; ok: boolean; env: string; note: string };

export default function SettingsPage() {
  const groups: { title: string; rows: Row[] }[] = [
    {
      title: "Ödeme",
      rows: [
        {
          label: "iyzico ödeme",
          ok: Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY),
          env: "IYZICO_API_KEY + IYZICO_SECRET_KEY",
          note: "Kapalıyken sipariş oluşur ama kart çekilmez (demo).",
        },
      ],
    },
    {
      title: "Muhasebe & Fatura",
      rows: [
        {
          label: "Paraşüt (muhasebe + e-fatura)",
          ok: Boolean(
            process.env.PARASUT_CLIENT_ID &&
              process.env.PARASUT_CLIENT_SECRET &&
              process.env.PARASUT_USERNAME &&
              process.env.PARASUT_PASSWORD &&
              process.env.PARASUT_COMPANY_ID
          ),
          env: "PARASUT_CLIENT_ID + SECRET + USERNAME + PASSWORD + COMPANY_ID",
          note: "Sipariş tamamlanınca otomatik e-arşiv fatura keser + muhasebeye işler.",
        },
      ],
    },
    {
      title: "Kargo",
      rows: [
        {
          label: "Kargo API (otomatik gönderi)",
          ok: Boolean(process.env.SHIPPING_API_KEY && process.env.SHIPPING_API_URL),
          env: "SHIPPING_API_KEY + SHIPPING_API_URL",
          note: "Kapalıyken manuel takip çalışır (admin takip no girer).",
        },
      ],
    },
    {
      title: "Meta (Facebook / Instagram)",
      rows: [
        {
          label: "Meta Pixel (tarayıcı)",
          ok: Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID),
          env: "NEXT_PUBLIC_META_PIXEL_ID",
          note: "Sayfa/ürün/sepet olaylarını tarayıcıdan gönderir.",
        },
        {
          label: "Meta Conversions API (sunucu)",
          ok: Boolean(process.env.META_CAPI_TOKEN),
          env: "META_CAPI_TOKEN",
          note: "Satın alma olayını sunucudan da gönderir (dedup).",
        },
      ],
    },
    {
      title: "TikTok",
      rows: [
        {
          label: "TikTok Pixel",
          ok: Boolean(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID),
          env: "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
          note: "TikTok reklam takibi.",
        },
        {
          label: "TikTok Events API",
          ok: Boolean(process.env.TIKTOK_ACCESS_TOKEN),
          env: "TIKTOK_ACCESS_TOKEN",
          note: "Sunucu tarafı TikTok olayları.",
        },
      ],
    },
    {
      title: "E-posta & Otomasyon",
      rows: [
        {
          label: "E-posta gönderimi (Resend)",
          ok: Boolean(process.env.RESEND_API_KEY),
          env: "RESEND_API_KEY",
          note: "Kapalıyken e-postalar demo (sadece kayıt).",
        },
        {
          label: "Sepet hatırlatma cron'u",
          ok: Boolean(process.env.CRON_SECRET),
          env: "CRON_SECRET",
          note: "Otomatik sepet hatırlatması için gizli anahtar.",
        },
      ],
    },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">Entegrasyonlar</h1>
      <p className="text-muted mb-6">
        Anahtarları <code>.env</code> dosyasına ekleyip sunucuyu yeniden başlatınca ✅ olur.
      </p>

      {/* Katalog feed */}
      <div className="bg-white rounded-2xl border border-line p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-bold">🗂️ Ürün Katalog Feed&apos;i</h2>
            <p className="text-sm text-muted">Meta/TikTok katalog için bu adresi ver.</p>
          </div>
          <a
            href="/catalog.xml"
            target="_blank"
            className="text-sm text-ink font-semibold underline break-all"
          >
            {BASE}/catalog.xml
          </a>
        </div>
      </div>

      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.title} className="bg-white rounded-2xl border border-line p-5">
            <h2 className="font-bold mb-3">{g.title}</h2>
            <div className="divide-y divide-line-soft">
              {g.rows.map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <div className="font-medium text-sm">{r.label}</div>
                    <div className="text-xs text-muted">{r.note}</div>
                    <code className="text-[11px] text-ink-2">{r.env}</code>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      r.ok ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {r.ok ? "✅ Bağlı" : "○ Bağlı değil"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted mt-6">
        Not: Bu sayfa yalnızca anahtarın <em>tanımlı olup olmadığını</em> gösterir; geçerliliğini
        Meta Events Manager / iyzico panelinden test et. Örnek eşik: 500 TL üzeri kargo bedava (
        {formatTL(50000)}).
      </p>
    </div>
  );
}
