import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { retrieveCheckoutResult } from "@/lib/iyzico";
import { finalizeOrder } from "../actions";

export const dynamic = "force-dynamic";

// iyzico ödeme sonrası buraya token ile POST eder.
export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") || "");
  const home = new URL("/", request.url);

  if (!token) return NextResponse.redirect(new URL("/odeme?error=payment", request.url), 303);

  try {
    const res = await retrieveCheckoutResult(token);
    const orderNo = res.orderNo;
    if (!orderNo) return NextResponse.redirect(new URL("/odeme?error=payment", request.url), 303);

    if (res.paid) {
      await prisma.order.update({
        where: { orderNo },
        data: { status: "PAID", paymentStatus: "paid" },
      });
      await finalizeOrder(orderNo); // onay e-postası + CAPI Purchase
      return NextResponse.redirect(new URL(`/siparis/${orderNo}`, request.url), 303);
    }

    // Ödeme başarısız → rezerve stoğu geri ver, siparişi iptal et
    const order = await prisma.order.findUnique({ where: { orderNo }, include: { items: true } });
    if (order && order.status === "PENDING") {
      await prisma.$transaction(async (tx) => {
        for (const it of order.items) {
          if (it.variantId) {
            await tx.variant.update({ where: { id: it.variantId }, data: { stock: { increment: it.qty } } });
          }
        }
        await tx.order.update({ where: { orderNo }, data: { status: "CANCELLED" } });
      });
    }
    return NextResponse.redirect(new URL("/odeme?error=payment", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/odeme?error=payment", home), 303);
  }
}

// Kullanıcı yanlışlıkla GET ile gelirse ana sayfaya al.
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/", request.url), 303);
}
