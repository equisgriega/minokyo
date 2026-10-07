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
    <div className="min-h-screen flex bg-[#fafafa] text-[#111111]">
      {/* Kenar menü */}
      <aside className="w-60 shrink-0 bg-white border-r border-[#e5e5e5] flex flex-col">
        <div className="p-6 border-b border-[#e5e5e5]">
          <div className="text-xl font-extrabold text-[#111111]">minokyo</div>
          <div className="text-xs text-[#6b6b6b]">Yönetim Paneli</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#6b6b6b] hover:bg-[#fafafa] hover:text-[#111111] transition"
            >
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#e5e5e5]">
          <div className="px-4 py-2 text-xs text-[#6b6b6b]">{user.email}</div>
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
