import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { updateProduct, updateStock } from "../actions";
import RelatedProductsPicker from "@/components/RelatedProductsPicker";

export const dynamic = "force-dynamic";

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { size: "asc" } },
      category: true,
      relatedFrom: { select: { relatedId: true } },
    },
  });

  if (!product) notFound();

  // Bağlı ürün seçici için diğer tüm ürünler
  const allProducts = await prisma.product.findMany({
    where: { id: { not: id } },
    orderBy: { name: "asc" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      category: true,
    },
  });
  const relatedOptions = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.images[0]?.url,
    categoryName: p.category?.name,
  }));
  const initialRelated = product.relatedFrom.map((r) => r.relatedId);

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/admin/products" className="text-sm text-muted hover:underline">
        ← Ürünlere dön
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{product.name}</h1>

      <div className="flex gap-6 flex-col md:flex-row">
        {product.images[0] && (
          <Image
            src={product.images[0].url}
            alt={product.name}
            width={200}
            height={260}
            className="rounded-2xl object-cover w-48 h-60 border border-line"
          />
        )}

        {/* Ürün bilgileri */}
        <form action={updateProduct} className="flex-1 bg-white rounded-2xl border border-line p-6 space-y-4">
          <input type="hidden" name="id" value={product.id} />
          <h2 className="font-bold">Ürün Bilgileri</h2>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Ürün Adı</label>
            <p className="text-xs text-muted mb-1.5">Tırnak kullanma; örn. <em>Milk Club Tayt Takımı</em> (tırnaklar kaydederken otomatik silinir).</p>
            <input
              name="name"
              defaultValue={product.name}
              className="w-full px-4 py-2.5 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Açıklama</label>
            <textarea
              name="description"
              defaultValue={product.description}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Fiyat (TL)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={(product.price / 100).toString()}
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Cinsiyet</label>
              <select
                name="gender"
                defaultValue={product.gender}
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
              >
                <option value="unisex">Unisex</option>
                <option value="kiz">Kız</option>
                <option value="erkek">Erkek</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">İndirim öncesi fiyat (TL)</label>
              <input
                name="compareAt"
                type="number"
                step="0.01"
                placeholder="Boş = indirim yok"
                defaultValue={product.compareAt ? (product.compareAt / 100).toString() : ""}
                className="w-full px-4 py-2.5 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
              />
              <p className="text-xs text-muted mt-1">Doluysa üstü çizili gösterilir, mor indirim rozeti çıkar.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Kalıp</label>
              <select name="fit" defaultValue={product.fit ?? ""} className="w-full px-4 py-2.5 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2">
                <option value="">Belirtilmedi</option>
                <option value="dar">Dar (bir beden büyük önerilir)</option>
                <option value="normal">Normal (yaşına uygun beden)</option>
                <option value="bol">Bol (rahat kesim)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Kumaş & İçerik</label>
            <textarea
              name="material"
              rows={2}
              defaultValue={product.material ?? ""}
              placeholder="Örn. %100 pamuk, 320 gr kadife dokulu sweatshirt kumaşı"
              className="w-full px-4 py-2.5 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Bakım Talimatı</label>
            <textarea
              name="care"
              rows={2}
              defaultValue={product.care ?? ""}
              placeholder="Örn. 30°C'de ters yüz yıkayın. Kurutma makinesi kullanmayın. Düşük ısıda ütüleyin."
              className="w-full px-4 py-2.5 rounded-xl border border-line bg-subtle focus:outline-none focus:border-ink-2"
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={product.active} />
              Yayında
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked={product.featured} />
              Öne çıkan
            </label>
          </div>
          <button className="px-6 py-2.5 rounded-full bg-ink text-white font-semibold hover:bg-ink-2 transition">
            Kaydet
          </button>
        </form>
      </div>

      {/* Stok yönetimi */}
      <div className="bg-white rounded-2xl border border-line p-6 mt-6">
        <h2 className="font-bold mb-4">📦 Depo / Stok Yönetimi</h2>
        <div className="space-y-2">
          {product.variants.map((v) => (
            <form
              key={v.id}
              action={updateStock}
              className="flex items-center gap-4 py-2 border-b border-line-soft last:border-0"
            >
              <input type="hidden" name="variantId" value={v.id} />
              <span className="w-24 font-medium">{v.size} Yaş</span>
              <span className="w-32 text-xs text-muted">SKU: {v.sku}</span>
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={v.stock}
                className={`w-24 px-3 py-2 rounded-lg border bg-subtle focus:outline-none focus:border-ink-2 ${
                  v.stock === 0
                    ? "border-red-300"
                    : v.stock <= v.lowStockAt
                    ? "border-amber-300"
                    : "border-line"
                }`}
              />
              <span className="text-xs text-muted">adet</span>
              {v.stock === 0 ? (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">tükendi</span>
              ) : v.stock <= v.lowStockAt ? (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">kritik</span>
              ) : null}
              <button className="ml-auto px-4 py-1.5 rounded-full bg-line-soft text-ink text-sm font-semibold hover:bg-ink hover:text-white transition">
                Güncelle
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Bağlı ürünler — Kombini tamamla */}
      <RelatedProductsPicker
        productId={product.id}
        options={relatedOptions}
        initialSelected={initialRelated}
      />
    </div>
  );
}
