import { describe, it, expect } from "vitest";
import { sortProducts, parseSort, listingHref, SORT_OPTIONS } from "@/lib/sorting";

const p = (id: string, price: number, opts: { featured?: boolean; day?: number; stock?: number } = {}) => ({
  id,
  price,
  featured: opts.featured ?? false,
  createdAt: new Date(2026, 8, opts.day ?? 1),
  variants: [{ stock: opts.stock ?? 5 }],
});

const ids = (list: { id: string }[]) => list.map((x) => x.id);

describe("sıralama seçenekleri", () => {
  it("ürün adına göre sıralama yok", () => {
    expect(SORT_OPTIONS.map((o) => o.key)).toEqual(["akilli", "cok-satan", "yeni", "fiyat-artan", "fiyat-azalan"]);
  });
  it("bilinmeyen veya eksik değer akıllı sıralamaya düşer", () => {
    expect(parseSort(undefined)).toBe("akilli");
    expect(parseSort("ad-a-z")).toBe("akilli");
    expect(parseSort("fiyat-artan")).toBe("fiyat-artan");
  });
});

describe("sortProducts", () => {
  const list = [p("a", 500, { day: 1 }), p("b", 300, { day: 3 }), p("c", 400, { day: 2 })];

  it("fiyata göre artan / azalan", () => {
    expect(ids(sortProducts(list, "fiyat-artan"))).toEqual(["b", "c", "a"]);
    expect(ids(sortProducts(list, "fiyat-azalan"))).toEqual(["a", "c", "b"]);
  });
  it("en yeni önce", () => {
    expect(ids(sortProducts(list, "yeni"))).toEqual(["b", "c", "a"]);
  });
  it("çok satan: satış adedine göre, eşitlikte en yeni", () => {
    const sales = new Map([["a", 10], ["c", 3]]);
    expect(ids(sortProducts(list, "cok-satan", sales))).toEqual(["a", "c", "b"]);
  });
  it("akıllı: stokta olan > öne çıkan > çok satan > en yeni", () => {
    const smart = [
      p("tukendi-one-cikan", 100, { featured: true, stock: 0 }),
      p("yeni", 100, { day: 9 }),
      p("cok-satan", 100, { day: 1 }),
      p("one-cikan", 100, { featured: true, day: 1 }),
    ];
    const sales = new Map([["cok-satan", 7]]);
    expect(ids(sortProducts(smart, "akilli", sales))).toEqual(["one-cikan", "cok-satan", "yeni", "tukendi-one-cikan"]);
  });
  it("orijinal listeyi değiştirmez", () => {
    const copy = ids(list);
    sortProducts(list, "fiyat-artan");
    expect(ids(list)).toEqual(copy);
  });
});

describe("listingHref", () => {
  it("filtreyi ve sıralamayı birlikte korur, varsayılanı adrese yazmaz", () => {
    expect(listingHref({ cinsiyet: "kiz", sirala: "fiyat-artan" })).toBe("/urunler?cinsiyet=kiz&sirala=fiyat-artan");
    expect(listingHref({ kategori: "takimlar", sirala: "akilli" })).toBe("/urunler?kategori=takimlar");
    expect(listingHref({})).toBe("/urunler");
  });
});
