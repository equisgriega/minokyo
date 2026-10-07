"use server";

import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isIyzicoConfigured, createCheckoutForm } from "@/lib/iyzico";
import { evaluateCoupon } from "@/lib/coupon";
import { calcDiscount, calcTotals } from "@/lib/pricing";
import { orderSchema, cartSchema, mergeItems } from "@/lib/order-schema";
import { rateLimitIp, getClientIp } from "@/lib/security";
import { finalizeOrder, cancelOrder, expireStaleOrders } from "@/lib/orders";

/** Checkout'ta kupon önizlemesi (indirim tutarını gösterir). */
export async function validateCoupon(code: string, subtotal: number) {
  if (!(await rateLimitIp("coupon", 30, 600))) return { ok: false as const, error: "Çok fazla deneme. Biraz sonra tekrar dene." };
  return evaluateCoupon(String(code ?? "").slice(0, 30), Math.max(0, Math.floor(Number(subtotal) || 0)));
}

/** Kartla ödeme yalnızca iyzico bağlıysa (veya test için DEMO_PAYMENTS=true ise) açık. */
function cardPaymentAvailable() {
  return isIyzicoConfigured() || process.env.DEMO_PAYMENTS === "true";
}

type Result =
  | { ok: true; orderNo: string; token: string; paymentUrl?: string }
  | { ok: false; error: string };

/** Müşteriye gösterilecek, güvenli hata (teknik ayrıntı sızdırmaz). */
class UserError extends Error {}

// Karışabilen karakterler (0/O, 1/I) yok
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newOrderNo() {
  const bytes = crypto.randomBytes(6);
  let s = "MNK";
  for (const b of bytes) s += ALPHABET[b % ALPHABET.length];
  return s;
}

export async function placeOrder(payload: unknown): Promise<Result> {
  // Kötüye kullanım koruması: IP başına 10 dakikada 10 sipariş denemesi
  if (!(await rateLimitIp("order", 10, 600))) {
    return { ok: false, error: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin." };
  }

  const parsed = orderSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Lütfen bilgileri kontrol edin." };
  }
  const { customer, paymentMethod } = parsed.data;
  const couponCode = parsed.data.couponCode?.toUpperCase() || undefined;

  if (paymentMethod === "card" && !cardPaymentAvailable()) {
    return { ok: false, error: "Kartla ödeme henüz aktif değil. Lütfen Havale/EFT veya Kapıda Ödeme seçin." };
  }

  // Aynı beden birden çok satırda gelirse birleştir (stok kontrolünü atlatmayı önler)
  const items = mergeItems(parsed.data.items);
  if (items.some((i) => i.qty > 20)) return { ok: false, error: "Bir üründen en fazla 20 adet sipariş verilebilir." };

  // Ödeme sayfasında terk edilmiş eski siparişlerin stoğunu serbest bırak (cron'u beklemeden)
  await expireStaleOrders().catch(() => {});

  const session = await getSession();
  const useIyzico = paymentMethod === "card" && isIyzicoConfigured();

  let created: { orderNo: string; token: string } | null = null;
  for (let attempt = 0; attempt < 5 && !created; attempt++) {
    try {
      created = await prisma.$transaction(async (tx) => {
        const variants = await tx.variant.findMany({
          where: { id: { in: items.map((i) => i.variantId) } },
          include: { product: true },
        });
        const vmap = new Map(variants.map((v) => [v.id, v]));

        let subtotal = 0;
        const orderItems = items.map((it) => {
          const v = vmap.get(it.variantId);
          if (!v || !v.product.active) throw new UserError("Sepetinizdeki bir ürün artık satışta değil. Sepetinizi yenileyin.");
          subtotal += v.product.price * it.qty; // fiyat her zaman veritabanından
          return { productId: v.productId, variantId: v.id, name: v.product.name, size: v.size, price: v.product.price, qty: it.qty };
        });

        // Stok düşümü — "yeterliyse düş" tek adımda: eşzamanlı siparişlerde fazla satış olmaz
        for (const it of items) {
          const r = await tx.variant.updateMany({
            where: { id: it.variantId, stock: { gte: it.qty } },
            data: { stock: { decrement: it.qty } },
          });
          if (r.count === 0) {
            const v = vmap.get(it.variantId)!;
            const fresh = await tx.variant.findUnique({ where: { id: it.variantId }, select: { stock: true } });
            throw new UserError(`${v.product.name} (${v.size} Yaş) için stok yetersiz (kalan: ${Math.max(0, fresh?.stock ?? 0)}).`);
          }
        }

        // Kupon — sunucuda yeniden doğrula, kullanım limitini atomik say
        let discount = 0;
        let appliedCoupon: string | null = null;
        if (couponCode) {
          const c = await tx.coupon.findUnique({ where: { code: couponCode } });
          const valid = c && c.active && (!c.expiresAt || c.expiresAt >= new Date()) && subtotal >= c.minSubtotal;
          if (!valid) throw new UserError("Kupon artık geçerli değil. Kuponu kaldırıp tekrar deneyin.");
          const inc = await tx.coupon.updateMany({
            where:
              c.usageLimit == null
                ? { id: c.id }
                : { id: c.id, usedCount: { lt: prisma.coupon.fields.usageLimit } },
            data: { usedCount: { increment: 1 } },
          });
          if (inc.count === 0) throw new UserError("Kuponun kullanım limiti doldu. Kuponu kaldırıp tekrar deneyin.");
          discount = calcDiscount(c, subtotal);
          appliedCoupon = c.code;
        }

        const { shipping, total } = calcTotals(subtotal, discount);

        const order = await tx.order.create({
          data: {
            orderNo: newOrderNo(),
            userId: session?.id ?? null,
            email: customer.email,
            phone: customer.phone,
            fullName: customer.fullName,
            line: customer.line,
            city: customer.city,
            district: customer.district,
            zip: customer.zip || null,
            note: customer.note || null,
            paymentMethod,
            status: "PENDING",
            // iyzico'ya yönlenen sipariş, ödeme gelmezse süre aşımıyla iptal edilir
            paymentStatus: useIyzico ? "awaiting_payment" : "unpaid",
            subtotal,
            discount,
            couponCode: appliedCoupon,
            shipping,
            total,
            items: { create: orderItems },
          },
          select: { orderNo: true, accessToken: true },
        });
        return { orderNo: order.orderNo, token: order.accessToken };
      });
    } catch (e) {
      if (e instanceof UserError) return { ok: false, error: e.message };
      // Sipariş no çakışması (çok düşük ihtimal) → yeni numarayla tekrar dene
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      console.error("placeOrder hatası", e);
      return { ok: false, error: "Sipariş oluşturulamadı. Lütfen tekrar deneyin." };
    }
  }
  if (!created) return { ok: false, error: "Sipariş oluşturulamadı. Lütfen tekrar deneyin." };
  const { orderNo, token } = created;

  // Terk edilmiş sepeti "kurtarıldı" işaretle
  await prisma.abandonedCart.updateMany({ where: { email: customer.email }, data: { recovered: true } }).catch(() => {});

  // ---- Kart: iyzico ödeme sayfasına yönlendir ----
  if (useIyzico) {
    const order = await prisma.order.findUnique({ where: { orderNo }, include: { items: true } });
    if (!order) return { ok: false, error: "Sipariş bulunamadı." };
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
        ip: await getClientIp(),
      });
      // Ödeme tamamlanınca /odeme/sonuc onaylar; e-posta/CAPI orada.
      return { ok: true, orderNo, token, paymentUrl: paymentPageUrl };
    } catch (e) {
      console.error("iyzico başlatma hatası", e);
      await cancelOrder(orderNo); // stok + kupon iadesi
      return { ok: false, error: "Ödeme başlatılamadı. Lütfen tekrar deneyin veya başka bir ödeme yöntemi seçin." };
    }
  }

  // ---- Havale/EFT, kapıda ödeme (veya test modunda kart): siparişi hemen onayla ----
  await finalizeOrder(orderNo);
  return { ok: true, orderNo, token };
}

/**
 * Terk edilen sepeti kaydeder. Ürün adı/fiyat tarayıcıdan ALINMAZ — sunucuda
 * veritabanından kurulur (aksi halde markamızla keyfi içerikli e-posta gönderilebilirdi).
 */
export async function saveAbandonedCart(payload: unknown) {
  const parsed = cartSchema.safeParse(payload);
  if (!parsed.success) return;
  if (!(await rateLimitIp("cart", 20, 3600))) return;
  const { email, name, items } = parsed.data;
  try {
    const variants = await prisma.variant.findMany({
      where: { id: { in: items.map((i) => i.variantId) }, product: { active: true } },
      include: { product: { select: { name: true, price: true } } },
    });
    const vmap = new Map(variants.map((v) => [v.id, v]));
    const lines = items
      .filter((i) => vmap.has(i.variantId))
      .map((i) => {
        const v = vmap.get(i.variantId)!;
        return { name: v.product.name, size: v.size, qty: i.qty, price: v.product.price };
      });
    if (!lines.length) return;
    const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const data = { name: name || null, cartData: JSON.stringify(lines), total, recovered: false, reminded: false };
    await prisma.abandonedCart.upsert({ where: { email }, update: data, create: { email, ...data } });
  } catch (e) {
    console.error("saveAbandonedCart hatası", e);
  }
}
