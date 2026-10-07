// Sipariş yaşam döngüsü — SADECE sunucu tarafı. ("use server" DEĞİL: buradaki
// fonksiyonlar tarayıcıdan çağrılabilen herkese açık uç nokta olmamalı.)
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { orderConfirmationEmail, newOrderAdminEmail } from "./email-templates";
import { capiPurchase } from "./capi";
import { isParasutConfigured, createEArsivInvoice } from "./parasut";
import { escapeHtml } from "./html";

/** iyzico ödeme sayfasında bu kadar dakika ödenmeyen sipariş iptal edilir, stok geri döner. */
export const PAYMENT_TIMEOUT_MIN = 30;

/** Onay e-postası + yönetici bildirimi + dönüşüm (CAPI) + e-fatura. */
export async function finalizeOrder(orderNo: string) {
  const order = await prisma.order.findUnique({ where: { orderNo }, include: { items: true } });
  if (!order) return;

  const items = order.items.map((i) => ({ name: i.name, size: i.size, qty: i.qty, price: i.price }));
  const mail = orderConfirmationEmail({
    orderNo: order.orderNo,
    accessToken: order.accessToken,
    fullName: order.fullName,
    items,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    paymentMethod: order.paymentMethod,
  });
  await sendEmail({ to: order.email, subject: mail.subject, html: mail.html, type: "order_confirmation" });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const am = newOrderAdminEmail({
      orderNo: order.orderNo,
      fullName: order.fullName,
      phone: order.phone,
      city: order.city,
      items,
      total: order.total,
      paymentMethod: order.paymentMethod,
    });
    await sendEmail({ to: adminEmail, subject: am.subject, html: am.html, type: "order_confirmation" });
  }

  let ip: string | undefined;
  let ua: string | undefined;
  try {
    const h = await headers();
    ip = (h.get("x-forwarded-for") || "").split(",")[0] || undefined;
    ua = h.get("user-agent") || undefined;
  } catch {}

  await capiPurchase({
    orderNo: order.orderNo,
    email: order.email,
    phone: order.phone,
    value: order.total,
    contents: order.items.map((i) => ({ id: i.productId ?? i.id, quantity: i.qty, item_price: i.price / 100 })),
    clientIp: ip,
    clientUserAgent: ua,
  });

  if (isParasutConfigured() && order.invoiceStatus !== "issued") {
    const inv = await createEArsivInvoice({
      orderNo: order.orderNo,
      email: order.email,
      fullName: order.fullName,
      lines: order.items.map((i) => ({ name: `${i.name} (${i.size} Yaş)`, qty: i.qty, price: i.price })),
      shipping: order.shipping,
    });
    await prisma.order.update({
      where: { orderNo: order.orderNo },
      data: inv.ok
        ? { invoiceStatus: "issued", invoiceId: inv.invoiceId, invoiceUrl: inv.url ?? null }
        : { invoiceStatus: "failed" },
    });
  }
}

/**
 * Siparişi iptal eder; stoğu ve kupon kullanımını iade eder.
 * Durum geçişi atomik olduğu için iki kez çağrılsa da iade bir kez yapılır.
 * @param from İptale izin verilen mevcut durumlar (varsayılan: yalnızca PENDING)
 */
export async function cancelOrder(
  orderNo: string,
  from: ("PENDING" | "PAID")[] = ["PENDING"]
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const moved = await tx.order.updateMany({
      where: { orderNo, status: { in: from } },
      data: { status: "CANCELLED" },
    });
    if (moved.count === 0) return false; // zaten iptal/kargolanmış

    const order = await tx.order.findUnique({ where: { orderNo }, include: { items: true } });
    if (!order) return false;
    for (const it of order.items) {
      if (it.variantId) {
        await tx.variant.update({ where: { id: it.variantId }, data: { stock: { increment: it.qty } } });
      }
    }
    if (order.couponCode) {
      await tx.coupon.updateMany({
        where: { code: order.couponCode, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
      });
    }
    return true;
  });
}

/**
 * İptal edilmiş bir siparişin stoğunu yeniden ayırmayı dener (süre aşımıyla iptal
 * edildikten sonra ödemesi gelen sipariş). Stok yetmezse hiçbir şey değişmez.
 */
export async function reReserveCancelledOrder(orderNo: string): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { orderNo }, include: { items: true } });
      if (!order || order.status !== "CANCELLED") throw new Error("durum");
      for (const it of order.items) {
        if (!it.variantId) continue;
        const r = await tx.variant.updateMany({
          where: { id: it.variantId, stock: { gte: it.qty } },
          data: { stock: { decrement: it.qty } },
        });
        if (r.count === 0) throw new Error("stok");
      }
      if (order.couponCode) {
        await tx.coupon.updateMany({ where: { code: order.couponCode }, data: { usedCount: { increment: 1 } } });
      }
      await tx.order.update({ where: { orderNo }, data: { status: "PAID", paymentStatus: "paid" } });
    });
    return true;
  } catch {
    return false;
  }
}

/** Ödeme sayfasında terk edilen (süresi geçmiş) kart siparişlerini iptal eder. */
export async function expireStaleOrders(minutes = PAYMENT_TIMEOUT_MIN): Promise<number> {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  const stale = await prisma.order.findMany({
    where: { status: "PENDING", paymentStatus: "awaiting_payment", createdAt: { lt: cutoff } },
    select: { orderNo: true },
    take: 100,
  });
  let n = 0;
  for (const o of stale) if (await cancelOrder(o.orderNo)) n++;
  return n;
}

/** Yöneticiye uyarı e-postası (ödeme tutarsızlığı vb.). */
export async function alertAdmin(subject: string, message: string) {
  const to = process.env.ADMIN_EMAIL;
  if (!to) {
    console.error("[ADMIN UYARI]", subject, message);
    return;
  }
  await sendEmail({
    to,
    subject: `⚠️ ${subject}`,
    html: `<div style="font-family:Arial,sans-serif;padding:20px;color:#141414"><h2>${escapeHtml(subject)}</h2><p>${escapeHtml(message)}</p></div>`,
    type: "order_confirmation",
  }).catch(() => {});
}
