// iyzico Checkout Form entegrasyonu.
// Anahtarlar yoksa isConfigured() = false → ödeme "demo modu"nda kalır.
/* eslint-disable @typescript-eslint/no-explicit-any */
import Iyzipay from "iyzipay";

const API_KEY = process.env.IYZICO_API_KEY;
const SECRET_KEY = process.env.IYZICO_SECRET_KEY;
const URI = process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";
const BASE = process.env.APP_URL || "http://localhost:3000";

export function isIyzicoConfigured(): boolean {
  return Boolean(API_KEY && SECRET_KEY);
}

function client() {
  return new Iyzipay({ apiKey: API_KEY, secretKey: SECRET_KEY, uri: URI });
}

const kr = (kurus: number) => (kurus / 100).toFixed(2); // "548.90"

type Line = { id: string; name: string; price: number; qty: number };
type OrderInput = {
  orderNo: string;
  email: string;
  fullName: string;
  phone: string;
  city: string;
  line: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: Line[];
  ip?: string;
};

/** Ödeme formu başlatır, ödeme sayfası URL'ini döner. */
export function createCheckoutForm(o: OrderInput): Promise<{ paymentPageUrl: string; token: string }> {
  const iyzipay = client();
  const [name, ...rest] = o.fullName.trim().split(" ");
  const surname = rest.join(" ") || name;

  const basketItems = o.items.map((it) => ({
    id: it.id,
    name: it.name,
    category1: "Çocuk Giyim",
    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
    price: kr(it.price * it.qty),
  }));
  if (o.shipping > 0) {
    basketItems.push({
      id: "shipping",
      name: "Kargo",
      category1: "Kargo",
      itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
      price: kr(o.shipping),
    });
  }

  const address = {
    contactName: o.fullName,
    city: o.city || "İstanbul",
    country: "Turkey",
    address: o.line,
  };

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: o.orderNo,
    price: kr(o.subtotal + o.shipping),
    paidPrice: kr(o.total),
    currency: Iyzipay.CURRENCY.TRY,
    basketId: o.orderNo,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: `${BASE}/odeme/sonuc`,
    enabledInstallments: [1, 2, 3, 6],
    buyer: {
      id: o.email,
      name,
      surname,
      gsmNumber: o.phone || "+905000000000",
      email: o.email,
      identityNumber: "11111111111",
      registrationAddress: o.line,
      ip: o.ip || "85.34.78.112",
      city: o.city || "İstanbul",
      country: "Turkey",
    },
    shippingAddress: address,
    billingAddress: address,
    basketItems,
  };

  return new Promise((resolve, reject) => {
    iyzipay.checkoutFormInitialize.create(request, (err: unknown, result: any) => {
      if (err) return reject(err);
      if (result.status !== "success") return reject(new Error(result.errorMessage || "iyzico başlatılamadı"));
      resolve({ paymentPageUrl: result.paymentPageUrl, token: result.token });
    });
  });
}

/** Ödeme sonucunu token ile doğrular. */
export function retrieveCheckoutResult(token: string): Promise<{ paid: boolean; orderNo?: string; raw: any }> {
  const iyzipay = client();
  return new Promise((resolve, reject) => {
    iyzipay.checkoutForm.retrieve({ locale: Iyzipay.LOCALE.TR, token }, (err: unknown, result: any) => {
      if (err) return reject(err);
      resolve({
        paid: result.status === "success" && result.paymentStatus === "SUCCESS",
        orderNo: result.basketId,
        raw: result,
      });
    });
  });
}
