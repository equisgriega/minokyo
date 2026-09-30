// Kargo aggregator entegrasyonu (Navlungo / Geliver / Basit Kargo vb.).
// Anahtar yoksa isShippingApiConfigured() = false → manuel takip kullanılır.
// Sağlayıcıya göre uç nokta/gövde farklıdır; env ile ayarlanır, yanıt eşlenir.
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CarrierCode } from "./carriers";

const API_KEY = process.env.SHIPPING_API_KEY;
const API_URL = process.env.SHIPPING_API_URL; // sağlayıcının "gönderi oluştur" uç noktası

export type ShipmentResult = {
  carrier: CarrierCode | string;
  trackingNo: string;
  labelUrl?: string;
};

export type ShipmentInput = {
  orderNo: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  line: string;
  desi?: number;
};

export function isShippingApiConfigured(): boolean {
  return Boolean(API_KEY && API_URL);
}

/**
 * Gönderi oluşturur. API yapılandırılmadıysa null → manuel moda düşülür.
 * Yanıt alanları sağlayıcıya göre değişir; birkaç yaygın isim denenir.
 */
export async function createShipment(input: ShipmentInput): Promise<ShipmentResult | null> {
  if (!isShippingApiConfigured()) return null;

  const res = await fetch(API_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      orderNumber: input.orderNo,
      recipient: {
        name: input.fullName,
        phone: input.phone,
        email: input.email,
        city: input.city,
        district: input.district,
        address: input.line,
      },
      parcel: { desi: input.desi ?? 1 },
    }),
  });

  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Kargo API hatası: ${res.status} ${JSON.stringify(data).slice(0, 200)}`);
  }

  // Yaygın yanıt alan adlarını dene (sağlayıcıya göre ayarlanır)
  const trackingNo =
    data.trackingNumber || data.trackingNo || data.tracking_code || data.barcode || data.code;
  const labelUrl = data.labelUrl || data.label_url || data.labelPdf || data.pdfUrl;
  const carrier = data.carrier || data.provider || "aggregator";

  if (!trackingNo) throw new Error("Kargo API takip numarası döndürmedi.");
  return { carrier, trackingNo, labelUrl };
}
