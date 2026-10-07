import { describe, it, expect } from "vitest";
import { formatTL, tlToKurus, FREE_SHIP_LIMIT, SHIP_COST } from "@/lib/money";
import { calcDiscount, calcShipping, calcTotals } from "@/lib/pricing";

const norm = (s: string) => s.replace(/ /g, " ");

describe("formatTL", () => {
  it("Türkiye biçiminde iki haneli yazar", () => {
    expect(norm(formatTL(47900))).toBe("479,00 TL");
    expect(norm(formatTL(4990))).toBe("49,90 TL");
    expect(norm(formatTL(145000))).toBe("1.450,00 TL");
    expect(norm(formatTL(0))).toBe("0,00 TL");
  });
});

describe("tlToKurus", () => {
  it("kayan nokta hatasını yuvarlar", () => {
    expect(tlToKurus(549.9)).toBe(54990);
    expect(tlToKurus(0.1 + 0.2)).toBe(30);
  });
});

describe("kargo kuralları", () => {
  it("sabitler: 500 TL eşik, 49,90 TL ücret", () => {
    expect(FREE_SHIP_LIMIT).toBe(50000);
    expect(SHIP_COST).toBe(4990);
  });
  it("499,99 TL'de kargo ücretli, 500,00 TL'de bedava", () => {
    expect(calcShipping(49999)).toBe(4990);
    expect(calcShipping(50000)).toBe(0);
    expect(calcShipping(50001)).toBe(0);
  });
  it("boş sepette kargo yok", () => {
    expect(calcShipping(0)).toBe(0);
  });
});

describe("calcDiscount", () => {
  it("yüzde indirim yuvarlanır", () => {
    expect(calcDiscount({ type: "percent", value: 10 }, 54900)).toBe(5490);
    expect(calcDiscount({ type: "percent", value: 15 }, 333)).toBe(50); // 49,95 → 50
  });
  it("sabit indirim ara toplamı geçemez", () => {
    expect(calcDiscount({ type: "fixed", value: 10000 }, 5000)).toBe(5000);
    expect(calcDiscount({ type: "fixed", value: 2000 }, 5000)).toBe(2000);
  });
  it("hatalı veya aşırı değerler sınırlandırılır", () => {
    expect(calcDiscount({ type: "percent", value: 150 }, 10000)).toBe(10000);
    expect(calcDiscount({ type: "percent", value: -5 }, 10000)).toBe(0);
    expect(calcDiscount({ type: "fixed", value: -100 }, 10000)).toBe(0);
  });
});

describe("calcTotals", () => {
  it("kargo eşiği indirimden ÖNCEKİ ara toplama göre", () => {
    // 520 TL sepet, 100 TL indirim → kargo yine bedava
    expect(calcTotals(52000, 10000)).toEqual({ subtotal: 52000, discount: 10000, shipping: 0, total: 42000 });
  });
  it("eşik altı: toplam = ara toplam − indirim + kargo", () => {
    expect(calcTotals(30000, 3000).total).toBe(30000 - 3000 + 4990);
  });
  it("toplam asla eksiye düşmez", () => {
    expect(calcTotals(1000, 5000).total).toBe(4990);
  });
});
