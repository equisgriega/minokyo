import { formatTL } from "./money";

const BASE_URL = process.env.APP_URL || "http://localhost:3000";

type Item = { name: string; size: string; qty: number; price: number };

function shell(title: string, body: string) {
  return `
  <div style="font-family:Arial,sans-serif;background:#f7f2ea;padding:24px;color:#3b2f28">
    <div style="max-width:520px;margin:0 auto;background:#fffdf9;border:1px solid #e6dccd;border-radius:16px;overflow:hidden">
      <div style="background:#5c4230;padding:20px;text-align:center">
        <span style="color:#fff;font-size:24px;font-weight:800;letter-spacing:1px">minokyo</span>
      </div>
      <div style="padding:28px">
        <h1 style="font-size:20px;color:#5c4230;margin:0 0 12px">${title}</h1>
        ${body}
      </div>
      <div style="padding:16px;text-align:center;background:#efe7db;color:#6b5c51;font-size:12px">
        minokyo · Minik tarzlar, büyük mutluluklar 💛
      </div>
    </div>
  </div>`;
}

function itemsTable(items: Item[]) {
  return `
  <table style="width:100%;border-collapse:collapse;margin:12px 0">
    ${items
      .map(
        (i) => `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0e9dd;font-size:14px">
        ${i.name}<br><span style="color:#6b5c51;font-size:12px">${i.size} Yaş × ${i.qty}</span>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f0e9dd;text-align:right;font-weight:600;font-size:14px">
        ${formatTL(i.price * i.qty)}
      </td>
    </tr>`
      )
      .join("")}
  </table>`;
}

export function orderConfirmationEmail(o: {
  orderNo: string;
  fullName: string;
  items: Item[];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  const firstName = o.fullName.split(" ")[0];
  const body = `
    <p style="font-size:15px;line-height:1.6">Merhaba ${firstName}, siparişin bize ulaştı! 🎉</p>
    <p style="font-size:14px;color:#6b5c51">Sipariş No: <strong style="color:#3b2f28">${o.orderNo}</strong></p>
    ${itemsTable(o.items)}
    <table style="width:100%;font-size:14px">
      <tr><td>Ara Toplam</td><td style="text-align:right">${formatTL(o.subtotal)}</td></tr>
      <tr><td>Kargo</td><td style="text-align:right">${o.shipping === 0 ? "Bedava" : formatTL(o.shipping)}</td></tr>
      <tr><td style="padding-top:8px;font-weight:700;font-size:16px;color:#5c4230">Toplam</td>
          <td style="padding-top:8px;text-align:right;font-weight:700;font-size:16px;color:#5c4230">${formatTL(o.total)}</td></tr>
    </table>
    <p style="font-size:13px;color:#6b5c51;margin-top:16px">Siparişin hazırlanıyor. Kargoya verildiğinde seni tekrar bilgilendireceğiz.</p>
    <a href="${BASE_URL}/siparis/${o.orderNo}" style="display:inline-block;margin-top:12px;background:#5c4230;color:#fff;text-decoration:none;padding:12px 24px;border-radius:100px;font-weight:600;font-size:14px">Siparişini Gör</a>
  `;
  return { subject: `Siparişin alındı — ${o.orderNo} 🎉`, html: shell("Siparişin alındı!", body) };
}

export function shippingEmail(o: {
  orderNo: string;
  fullName: string;
  carrierName?: string | null;
  trackingNo?: string | null;
  trackingUrl?: string | null;
}) {
  const firstName = o.fullName.split(" ")[0];
  const carrierLine =
    o.carrierName && o.trackingNo
      ? `<p style="font-size:14px;line-height:1.6">Kargo: <strong>${o.carrierName}</strong> · Takip No: <strong>${o.trackingNo}</strong></p>`
      : "";
  const trackBtn = o.trackingUrl
    ? `<a href="${o.trackingUrl}" style="display:inline-block;margin-top:12px;margin-right:8px;background:#5c4230;color:#fff;text-decoration:none;padding:12px 24px;border-radius:100px;font-weight:600;font-size:14px">Kargonu Takip Et</a>`
    : "";
  const body = `
    <p style="font-size:15px;line-height:1.6">Merhaba ${firstName}, harika haber! 📦</p>
    <p style="font-size:14px;line-height:1.6"><strong>${o.orderNo}</strong> numaralı siparişin kargoya verildi ve yola çıktı. Çok yakında kapında olacak!</p>
    ${carrierLine}
    ${trackBtn}
    <a href="${BASE_URL}/siparis/${o.orderNo}" style="display:inline-block;margin-top:12px;background:#efe7db;color:#5c4230;text-decoration:none;padding:12px 24px;border-radius:100px;font-weight:600;font-size:14px">Sipariş Detayı</a>
  `;
  return { subject: `Siparişin yola çıktı — ${o.orderNo} 📦`, html: shell("Siparişin kargoda!", body) };
}

export function newOrderAdminEmail(o: {
  orderNo: string;
  fullName: string;
  phone: string;
  city: string;
  items: Item[];
  total: number;
}) {
  const body = `
    <p style="font-size:15px;line-height:1.6">Yeni sipariş geldi! 🎉</p>
    <p style="font-size:14px">No: <strong>${o.orderNo}</strong> · Müşteri: <strong>${o.fullName}</strong> (${o.phone}, ${o.city})</p>
    ${itemsTable(o.items)}
    <p style="font-size:16px;font-weight:700;color:#5c4230">Toplam: ${formatTL(o.total)}</p>
    <a href="${BASE_URL}/admin/orders" style="display:inline-block;margin-top:12px;background:#5c4230;color:#fff;text-decoration:none;padding:12px 24px;border-radius:100px;font-weight:600;font-size:14px">Panelde Aç</a>
  `;
  return { subject: `🛍️ Yeni sipariş — ${o.orderNo} · ${formatTL(o.total)}`, html: shell("Yeni Sipariş", body) };
}

export function abandonedCartEmail(c: { name?: string | null; items: Item[]; total: number }) {
  const firstName = c.name?.split(" ")[0] ?? "merhaba";
  const body = `
    <p style="font-size:15px;line-height:1.6">Merhaba ${firstName}, sepetinde seni bekleyen güzel parçalar var! 🛒</p>
    ${itemsTable(c.items)}
    <p style="font-size:14px;color:#6b5c51">Tutar: <strong style="color:#3b2f28">${formatTL(c.total)}</strong></p>
    <p style="font-size:13px;color:#6b5c51">Stoklar tükenmeden alışverişini tamamla. Minik tarzlar seni bekliyor!</p>
    <a href="${BASE_URL}/odeme" style="display:inline-block;margin-top:12px;background:#5c4230;color:#fff;text-decoration:none;padding:12px 24px;border-radius:100px;font-weight:600;font-size:14px">Alışverişi Tamamla</a>
  `;
  return { subject: "Sepetini unuttun mu? 🛒 minokyo", html: shell("Sepetin seni bekliyor 💛", body) };
}
