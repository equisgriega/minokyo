// İstemci tarafı reklam olayları (Meta Pixel + TikTok Pixel).
// Anahtar tanımlı değilse window.fbq/ttq olmaz; çağrılar sessizce yok sayılır.
// Purchase için event_id, sunucu (CAPI) ile aynı olmalı → tekilleştirme (dedup).

/* eslint-disable @typescript-eslint/no-explicit-any */

type Content = { id: string; quantity: number; item_price: number };

function fbq(...args: any[]) {
  if (typeof window !== "undefined" && (window as any).fbq) (window as any).fbq(...args);
}
function ttq(): any {
  return typeof window !== "undefined" ? (window as any).ttq : undefined;
}

export function trackViewContent(p: { id: string; name: string; price: number }) {
  fbq("track", "ViewContent", {
    content_ids: [p.id],
    content_name: p.name,
    content_type: "product",
    value: p.price / 100,
    currency: "TRY",
  });
  ttq()?.track?.("ViewContent", {
    content_id: p.id,
    content_name: p.name,
    value: p.price / 100,
    currency: "TRY",
  });
}

export function trackAddToCart(p: { id: string; name: string; price: number; qty: number }) {
  fbq("track", "AddToCart", {
    content_ids: [p.id],
    content_name: p.name,
    content_type: "product",
    value: (p.price / 100) * p.qty,
    currency: "TRY",
  });
  ttq()?.track?.("AddToCart", {
    content_id: p.id,
    value: (p.price / 100) * p.qty,
    currency: "TRY",
  });
}

export function trackInitiateCheckout(value: number, contents: Content[]) {
  fbq("track", "InitiateCheckout", {
    value: value / 100,
    currency: "TRY",
    content_type: "product",
    content_ids: contents.map((c) => c.id),
    num_items: contents.reduce((s, c) => s + c.quantity, 0),
  });
  ttq()?.track?.("InitiateCheckout", { value: value / 100, currency: "TRY" });
}

export function trackPurchase(o: {
  orderNo: string;
  value: number;
  contents: Content[];
}) {
  const eventId = `purchase_${o.orderNo}`; // CAPI ile aynı → dedup
  fbq(
    "track",
    "Purchase",
    {
      value: o.value / 100,
      currency: "TRY",
      content_type: "product",
      content_ids: o.contents.map((c) => c.id),
      num_items: o.contents.reduce((s, c) => s + c.quantity, 0),
    },
    { eventID: eventId }
  );
  ttq()?.track?.("PlaceAnOrder", { value: o.value / 100, currency: "TRY" });
}
