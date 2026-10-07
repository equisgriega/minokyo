"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

/** Tükenen beden için müşteri e-postasını kaydeder; stok gelince bilgilendirilir. */
export async function requestStockNotify(
  variantId: string,
  email: string
): Promise<{ ok: boolean; message: string }> {
  const e = email.trim().toLowerCase();
  if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    return { ok: false, message: "Geçerli bir e-posta girin." };
  }
  try {
    await prisma.stockNotify.upsert({
      where: { email_variantId: { email: e, variantId } },
      update: { notified: false },
      create: { email: e, variantId },
    });
    return { ok: true, message: "Harika! Stok gelince sana e-posta göndereceğiz." };
  } catch {
    return { ok: false, message: "Bir hata oluştu, tekrar dene." };
  }
}

/** Müşteri yorumu kaydeder. Yönetim panelinden onaylanınca yayınlanır. */
export async function submitReview(
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const productId = String(formData.get("productId") || "");
  const name = String(formData.get("name") || "").trim().slice(0, 60);
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const comment = String(formData.get("comment") || "").trim();
  const size = String(formData.get("size") || "").trim() || null;
  const rating = parseInt(String(formData.get("rating") || "0"), 10);

  if (!name) return { ok: false, message: "Adını yaz." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Geçerli bir e-posta gir." };
  if (!(rating >= 1 && rating <= 5)) return { ok: false, message: "Lütfen 1-5 arası puan ver." };
  if (comment.length < 10) return { ok: false, message: "Yorumun en az 10 karakter olsun." };
  if (comment.length > 1000) return { ok: false, message: "Yorum en fazla 1000 karakter olabilir." };

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } });
  if (!product) return { ok: false, message: "Ürün bulunamadı." };

  // Aynı kişi aynı ürüne bekleyen ikinci yorumu göndermesin
  const pending = await prisma.review.findFirst({ where: { productId, email, approved: false } });
  if (pending) return { ok: false, message: "Bu ürün için onay bekleyen bir yorumun zaten var." };

  await prisma.review.create({ data: { productId, name, email, rating, comment, size } });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    await sendEmail({
      to: adminEmail,
      subject: `Yeni yorum (${rating}/5): ${product.name}`,
      html: `<div style="font-family:Arial,sans-serif;padding:20px;color:#141414">
        <p><strong>${escapeHtml(name)}</strong> · ${"★".repeat(rating)}${"☆".repeat(5 - rating)}</p>
        <p>${escapeHtml(comment)}</p>
        <a href="${appUrl}/admin/yorumlar" style="display:inline-block;margin-top:10px;background:#141414;color:#fff;text-decoration:none;padding:12px 24px;font-weight:600">Onayla / Reddet</a>
      </div>`,
      type: "review",
    }).catch(() => {});
  }

  return { ok: true, message: "Teşekkürler! Yorumun onaylandıktan sonra yayınlanacak." };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
