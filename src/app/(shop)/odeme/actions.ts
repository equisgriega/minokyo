"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail, newOrderAdminEmail } from "@/lib/email-templates";
import { isIyzicoConfigured, createCheckoutForm } from "@/lib/iyzico";
import { capiPurchase } from "@/lib/capi";
import { evaluateCoupon } from "@/lib/coupon";
import { isParasutConfigured, createEArsivInvoice } from "@/lib/parasut";
import { FREE_SHIP_LIMIT, SHIP_COST } from "@/lib/money";
import { headers } from "next/headers";

/** Checkout'ta kupon önizlemesi (indirim tutarını gösterir). */
export async function validateCoupon(code: string, subtotal: number) {
  return evaluateCoupon(code, subtotal);
}


type InItem = { variantId: string; qty: number };
type Payload = {
  items: InItem[];
  customer: {
    email: string;
    phone: string;
    fullName: string;
    line: string;
    city: string;
    district: string;
    zip?: string;
    note?: string;
  };
  paymentMethod: string;
  couponCode?: string;
};

type Result =
  | { ok: true; orderNo: string; paymentUrl?: string }
  | { ok: false; error: string };

/** Bir siparişin onay e-postasını gönderir + dönüşüm olayını (CAPI) yollar. */
export async function finalizeOrder(orderNo: string) {
  const order = await prisma.order.findUnique({ where: { orderNo }, include: { items: true } });
  if (!order) return;

  const mail = orderConfirmationEmail({
    orderNo: order.orderNo,
    fullName: order.fullName,
    items: order.items.map((i) => ({ name: i.name, size: i.size, qty: i.qty, price: i.price })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
  });
  await sendEmail({ to: order.email, subject: mail.subject, html: mail.html, type: "order_confirmation" });

  // Mağaza sahibine yeni sipariş bildirimi
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const am = newOrderAdminEmail({
      orderNo: order.orderNo,
      fullName: order.fullName,
      phone: order.phone,
      city: order.city,
      items: order.items.map((i) => ({ name: i.name, size: i.size, qty: i.qty, price: i.price })),
      total: order.total,
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
    contents: order.items.map((i) => ({
      id: i.productId ?? i.id,
      quantity: i.qty,
      item_price: i.price / 100,
    })),
    clientIp: ip,
    clientUserAgent: ua,
  });

  // e-fatura (Paraşüt) — yapılandırılmışsa
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

export async function placeOrder(payload: Payload): Promise<Result> {
  const { items, customer, paymentMethod } = payload;
  if (!items?.length) return { ok: false, error: "Sepetiniz boş." };

  // Basit doğrulama
  const req = [customer.email, customer.phone, customer.fullName, customer.line, customer.city, customer.district];
  if (req.some((v) => !v || !String(v).trim())) {
    return { ok: false, error: "Lütfen zorunlu alanları doldurun." };
  }

  const session = await getSession();

  try {
    const orderNo = await prisma.$transaction(async (tx) => {
      const variants = await tx.variant.findMany({
        where: { id: { in: items.map((i) => i.variantId) } },
        include: { product: true },
      });
      const vmap = new Map(variants.map((v) => [v.id, v]));

      let subtotal = 0;
      const orderItems = items.map((it) => {
        const v = vmap.get(it.variantId);
        if (!v) throw new Error("Bir ürün artık mevcut değil. Sepetinizi yenileyin.");
        if (it.qty < 1) throw new Error("Geçersiz adet.");
        if (v.stock < it.qty)
          throw new Error(`${v.product.name} (${v.size} Yaş) için stok yetersiz (kalan: ${v.stock}).`);
        subtotal += v.product.price * it.qty;
        return {
          productId: v.productId,
          variantId: v.id,
          name: v.product.name,
          size: v.size,
          price: v.product.price,
          qty: it.qty,
        };
      });

      // Kupon (varsa) — sunucu tarafında yeniden doğrula
      let discount = 0;
      let appliedCoupon: string | null = null;
      if (payload.couponCode) {
        const code = payload.couponCode.trim().toUpperCase();
        const c = await tx.coupon.findUnique({ where: { code } });
        const valid =
          c &&
          c.active &&
          (!c.expiresAt || c.expiresAt >= new Date()) &&
          (c.usageLimit == null || c.usedCount < c.usageLimit) &&
          subtotal >= c.minSubtotal;
        if (valid) {
          discount =
            c!.type === "percent"
              ? Math.round((subtotal * c!.value) / 100)
              : Math.min(c!.value, subtotal);
          appliedCoupon = c!.code;
          await tx.coupon.update({ where: { id: c!.id }, data: { usedCount: { increment: 1 } } });
        }
      }

      const shipping = subtotal >= FREE_SHIP_LIMIT ? 0 : SHIP_COST;
      const total = Math.max(0, subtotal - discount) + shipping;
      const no = "MNK" + Date.now().toString().slice(-8);

      await tx.order.create({
        data: {
          orderNo: no,
          userId: session?.id ?? null,
          email: customer.email.trim(),
          phone: customer.phone.trim(),
          fullName: customer.fullName.trim(),
          line: customer.line.trim(),
          city: customer.city.trim(),
          district: customer.district.trim(),
          zip: customer.zip?.trim() || null,
          note: customer.note?.trim() || null,
          paymentMethod,
          status: "PENDING",
          paymentStatus: "unpaid",
          subtotal,
          discount,
          couponCode: appliedCoupon,
          shipping,
          total,
          items: { create: orderItems },
        },
      });

      // Stok düşümü
      for (const it of items) {
        await tx.variant.update({
          where: { id: it.variantId },
          data: { stock: { decrement: it.qty } },
        });
      }

      return no;
    });

    // Terk edilmiş sepeti "kurtarıldı" işaretle
    await prisma.abandonedCart
      .updateMany({ where: { email: customer.email.trim().toLowerCase() }, data: { recovered: true } })
      .catch(() => {});

    // ---- Ödeme: iyzico yapılandırıldıysa ödeme sayfasına yönlendir ----
    if (isIyzicoConfigured()) {
      const order = await prisma.order.findUnique({ where: { orderNo }, include: { items: true } });
      if (!order) return { ok: false, error: "Sipariş bulunamadı." };
      let ip: string | undefined;
      try {
        ip = (await headers()).get("x-forwarded-for")?.split(",")[0] || undefined;
      } catch {}
      try {
        const { paymentPageUrl } = await createCheckoutForm({
          orderNo: order.orderNo,
          email: order.email,
          fullName: order.fullName,
          phone: order.phone,
          city: order.city,
          line: order.line,
          subtotal: order.subtotal,
          shipping: order.shipping,
          total: order.total,
          items: order.items.map((i) => ({ id: i.productId ?? i.id, name: i.name, price: i.price, qty: i.qty })),
          ip,
        });
        // Ödeme tamamlanınca finalize edilecek (callback); e-posta/CAPI orada.
        return { ok: true, orderNo, paymentUrl: paymentPageUrl };
      } catch (e) {
        // Ödeme başlatılamadı → rezerve stoğu geri ver, siparişi iptal et
        await prisma.$transaction(async (tx) => {
          for (const it of items) {
            await tx.variant.update({ where: { id: it.variantId }, data: { stock: { increment: it.qty } } });
          }
          await tx.order.update({ where: { orderNo }, data: { status: "CANCELLED" } });
        });
        return { ok: false, error: "Ödeme başlatılamadı: " + (e instanceof Error ? e.message : "bilinmeyen hata") };
      }
    }

    // ---- Demo modu (ödeme anahtarı yok): siparişi hemen tamamla ----
    await finalizeOrder(orderNo);
    return { ok: true, orderNo };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sipariş oluşturulamadı." };
  }
}

/** Terk edilen sepeti kaydeder (checkout sayfasında e-posta + ürün varsa). */
export async function saveAbandonedCart(payload: {
  email: string;
  name?: string;
  items: { name: string; size: string; qty: number; price: number }[];
  total: number;
}) {
  const email = payload.email.trim().toLowerCase();
  if (!email || !payload.items?.length) return;
  try {
    await prisma.abandonedCart.upsert({
      where: { email },
      update: {
        name: payload.name || null,
        cartData: JSON.stringify(payload.items),
        total: payload.total,
        recovered: false,
        reminded: false,
      },
      create: {
        email,
        name: payload.name || null,
        cartData: JSON.stringify(payload.items),
        total: payload.total,
      },
    });
  } catch {}
}
