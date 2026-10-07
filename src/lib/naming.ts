// Ürün isimlendirme kuralı: çift tırnak kullanılmaz, fazla boşluk temizlenir.
// Örn. '"Milk Club" Tayt Takımı' → 'Milk Club Tayt Takımı'. Kesme işareti (Frank's) korunur.
export function cleanProductName(name: string): string {
  return name
    .replace(/["“”„«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
