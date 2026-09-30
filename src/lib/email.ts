import { prisma } from "./prisma";

const FROM = process.env.EMAIL_FROM || "minokyo <onboarding@resend.dev>";

type SendOpts = {
  to: string;
  subject: string;
  html: string;
  type: "order_confirmation" | "shipping" | "abandoned_cart";
};

/**
 * E-posta gönderir. RESEND_API_KEY tanımlıysa gerçekten gönderir,
 * tanımlı değilse "demo" modunda çalışır (sadece veritabanına kaydeder).
 * Her durumda EmailLog'a yazılır, böylece panelden görülebilir.
 */
export async function sendEmail(opts: SendOpts): Promise<string> {
  const key = process.env.RESEND_API_KEY;
  let status: "sent" | "demo" | "failed" = "demo";

  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM,
          to: opts.to,
          subject: opts.subject,
          html: opts.html,
        }),
      });
      status = res.ok ? "sent" : "failed";
    } catch {
      status = "failed";
    }
  } else {
    console.log(`[E-POSTA DEMO] → ${opts.to} | ${opts.subject}`);
  }

  try {
    await prisma.emailLog.create({
      data: {
        to: opts.to,
        subject: opts.subject,
        body: opts.html,
        type: opts.type,
        status,
      },
    });
  } catch {}

  return status;
}
