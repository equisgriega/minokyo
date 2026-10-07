import type { CardProduct } from "@/components/ProductCard";

// Ürün kartı için gereken ilişkiler — findMany({ include: cardInclude })
export const cardInclude = {
  images: { orderBy: { position: "asc" as const }, take: 1 },
  variants: { select: { stock: true } },
  category: { select: { name: true } },
};

// Bu kadar gün içinde eklenen ürünler "Yeni" rozeti alır
const NEW_DAYS = 30;

type CardSource = {
  slug: string;
  name: string;
  price: number;
  compareAt: number | null;
  gender: string;
  createdAt: Date;
  images: { url: string }[];
  category: { name: string } | null;
  variants: { stock: number }[];
};

export function toCard(p: CardSource): CardProduct {
  return {
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAt: p.compareAt && p.compareAt > p.price ? p.compareAt : null,
    gender: p.gender,
    image: p.images[0]?.url ?? "/products/p1.jpeg",
    categoryName: p.category?.name,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
    isNew: Date.now() - p.createdAt.getTime() < NEW_DAYS * 24 * 60 * 60 * 1000,
  };
}
