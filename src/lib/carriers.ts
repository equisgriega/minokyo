// Kargo firmaları + takip linki şablonları.
// Not: Takip URL'leri firma değiştirdikçe güncellenebilir; takip no saklandığı
// için linki her zaman yeniden üretebiliriz.

export type CarrierCode = "yurtici" | "aras" | "mng" | "ptt";

type Carrier = {
  code: CarrierCode;
  name: string;
  track: (no: string) => string;
};

export const CARRIERS: Record<CarrierCode, Carrier> = {
  yurtici: {
    code: "yurtici",
    name: "Yurtiçi Kargo",
    track: (no) =>
      `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(no)}`,
  },
  aras: {
    code: "aras",
    name: "Aras Kargo",
    track: (no) =>
      `https://www.araskargo.com.tr/tr/cargo-tracking?code=${encodeURIComponent(no)}`,
  },
  mng: {
    code: "mng",
    name: "MNG Kargo",
    track: (no) => `https://kargotakip.mngkargo.com.tr/?takipNo=${encodeURIComponent(no)}`,
  },
  ptt: {
    code: "ptt",
    name: "PTT Kargo",
    track: (no) =>
      `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodeURIComponent(no)}`,
  },
};

export const CARRIER_LIST = Object.values(CARRIERS);

export function carrierName(code?: string | null): string | null {
  if (!code) return null;
  return CARRIERS[code as CarrierCode]?.name ?? code;
}

export function trackingUrl(code?: string | null, no?: string | null): string | null {
  if (!code || !no) return null;
  const c = CARRIERS[code as CarrierCode];
  return c ? c.track(no) : null;
}
