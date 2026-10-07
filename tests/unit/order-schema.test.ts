import { describe, it, expect } from "vitest";
import { orderSchema, mergeItems } from "@/lib/order-schema";

const valid = {
  items: [{ variantId: "v1", qty: 2 }],
  customer: {
    email: "  Ayse@Ornek.com ",
    phone: "0555 123 45 67",
    fullName: "Ayşe Yılmaz",
    line: "Papatya Sk. No:5",
    city: "İstanbul",
    district: "Kadıköy",
  },
  paymentMethod: "transfer",
};

describe("orderSchema", () => {
  it("geçerli siparişi kabul eder, e-postayı normalleştirir", () => {
    const r = orderSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.customer.email).toBe("ayse@ornek.com");
  });

  it.each([
    ["kesirli adet", { items: [{ variantId: "v1", qty: 1.5 }] }],
    ["sıfır adet", { items: [{ variantId: "v1", qty: 0 }] }],
    ["NaN adet", { items: [{ variantId: "v1", qty: Number.NaN }] }],
    ["aşırı adet", { items: [{ variantId: "v1", qty: 999 }] }],
    ["boş sepet", { items: [] }],
    ["bilinmeyen ödeme yöntemi", { paymentMethod: "bitcoin" }],
  ])("reddeder: %s", (_, patch) => {
    expect(orderSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });

  it("hatalı e-posta, telefon ve çok uzun adres reddedilir", () => {
    const ok = (c: object) => orderSchema.safeParse({ ...valid, customer: { ...valid.customer, ...c } }).success;
    expect(ok({ email: "olmaz" })).toBe(false);
    expect(ok({ phone: "abc" })).toBe(false);
    expect(ok({ line: "x".repeat(301) })).toBe(false);
  });
});

describe("mergeItems", () => {
  it("aynı bedeni tek satırda toplar (stok kontrolünü atlatma koruması)", () => {
    expect(
      mergeItems([
        { variantId: "a", qty: 1 },
        { variantId: "b", qty: 2 },
        { variantId: "a", qty: 3 },
      ])
    ).toEqual([
      { variantId: "a", qty: 4 },
      { variantId: "b", qty: 2 },
    ]);
  });
});
