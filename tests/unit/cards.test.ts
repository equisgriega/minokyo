import { describe, it, expect, vi, afterEach } from "vitest";
import { toCard } from "@/lib/cards";

const base = {
  slug: "s",
  name: "Ürün",
  price: 50000,
  compareAt: null as number | null,
  gender: "kiz",
  createdAt: new Date(),
  images: [{ url: "/a.jpg" }],
  category: { name: "Takımlar" },
  variants: [{ stock: 2 }, { stock: 3 }],
};

afterEach(() => vi.useRealTimers());

describe("toCard", () => {
  it("toplam stoğu toplar, görsel yoksa yedek görsel kullanır", () => {
    expect(toCard(base).totalStock).toBe(5);
    expect(toCard({ ...base, images: [] }).image).toBe("/products/p1.jpeg");
  });
  it("indirim yalnızca eski fiyat yeni fiyattan büyükse gösterilir", () => {
    expect(toCard({ ...base, compareAt: 60000 }).compareAt).toBe(60000);
    expect(toCard({ ...base, compareAt: 50000 }).compareAt).toBeNull();
    expect(toCard({ ...base, compareAt: 40000 }).compareAt).toBeNull();
  });
  it("30 günden eski ürün 'Yeni' sayılmaz", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-07"));
    expect(toCard({ ...base, createdAt: new Date("2026-10-01") }).isNew).toBe(true);
    expect(toCard({ ...base, createdAt: new Date("2026-08-01") }).isNew).toBe(false);
  });
});
