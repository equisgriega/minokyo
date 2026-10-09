// Ürün listesi sıralama seçenekleri ve kuralları (saf fonksiyonlar → test edilebilir)

export const SORT_OPTIONS = [
  { key: "akilli", label: "Akıllı Sıralama" },
  { key: "cok-satan", label: "Çok Satan Ürünler" },
  { key: "yeni", label: "En Yeni Ürünler" },
  { key: "fiyat-artan", label: "Fiyata Göre (Artan)" },
  { key: "fiyat-azalan", label: "Fiyata Göre (Azalan)" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];
export const DEFAULT_SORT: SortKey = "akilli";

export function parseSort(value: string | undefined): SortKey {
  return SORT_OPTIONS.some((o) => o.key === value) ? (value as SortKey) : DEFAULT_SORT;
}

/** Sıralama için gereken asgari ürün bilgisi */
export type Sortable = {
  id: string;
  price: number;
  featured: boolean;
  createdAt: Date;
  variants: { stock: number }[];
};

const inStock = (p: Sortable) => p.variants.some((v) => v.stock > 0);
const newest = (a: Sortable, b: Sortable) => b.createdAt.getTime() - a.createdAt.getTime();

/**
 * @param sales ürün id → satılan adet (ödenmiş/kargolanmış/teslim edilmiş siparişler)
 */
export function sortProducts<T extends Sortable>(list: T[], sort: SortKey, sales: Map<string, number> = new Map()): T[] {
  const sold = (p: T) => sales.get(p.id) ?? 0;
  const arr = [...list];
  switch (sort) {
    case "cok-satan":
      return arr.sort((a, b) => sold(b) - sold(a) || newest(a, b));
    case "yeni":
      return arr.sort(newest);
    case "fiyat-artan":
      return arr.sort((a, b) => a.price - b.price || newest(a, b));
    case "fiyat-azalan":
      return arr.sort((a, b) => b.price - a.price || newest(a, b));
    case "akilli":
    default:
      // Stokta olanlar → öne çıkanlar → çok satanlar → en yeniler
      return arr.sort(
        (a, b) =>
          Number(inStock(b)) - Number(inStock(a)) ||
          Number(b.featured) - Number(a.featured) ||
          sold(b) - sold(a) ||
          newest(a, b)
      );
  }
}

/** Filtre + sıralama parametrelerini koruyarak /urunler adresi üretir. */
export function listingHref(params: { cinsiyet?: string; kategori?: string; sirala?: string }) {
  const q = new URLSearchParams();
  if (params.cinsiyet) q.set("cinsiyet", params.cinsiyet);
  if (params.kategori) q.set("kategori", params.kategori);
  if (params.sirala && params.sirala !== DEFAULT_SORT) q.set("sirala", params.sirala);
  const s = q.toString();
  return s ? `/urunler?${s}` : "/urunler";
}
