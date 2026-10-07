import { describe, it, expect } from "vitest";
import { cleanProductName } from "@/lib/naming";
import { escapeHtml, safeUrl } from "@/lib/html";

describe("cleanProductName", () => {
  it("çift tırnakları ve fazla boşluğu temizler", () => {
    expect(cleanProductName('"Milk Club" Tayt Takımı')).toBe("Milk Club Tayt Takımı");
    expect(cleanProductName("“Nice & Toasty”   Tost  Takım ")).toBe("Nice & Toasty Tost Takım");
  });
  it("kesme işaretini korur", () => {
    expect(cleanProductName("Frank's Garage Pantolon")).toBe("Frank's Garage Pantolon");
  });
});

describe("escapeHtml", () => {
  it("HTML enjeksiyonunu etkisizleştirir", () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(escapeHtml("Ayşe & Ali's")).toBe("Ayşe &amp; Ali&#39;s");
    expect(escapeHtml(null)).toBe("");
  });
});

describe("safeUrl", () => {
  it("yalnızca http(s) linklerine izin verir", () => {
    expect(safeUrl("https://kargo.com/takip?no=1")).toBe("https://kargo.com/takip?no=1");
    expect(safeUrl("javascript:alert(1)")).toBeNull();
    expect(safeUrl("data:text/html,x")).toBeNull();
    expect(safeUrl("bozuk link")).toBeNull();
    expect(safeUrl(null)).toBeNull();
  });
});
