// Fiyatlar veritabanında kuruş (integer) tutulur; burada ₺ olarak biçimlenir.
export function formatTL(kurus: number): string {
  // Tam tutarlar sade (499₺), küsuratlılar iki haneli (49,90₺)
  const digits = kurus % 100 === 0 ? 0 : 2;
  return (
    (kurus / 100).toLocaleString("tr-TR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }) + "₺"
  );
}

export function tlToKurus(tl: number): number {
  return Math.round(tl * 100);
}

// Kargo kuralları (kuruş) — ödeme, sepet ve sunucu aynı değeri kullanır
export const FREE_SHIP_LIMIT = 50000; // 500₺ ve üzeri kargo bedava
export const SHIP_COST = 4990; // 49,90₺
