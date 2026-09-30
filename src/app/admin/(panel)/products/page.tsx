import { prisma } from "@/lib/prisma";
import { formatTL } from "@/lib/money";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: true,
      category: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ürünler & Stok</h1>
          <p className="text-[#6b5c51]">{products.length} ürün</p>
        </div>
        <Link
          href="/admin/ice-aktar"
          className="px-5 py-2.5 rounded-full bg-[#5c4230] text-white text-sm font-semibold hover:bg-[#7a5a42] transition"
        >
          ⬆ Toplu İçe Aktar
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#e6dccd] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#faf7f1] text-[#6b5c51] text-left">
            <tr>
              <th className="p-4 font-semibold">Ürün</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold">Fiyat</th>
              <th className="p-4 font-semibold">Toplam Stok</th>
              <th className="p-4 font-semibold">Durum</th>
              <th className="p-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0e9dd]">
            {products.map((p) => {
              const total = p.variants.reduce((s, v) => s + v.stock, 0);
              const low = p.variants.some((v) => v.stock <= 3);
              const out = total === 0;
              return (
                <tr key={p.id} className="hover:bg-[#faf7f1] transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.images[0] && (
                        <Image
                          src={p.images[0].url}
                          alt={p.name}
                          width={44}
                          height={56}
                          className="rounded-lg object-cover w-11 h-14"
                        />
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#6b5c51]">{p.category?.name ?? "—"}</td>
                  <td className="p-4 font-semibold">{formatTL(p.price)}</td>
                  <td className="p-4">
                    <span
                      className={`font-bold ${
                        out ? "text-red-600" : low ? "text-amber-600" : "text-[#3f8f6b]"
                      }`}
                    >
                      {total} adet
                    </span>
                    {low && !out && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        kritik
                      </span>
                    )}
                    {out && (
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        tükendi
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {p.active ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                        Yayında
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full">
                        Pasif
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-[#5c4230] font-semibold hover:underline whitespace-nowrap"
                    >
                      Düzenle →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
