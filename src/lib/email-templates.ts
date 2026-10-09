import { formatTL } from "./money";
import { escapeHtml as e, safeUrl } from "./html";

const BASE_URL = process.env.APP_URL || "http://localhost:3000";

type Item = { name: string; size: string; qty: number; price: number };

/** Sipariş detay linki — erişim anahtarı olmadan sayfa açılmaz (KVKK). */
export function orderUrl(orderNo: string, accessToken: string) {
  return `${BASE_URL}/siparis/${encodeURIComponent(orderNo)}?t=${encodeURIComponent(accessToken)}`;
}

const btn =
  "display:inline-block;margin-top:12px;background:#141414;color:#fff;text-decoration:none;padding:12px 24px;font-weight:600;font-size:14px";
const btnLight =
  "display:inline-block;margin-top:12px;background:#efebe5;color:#141414;text-decoration:none;padding:12px 24px;font-weight:600;font-size:14px";

function shell(title: string, body: string) {
  return `
  <div style="font-family:Arial,sans-serif;background:#faf8f5;padding:24px;color:#141414">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e4dfd8;overflow:hidden">
      <div style="background:#141414;padding:20px;text-align:center">
        <span style="color:#fff;font-size:24px;font-weight:800;letter-spacing:1px">minokyo</span>
      </div>
      <div style="padding:28px">
        <h1 style="font-size:20px;color:#141414;margin:0 0 12px">${e(title)}</h1>
        ${body}
      </div>
      <div style="padding:16px;text-align:center;background:#efebe5;color:#6f6a63;font-size:12px">
        minokyo · Minik tarzlar, büyük mutluluklar
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
      <td style="padding:8px 0;border-bottom:1px solid #ece8e2;font-size:14px">
        ${e(i.name)}<br><span style="color:#6f6a63;font-size:12px">${e(i.size)} Yaş × ${Number(i.qty) || 0}</span>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #ece8e2;text-align:right;font-weight:600;font-size:14px">
        ${formatTL(i.price * i.qty)}
      </td>
    </tr>`
      )
      .join("")}
  </table>`;
}

const firstNameOf = (fullName?: string | null, fallback = "") =>
  e((fullName ?? "").trim().split(" ")[0] || fallback);

export function orderConfirmationEmail(o: {
  orderNo: string;
  accessToken: string;
  fullName: string;
  items: Item[];
  subtotal: number;
  discount?: number;
  shipping: number;
  total: number;
  paymentMethod?: string;
}) {
  const transferNote =
    o.paymentMethod === "transfer"
      ? `<p style="font-size:13px;background:#efebe5;padding:12px;margin-top:12px">Havale/EFT ile ödeme seçtin. Hesap bilgilerimizi ayrıca ileteceğiz; açıklamaya sipariş numaranı (<strong>${e(o.orderNo)}</strong>) yazmayı unutma.</p>`
      : "";
  const body = `
    <p style="font-size:15px;line-height:1.6">Merhaba ${firstNameOf(o.fullName)}, siparişin bize ulaştı!</p>
    <p style="font-size:14px;color:#6f6a63">Sipariş No: <strong style="color:#141414">${e(o.orderNo)}</strong></p>
    ${itemsTable(o.items)}
    <table style="width:100%;font-size:14px">
      <tr><td>Ara Toplam</td><td style="text-align:right">${formatTL(o.subtotal)}</td></tr>
      ${o.discount ? `<tr><td>İndirim</td><td style="text-align:right">−${formatTL(o.discount)}</td></tr>` : ""}
      <tr><td>Kargo</td><td style="text-align:right">${o.shipping === 0 ? "Bedava" : formatTL(o.shipping)}</td></tr>
      <tr><td style="padding-top:8px;font-weight:700;font-size:16px;color:#141414">Toplam</td>
          <td style="padding-top:8px;text-align:right;font-weight:700;font-size:16px;color:#141414">${formatTL(o.total)}</td></tr>
    </table>
    ${transferNote}
    <p style="font-size:13px;color:#6f6a63;margin-top:16px">Siparişin hazırlanıyor. Kargoya verildiğinde seni tekrar bilgilendireceğiz.</p>
    <a href="${orderUrl(o.orderNo, o.accessToken)}" style="${btn}">Siparişini Gör</a>
  `;
  return { subject: `Siparişin alındı — ${o.orderNo}`, html: shell("Siparişin alındı!", body) };
}

export function shippingEmail(o: {
  orderNo: string;
  accessToken: string;
  fullName: string;
  carrierName?: string | null;
  trackingNo?: string | null;
  trackingUrl?: string | null;
}) {
  const carrierLine =
    o.carrierName && o.trackingNo
      ? `<p style="font-size:14px;line-height:1.6">Kargo: <strong>${e(o.carrierName)}</strong> · Takip No: <strong>${e(o.trackingNo)}</strong></p>`
      : "";
  const track = safeUrl(o.trackingUrl);
  const trackBtn = track ? `<a href="${e(track)}" style="${btn};margin-right:8px">Kargonu Takip Et</a>` : "";
  const body = `
    <p style="font-size:15px;line-height:1.6">Merhaba ${firstNameOf(o.fullName)}, harika haber!</p>
    <p style="font-size:14px;line-height:1.6"><strong>${e(o.orderNo)}</strong> numaralı siparişin kargoya verildi ve yola çıktı. Çok yakında kapında olacak!</p>
    ${carrierLine}
    ${trackBtn}
    <a href="${orderUrl(o.orderNo, o.accessToken)}" style="${btnLight}">Sipariş Detayı</a>
  `;
  return { subject: `Siparişin yola çıktı — ${o.orderNo}`, html: shell("Siparişin kargoda!", body) };
}

export function newOrderAdminEmail(o: {
  orderNo: string;
  fullName: string;
  phone: string;
  city: string;
  items: Item[];
  total: number;
  paymentMethod?: string;
}) {
  const pm = { card: "Kart", transfer: "Havale/EFT", door: "Kapıda ödeme" }[o.paymentMethod ?? ""] ?? o.paymentMethod ?? "";
  const body = `
    <p style="font-size:15px;line-height:1.6">Yeni sipariş geldi!</p>
    <p style="font-size:14px">No: <strong>${e(o.orderNo)}</strong> · Müşteri: <strong>${e(o.fullName)}</strong> (${e(o.phone)}, ${e(o.city)})${pm ? ` · Ödeme: <strong>${e(pm)}</strong>` : ""}</p>
    ${itemsTable(o.items)}
    <p style="font-size:16px;font-weight:700;color:#141414">Toplam: ${formatTL(o.total)}</p>
    <a href="${BASE_URL}/admin/orders" style="${btn}">Panelde Aç</a>
  `;
  return { subject: `Yeni sipariş — ${o.orderNo} · ${formatTL(o.total)}`, html: shell("Yeni Sipariş", body) };
}

export function abandonedCartEmail(c: { name?: string | null; items: Item[]; total: number }) {
  const body = `
    <p style="font-size:15px;line-height:1.6">Merhaba ${firstNameOf(c.name)}, sepetinde seni bekleyen güzel parçalar var!</p>
    ${itemsTable(c.items)}
    <p style="font-size:14px;color:#6f6a63">Tutar: <strong style="color:#141414">${formatTL(c.total)}</strong></p>
    <p style="font-size:13px;color:#6f6a63">Stoklar tükenmeden alışverişini tamamla. Minik tarzlar seni bekliyor!</p>
    <a href="${BASE_URL}/odeme" style="${btn}">Alışverişi Tamamla</a>
  `;
  return { subject: "Sepetini unuttun mu? · minokyo", html: shell("Sepetin seni bekliyor", body) };
}

export function passwordResetEmail(o: { name?: string | null; url: string; minutes: number }) {
  const body = `
    <p style="font-size:15px;line-height:1.6">Merhaba ${firstNameOf(o.name)}, şifreni sıfırlamak için bir istek aldık.</p>
    <a href="${e(o.url)}" style="${btn}">Yeni Şifre Belirle</a>
    <p style="font-size:13px;color:#6f6a63;margin-top:18px">Bu link ${o.minutes} dakika geçerlidir ve yalnızca bir kez kullanılabilir.</p>
    <p style="font-size:13px;color:#6f6a63">Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin; şifren değişmez.</p>
  `;
  return { subject: "Şifre sıfırlama · minokyo", html: shell("Şifreni sıfırla", body) };
}
