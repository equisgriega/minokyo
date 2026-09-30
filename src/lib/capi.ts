import crypto from "crypto";

// Sunucu tarafı dönüşüm olayları (Meta Conversions API + TikTok Events API).
// Anahtarlar yoksa hiçbir istek gitmez. Purchase, istemci Pixel'iyle aynı
// event_id kullanır → Meta/TikTok tarafında tekilleştirilir (dedup).

const META_PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const META_TOKEN = process.env.META_CAPI_TOKEN;
const META_TEST = process.env.META_TEST_EVENT_CODE;
const TT_PIXEL = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
const TT_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const BASE = process.env.APP_URL || "http://localhost:3000";

function hash(v?: string | null) {
  if (!v) return undefined;
  return crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
}

type PurchaseInput = {
  orderNo: string;
  email?: string | null;
  phone?: string | null;
  value: number; // kuruş
  contents: { id: string; quantity: number; item_price: number }[];
  clientIp?: string;
  clientUserAgent?: string;
};

export async function capiPurchase(o: PurchaseInput): Promise<void> {
  const eventId = `purchase_${o.orderNo}`;
  const valueTL = o.value / 100;
  const eventTime = Math.floor(Date.now() / 1000);

  // ---- Meta Conversions API ----
  if (META_PIXEL && META_TOKEN) {
    try {
      const body = {
        data: [
          {
            event_name: "Purchase",
            event_time: eventTime,
            event_id: eventId,
            action_source: "website",
            event_source_url: `${BASE}/siparis/${o.orderNo}`,
            user_data: {
              em: hash(o.email) ? [hash(o.email)] : undefined,
              ph: hash(o.phone) ? [hash(o.phone)] : undefined,
              client_ip_address: o.clientIp,
              client_user_agent: o.clientUserAgent,
            },
            custom_data: {
              currency: "TRY",
              value: valueTL,
              content_type: "product",
              contents: o.contents,
              num_items: o.contents.reduce((s, c) => s + c.quantity, 0),
              order_id: o.orderNo,
            },
          },
        ],
        ...(META_TEST ? { test_event_code: META_TEST } : {}),
      };
      await fetch(
        `https://graph.facebook.com/v21.0/${META_PIXEL}/events?access_token=${META_TOKEN}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
    } catch (e) {
      console.error("Meta CAPI hata:", e);
    }
  }

  // ---- TikTok Events API ----
  if (TT_PIXEL && TT_TOKEN) {
    try {
      const body = {
        event_source: "web",
        event_source_id: TT_PIXEL,
        data: [
          {
            event: "CompletePayment",
            event_time: eventTime,
            event_id: eventId,
            user: { email: hash(o.email), phone: hash(o.phone) },
            properties: {
              currency: "TRY",
              value: valueTL,
              contents: o.contents.map((c) => ({
                content_id: c.id,
                quantity: c.quantity,
                price: c.item_price,
              })),
            },
          },
        ],
      };
      await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Access-Token": TT_TOKEN },
        body: JSON.stringify(body),
      });
    } catch (e) {
      console.error("TikTok Events hata:", e);
    }
  }
}
