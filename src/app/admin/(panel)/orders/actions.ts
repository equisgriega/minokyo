"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { shippingEmail } from "@/lib/email-templates";
import { carrierName, trackingUrl } from "@/lib/carriers";
import { isShippingApiConfigured, createShipment } from "@/lib/shipping";
import { isParasutConfigured, createEArsivInvoice } from "@/lib/parasut";
import { revalidatePath } from "next/cache";
import { cancelOrder } from "@/lib/orders";

async function sendShippingMail(orderNo: string) {
  const o = await prisma.order.findUnique({ where: { orderNo } });
  if (!o) return;
  const mail = shippingEmail({
    orderNo: o.orderNo,
    accessToken: o.accessToken,
    fullName: o.fullName,
    carrierName: carrierName(o.carrier),
    trackingNo: o.trackingNo,
    trackingUrl: trackingUrl(o.carrier, o.trackingNo),
  });
  await sendEmail({ to: o.email, subject: mail.subject, html: mail.html, type: "shipping" });
}

/** Kargo firması + takip no kaydeder; "Kargoya Ver" ise durumu SHIPPED yapıp e-posta gönderir. */
export async function updateShipping(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  const orderId = String(formData.get("orderId"));
  const carrier = String(formData.get("carrier") || "") || null;
  const trackingNo = String(formData.get("trackingNo") || "").trim() || null;
  const ship = formData.get("ship") === "1"; // "Kaydet & Kargoya Ver" butonu

  const current = await prisma.order.findUnique({ where: { id: orderId } });
  if (!current) throw new Error("Sipariş bulunamadı");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      carrier,
      trackingNo,
      ...(ship ? { status: "SHIPPED" as const } : {}),
    },
  });

  if (ship) {
    await sendShippingMail(current.orderNo);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/** Kargo API ile otomatik gönderi oluşturur (etiket + takip), durumu SHIPPED yapar, e-posta yollar. */
export async function createAutoShipment(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  if (!isShippingApiConfigured()) throw new Error("Kargo API yapılandırılmamış");
  const orderId = String(formData.get("orderId"));
  const o = await prisma.order.findUnique({ where: { id: orderId } });
  if (!o) throw new Error("Sipariş bulunamadı");

  const shipment = await createShipment({
    orderNo: o.orderNo,
    fullName: o.fullName,
    phone: o.phone,
    email: o.email,
    city: o.city,
    district: o.district,
    line: o.line,
  });
  if (!shipment) throw new Error("Kargo oluşturulamadı");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      carrier: shipment.carrier,
      trackingNo: shipment.trackingNo,
      labelUrl: shipment.labelUrl ?? null,
      status: "SHIPPED",
    },
  });
  await sendShippingMail(o.orderNo);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

/** e-fatura'yı manuel (yeniden) keser. */
export async function issueInvoice(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  if (!isParasutConfigured()) throw new Error("Paraşüt yapılandırılmamış");
  const orderId = String(formData.get("orderId"));
  const o = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!o) throw new Error("Sipariş bulunamadı");

  const inv = await createEArsivInvoice({
    orderNo: o.orderNo,
    email: o.email,
    fullName: o.fullName,
    lines: o.items.map((i) => ({ name: `${i.name} (${i.size} Yaş)`, qty: i.qty, price: i.price })),
    shipping: o.shipping,
  });
  await prisma.order.update({
    where: { id: orderId },
    data: inv.ok
      ? { invoiceStatus: "issued", invoiceId: inv.invoiceId, invoiceUrl: inv.url ?? null }
      : { invoiceStatus: "failed" },
  });
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderStatus(formData: FormData) {
  if (!(await requireAdmin())) throw new Error("Yetkisiz");
  const orderId = String(formData.get("orderId"));
  const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
  const raw = String(formData.get("status"));
  if (!(STATUSES as readonly string[]).includes(raw)) throw new Error("Geçersiz durum");
  const status = raw as (typeof STATUSES)[number];

  const current = await prisma.order.findUnique({ where: { id: orderId } });
  if (!current) throw new Error("Sipariş bulunamadı");

  // İptal: henüz kargolanmamışsa stok ve kupon iade edilir
  if (status === "CANCELLED" && (current.status === "PENDING" || current.status === "PAID")) {
    await cancelOrder(current.orderNo, ["PENDING", "PAID"]);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/products");
    return;
  }

  const paymentStatus =
    status === "PAID" || status === "SHIPPED" || status === "DELIVERED"
      ? "paid"
      : current.paymentStatus;

  await prisma.order.update({ where: { id: orderId }, data: { status, paymentStatus } });

  // Kargoya yeni geçtiyse müşteriye bilgilendirme (varsa takip linkiyle)
  if (status === "SHIPPED" && current.status !== "SHIPPED") {
    await sendShippingMail(current.orderNo);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}
