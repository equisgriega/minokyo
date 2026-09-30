// Fiyatlar veritabanında kuruş (integer) tutulur; burada ₺ olarak biçimlenir.
export function formatTL(kurus: number): string {
  return (
    (kurus / 100).toLocaleString("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) + "₺"
  );
}

export function tlToKurus(tl: number): number {
  return Math.round(tl * 100);
}
