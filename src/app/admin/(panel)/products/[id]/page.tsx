import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { updateProduct, updateStock } from "../actions";

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
    },
  });

  if (!product) notFound();

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/admin/products" className="text-sm text-[#6b6280] hover:underline">
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
            className="rounded-2xl object-cover w-48 h-60 border border-[#e3daf0]"
          />
        )}

        {/* Ürün bilgileri */}
        <form action={updateProduct} className="flex-1 bg-white rounded-2xl border border-[#e3daf0] p-6 space-y-4">
          <input type="hidden" name="id" value={product.id} />
          <h2 className="font-bold">Ürün Bilgileri</h2>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Ürün Adı</label>
            <input
              name="name"
              defaultValue={product.name}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e3daf0] bg-[#f7f4fb] focus:outline-none focus:border-[#7a4fb0]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Açıklama</label>
            <textarea
              name="description"
              defaultValue={product.description}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-[#e3daf0] bg-[#f7f4fb] focus:outline-none focus:border-[#7a4fb0]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Fiyat (₺)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={(product.price / 100).toString()}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e3daf0] bg-[#f7f4fb] focus:outline-none focus:border-[#7a4fb0]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Cinsiyet</label>
              <select
                name="gender"
                defaultValue={product.gender}
                className="w-full px-4 py-2.5 rounded-xl border border-[#e3daf0] bg-[#f7f4fb] focus:outline-none focus:border-[#7a4fb0]"
              >
                <option value="unisex">Unisex</option>
                <option value="kiz">Kız</option>
                <option value="erkek">Erkek</option>
              </select>
            </div>
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
          <button className="px-6 py-2.5 rounded-full bg-[#5a2e86] text-white font-semibold hover:bg-[#7a4fb0] transition">
            Kaydet
          </button>
        </form>
      </div>

      {/* Stok yönetimi */}
      <div className="bg-white rounded-2xl border border-[#e3daf0] p-6 mt-6">
        <h2 className="font-bold mb-4">📦 Depo / Stok Yönetimi</h2>
        <div className="space-y-2">
          {product.variants.map((v) => (
            <form
              key={v.id}
              action={updateStock}
              className="flex items-center gap-4 py-2 border-b border-[#ece7f5] last:border-0"
            >
              <input type="hidden" name="variantId" value={v.id} />
              <span className="w-24 font-medium">{v.size} Yaş</span>
              <span className="w-32 text-xs text-[#6b6280]">SKU: {v.sku}</span>
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={v.stock}
                className={`w-24 px-3 py-2 rounded-lg border bg-[#f7f4fb] focus:outline-none focus:border-[#7a4fb0] ${
                  v.stock === 0
                    ? "border-red-300"
                    : v.stock <= v.lowStockAt
                    ? "border-amber-300"
                    : "border-[#e3daf0]"
                }`}
              />
              <span className="text-xs text-[#6b6280]">adet</span>
              {v.stock === 0 ? (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">tükendi</span>
              ) : v.stock <= v.lowStockAt ? (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">kritik</span>
              ) : null}
              <button className="ml-auto px-4 py-1.5 rounded-full bg-[#ece7f5] text-[#5a2e86] text-sm font-semibold hover:bg-[#5a2e86] hover:text-white transition">
                Güncelle
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
