import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrieveCheckoutResult } from "@/lib/iyzico";
import { finalizeOrder, cancelOrder, reReserveCancelledOrder, alertAdmin } from "@/lib/orders";

export const dynamic = "force-dynamic";

// iyzico ödeme sonrası buraya token ile POST eder.
export async function POST(request: Request) {
  const fail = () => NextResponse.redirect(new URL("/odeme?error=payment", request.url), 303);

  const form = await request.formData();
  const token = String(form.get("token") || "");
  if (!token) return fail();

  try {
    // Sonucu her zaman iyzico'dan sunucu tarafında sorgula (gelen form verisine güvenme)
    const res = await retrieveCheckoutResult(token);
    const orderNo = res.orderNo;
    if (!orderNo) return fail();
    const order = await prisma.order.findUnique({ where: { orderNo } });
    if (!order) return fail();

    const success = () =>
      NextResponse.redirect(new URL(`/siparis/${order.orderNo}?t=${order.accessToken}`, request.url), 303);

    if (!res.paid) {
      await cancelOrder(orderNo); // stok + kupon iadesi (yalnızca PENDING ise)
      return fail();
    }

    // Tutar ve sipariş doğrulaması — taksit farkı nedeniyle ödenen tutar fazla olabilir, eksik olamaz
    const paidKurus = Math.round(parseFloat(String(res.raw?.paidPrice ?? "0")) * 100);
    const conversationOk = !res.raw?.conversationId || res.raw.conversationId === orderNo;
    if (paidKurus < order.total - 1 || !conversationOk) {
      await prisma.order.update({ where: { orderNo }, data: { paymentStatus: "review" } });
      await alertAdmin(
        `Ödeme tutarsızlığı: ${orderNo}`,
        `Sipariş tutarı ${(order.total / 100).toFixed(2)} TL, iyzico'dan gelen ${(paidKurus / 100).toFixed(2)} TL. Sipariş kontrol için bekletildi.`
      );
      return fail();
    }

    // İdempotent: yalnızca PENDING → PAID geçişini yapan istek e-posta/CAPI tetikler
    const moved = await prisma.order.updateMany({
      where: { orderNo, status: "PENDING" },
      data: { status: "PAID", paymentStatus: "paid" },
    });
    if (moved.count === 1) {
      await finalizeOrder(orderNo);
      return success();
    }

    if (order.status === "CANCELLED") {
      // Süre aşımıyla iptal edildikten sonra ödeme geldi → stoğu yeniden ayırmayı dene
      if (await reReserveCancelledOrder(orderNo)) {
        await finalizeOrder(orderNo);
      } else {
        await prisma.order.update({ where: { orderNo }, data: { paymentStatus: "paid" } });
        await alertAdmin(
          `İptal edilmiş siparişe ödeme geldi: ${orderNo}`,
          "Stok artık yetersiz. Müşteriyle iletişime geçip iade veya tedarik planla."
        );
      }
    }
    // Zaten PAID ise (iyzico bildirimi tekrarlandı) sadece yönlendir
    return success();
  } catch (e) {
    console.error("iyzico sonuç hatası", e);
    return fail();
  }
}

// Kullanıcı yanlışlıkla GET ile gelirse ana sayfaya al.
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/", request.url), 303);
}
