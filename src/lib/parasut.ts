// Paraşüt entegrasyonu: muhasebe + e-arşiv/e-fatura.
// Anahtarlar yoksa isParasutConfigured() = false → fatura kesilmez (atlanır).
// Üretimden önce Paraşüt SANDBOX ile mutlaka test edilmeli.
/* eslint-disable @typescript-eslint/no-explicit-any */

const BASE = "https://api.parasut.com/v4";
const TOKEN_URL = "https://api.parasut.com/oauth/token";

const CLIENT_ID = process.env.PARASUT_CLIENT_ID;
const CLIENT_SECRET = process.env.PARASUT_CLIENT_SECRET;
const USERNAME = process.env.PARASUT_USERNAME;
const PASSWORD = process.env.PARASUT_PASSWORD;
const COMPANY_ID = process.env.PARASUT_COMPANY_ID;
const VAT_RATE = Number(process.env.PARASUT_VAT_RATE ?? "10"); // çocuk giyimde KDV oranını doğrula

export function isParasutConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && USERNAME && PASSWORD && COMPANY_ID);
}

// Basit token önbelleği (bellek)
let cachedToken: { value: string; exp: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 30_000) return cachedToken.value;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "password",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      username: USERNAME,
      password: PASSWORD,
    }),
  });
  if (!res.ok) throw new Error(`Paraşüt token hatası: ${res.status}`);
  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    exp: Date.now() + (data.expires_in ?? 7200) * 1000,
  };
  return cachedToken.value;
}

async function api(path: string, method: string, body?: any, token?: string) {
  const t = token ?? (await getToken());
  const res = await fetch(`${BASE}/${COMPANY_ID}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Paraşüt ${path} hatası: ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  return json;
}

// Müşteriyi e-postaya göre bul, yoksa oluştur
async function ensureContact(token: string, o: InvoiceInput): Promise<string> {
  const found = await api(
    `/contacts?filter[email]=${encodeURIComponent(o.email)}`,
    "GET",
    undefined,
    token
  ).catch(() => null);
  if (found?.data?.length) return found.data[0].id;

  const created = await api(
    `/contacts`,
    "POST",
    {
      data: {
        type: "contacts",
        attributes: {
          name: o.fullName,
          email: o.email,
          contact_type: "person",
          account_type: "customer",
        },
      },
    },
    token
  );
  return created.data.id;
}

type InvoiceLine = { name: string; qty: number; price: number }; // price: kuruş, KDV dahil
type InvoiceInput = {
  orderNo: string;
  email: string;
  fullName: string;
  lines: InvoiceLine[];
  shipping: number; // kuruş
};

export type InvoiceResult =
  | { ok: true; invoiceId: string; url?: string }
  | { ok: false; error: string };

/**
 * Sipariş için satış faturası oluşturur ve e-arşiv olarak resmileştirir.
 * Not: KDV oranı ve ürün/kalem yapısını Paraşüt sandbox'ında doğrula.
 */
export async function createEArsivInvoice(o: InvoiceInput): Promise<InvoiceResult> {
  try {
    const token = await getToken();
    const contactId = await ensureContact(token, o);

    // KDV dahil fiyattan KDV hariç birim fiyat (Paraşüt unit_price KDV hariç ister)
    const toNet = (kurus: number) => Number(((kurus / 100) / (1 + VAT_RATE / 100)).toFixed(4));
    const details = o.lines.map((l) => ({
      type: "sales_invoice_details",
      attributes: {
        quantity: l.qty,
        unit_price: toNet(l.price),
        vat_rate: VAT_RATE,
        description: l.name,
      },
    }));
    if (o.shipping > 0) {
      details.push({
        type: "sales_invoice_details",
        attributes: { quantity: 1, unit_price: toNet(o.shipping), vat_rate: VAT_RATE, description: "Kargo" },
      });
    }

    const invoice = await api(
      `/sales_invoices`,
      "POST",
      {
        data: {
          type: "sales_invoices",
          attributes: {
            item_type: "invoice",
            description: `minokyo sipariş ${o.orderNo}`,
            issue_date: new Date().toISOString().slice(0, 10),
            currency: "TRL",
          },
          relationships: {
            details: { data: details },
            contact: { data: { type: "contacts", id: contactId } },
          },
        },
      },
      token
    );

    const invoiceId = invoice.data.id;

    // e-arşiv olarak resmileştir
    let url: string | undefined;
    try {
      const earsiv = await api(
        `/sales_invoices/${invoiceId}/e_archives`,
        "POST",
        { data: { type: "e_archives", attributes: {}, relationships: { sales_invoice: { data: { type: "sales_invoices", id: invoiceId } } } } },
        token
      );
      url = earsiv?.data?.attributes?.pdf_url;
    } catch (e) {
      // e-arşiv adımı başarısızsa fatura yine de oluştu; sadece resmileştirme uyarısı
      console.error("Paraşüt e-arşiv adımı:", e);
    }

    return { ok: true, invoiceId, url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Fatura oluşturulamadı" };
  }
}
