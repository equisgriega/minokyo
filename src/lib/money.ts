// Fiyatlar veritabanında kuruş (integer) tutulur; burada ₺ olarak biçimlenir.
export function formatTL(kurus: number): string {
  // Türkiye e-ticaret alışkanlığı: 1.450,00 TL
  return (
    (kurus / 100).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " TL"
  );
}

export function tlToKurus(tl: number): number {
  return Math.round(tl * 100);
}

// Kargo kuralları (kuruş) — ödeme, sepet ve sunucu aynı değeri kullanır
export const FREE_SHIP_LIMIT = 50000; // 500₺ ve üzeri kargo bedava
export const SHIP_COST = 4990; // 49,90₺
