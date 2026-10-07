import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SIZES = ["2", "3", "4", "5", "6"];

type Seed = {
  slug: string;
  name: string;
  description: string;
  price: number; // TL
  gender: string;
  category: string;
  images: string[];
  featured?: boolean;
  stock?: number[]; // beden sırasına göre
};

const CATEGORIES = [
  { name: "Takımlar", slug: "takimlar" },
  { name: "Üst Giyim", slug: "ust-giyim" },
  { name: "Pantolonlar", slug: "pantolonlar" },
];

const PRODUCTS: Seed[] = [
  { slug: "nice-toasty-tost-takim", name: "Nice & Toasty Tost Baskılı Takım", description: "Kadife dokulu, tost baskılı sweatshirt ve dama desenli rahat pantolondan oluşan sıcacık ikili takım. %100 pamuk.", price: 549, gender: "unisex", category: "takimlar", images: ["/products/p1.jpeg"], featured: true, stock: [8, 5, 2, 6, 4] },
  { slug: "papatya-sweatshirt-takim", name: "Papatya Desenli Sweatshirt Takımı", description: "Neşeli çiçek desenli sweatshirt ve yumuşacık kaşkorse taytlı kız çocuk takımı. Gün boyu rahatlık.", price: 499, gender: "kiz", category: "takimlar", images: ["/products/p2.jpeg"], featured: true, stock: [4, 7, 3, 5, 2] },
  { slug: "sponsor-animal-kedi-takim", name: "Sponsor an Animal Kedi Takımı", description: "Sevimli kedi baskılı sweatshirt ve zigzag desenli pantolon. Erkek çocuklar için rahat ve eğlenceli.", price: 529, gender: "erkek", category: "takimlar", images: ["/products/p3.jpeg"], stock: [6, 4, 5, 3, 1] },
  { slug: "cizgili-sweatshirt-dama-kot", name: "Çizgili Sweatshirt & Dama Kot", description: "Pembe-mavi çizgili sweatshirt ve dama desenli kot pantolondan oluşan trend takım.", price: 599, gender: "erkek", category: "takimlar", images: ["/products/p4.jpeg"], featured: true, stock: [3, 5, 6, 2, 4] },
  { slug: "ayicik-nakisli-polo-takim", name: "Ayıcık Nakışlı Polo Takımı", description: "Ayıcık nakışlı çizgili polo yaka sweatshirt ve dama desenli kot. Şık ve rahat.", price: 579, gender: "erkek", category: "takimlar", images: ["/products/p5.jpeg"], stock: [5, 3, 4, 6, 2] },
  { slug: "ponpon-triko-kazak", name: "Ponpon Detaylı Triko Kazak", description: "El örgüsü görünümlü, ponpon detaylı yumuşacık triko kazak. Kız çocuklar için sıcak bir seçim.", price: 459, gender: "kiz", category: "ust-giyim", images: ["/products/p6.jpeg"], stock: [2, 4, 3, 5, 3] },
  { slug: "milk-club-tayt-takim", name: "Milk Club Tayt Takımı", description: "%100 pamuk sweatshirt ve bulut desenli taytlı rahat kombin. Gün boyu konfor, her adımda stil.", price: 479, gender: "kiz", category: "takimlar", images: ["/products/p7.jpeg", "/products/lookbook.jpeg"], featured: true, stock: [7, 6, 4, 3, 5] },
  { slug: "dinozor-kaykay-takim", name: "Dinozor Kaykay Takımı", description: "Dinozor baskılı beyaz sweatshirt ve dama desenli şort. Enerjik erkek çocuklar için.", price: 499, gender: "erkek", category: "takimlar", images: ["/products/p8.jpeg"], stock: [4, 5, 6, 4, 3] },
  { slug: "little-wanderers-club-takim", name: "Little Wanderers Club Takımı", description: "Canlı yeşil sweatshirt ve kareli rahat pantolon. Küçük kaşifler için özgür bir kombin.", price: 529, gender: "kiz", category: "takimlar", images: ["/products/p9.jpeg"], stock: [3, 4, 2, 5, 4] },
  { slug: "aci-biber-cizgili-pantolon", name: "Acı Biber Çizgili Pantolon", description: "Keten karışımı, çizgili ve acı biber desenli geniş kesim pantolon. Yazlık ve nefes alan kumaş.", price: 349, gender: "unisex", category: "pantolonlar", images: ["/products/p10.jpeg"], stock: [6, 5, 4, 3, 2] },
  { slug: "franks-garage-cizim-pantolon", name: "Frank's Garage Çizim Pantolon", description: "El çizimi baskılı, beli lastikli rahat pantolon. Özgün ve sanatsal bir tasarım.", price: 389, gender: "unisex", category: "pantolonlar", images: ["/products/p11.jpeg"], stock: [4, 3, 5, 4, 3] },
  { slug: "zigzag-desenli-pantolon", name: "Zigzag Desenli Pantolon", description: "Yumuşak dokulu, geniş kesim zigzag desenli pantolon. Rahat ve şık günlük parça.", price: 359, gender: "unisex", category: "pantolonlar", images: ["/products/p12.jpeg"], stock: [5, 6, 4, 3, 5] },
];

async function main() {
  console.log("🌱 Tohumlama başlıyor...");

  // Temizle (idempotent seed)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Kategoriler
  const catMap: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.create({ data: c });
    catMap[c.slug] = cat.id;
  }

  // Ürünler + görseller + beden bazlı stok
  let pi = 1;
  for (const p of PRODUCTS) {
    const stock = p.stock ?? [5, 5, 5, 5, 5];
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price * 100, // kuruş
        gender: p.gender,
        featured: p.featured ?? false,
        categoryId: catMap[p.category],
        images: {
          create: p.images.map((url, i) => ({ url, position: i, alt: p.name })),
        },
        variants: {
          create: SIZES.map((size, i) => ({
            size,
            sku: `MNK-${pi}-${size}`,
            stock: stock[i] ?? 5,
            lowStockAt: 3,
          })),
        },
      },
    });
    pi++;
  }

  // Admin kullanıcı
  const adminPass = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@minokyo.com" },
    update: {},
    create: {
      email: "admin@minokyo.com",
      name: "minokyo Yönetici",
      password: adminPass,
      role: "ADMIN",
    },
  });

  console.log("✅ Tohumlama tamam.");
  console.log("   → 12 ürün, 3 kategori, beden bazlı stok");
  console.log("   → Admin: admin@minokyo.com / admin123 (yayında değiştirin!)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
