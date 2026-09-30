import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "../actions";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  if (!user) redirect("/admin/login");

  const nav = [
    { href: "/admin", label: "Panel", icon: "📊" },
    { href: "/admin/products", label: "Ürünler & Stok", icon: "👕" },
    { href: "/admin/orders", label: "Siparişler", icon: "📦" },
    { href: "/admin/kuponlar", label: "Kuponlar", icon: "🏷️" },
    { href: "/admin/musteriler", label: "Müşteriler", icon: "👥" },
    { href: "/admin/notifications", label: "Bildirimler", icon: "📬" },
    { href: "/admin/ayarlar", label: "Entegrasyonlar", icon: "⚙️" },
    { href: "/admin/hesap", label: "Hesap", icon: "🔑" },
  ];

  return (
    <div className="min-h-screen flex bg-[#f7f4fb] text-[#2f2545]">
      {/* Kenar menü */}
      <aside className="w-60 shrink-0 bg-white border-r border-[#e3daf0] flex flex-col">
        <div className="p-6 border-b border-[#e3daf0]">
          <div className="text-xl font-extrabold text-[#5a2e86]">minokyo</div>
          <div className="text-xs text-[#6b6280]">Yönetim Paneli</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6b6280] hover:bg-[#f7f4fb] hover:text-[#5a2e86] transition"
            >
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#e3daf0]">
          <div className="px-4 py-2 text-xs text-[#6b6280]">{user.email}</div>
          <form action={logout}>
            <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50 transition">
              ↩ Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      {/* İçerik */}
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
