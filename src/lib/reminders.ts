import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { abandonedCartEmail } from "./email-templates";

type CartItem = { name: string; size: string; qty: number; price: number };

/** Terk edilen sepetlere hatırlatma e-postası gönderir. Kaç tane gönderildiğini döner. */
export async function runAbandonedReminders(olderThanMinutes = 60): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
  const carts = await prisma.abandonedCart.findMany({
    where: { reminded: false, recovered: false, updatedAt: { lte: cutoff } },
  });

  let sent = 0;
  for (const c of carts) {
    let items: CartItem[] = [];
    try {
      items = JSON.parse(c.cartData);
    } catch {
      continue;
    }
    if (!items.length) continue;

    const mail = abandonedCartEmail({ name: c.name, items, total: c.total });
    await sendEmail({ to: c.email, subject: mail.subject, html: mail.html, type: "abandoned_cart" });
    await prisma.abandonedCart.update({
      where: { id: c.id },
      data: { reminded: true, remindedAt: new Date() },
    });
    sent++;
  }
  return sent;
}
