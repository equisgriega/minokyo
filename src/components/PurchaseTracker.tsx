"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/track";

/**
 * Sipariş onay sayfasında Purchase olayını bir kez gönderir.
 * event_id = purchase_<orderNo> → sunucu CAPI ile aynı, tekilleştirilir.
 */
export default function PurchaseTracker({
  orderNo,
  value,
  contents,
}: {
  orderNo: string;
  value: number;
  contents: { id: string; quantity: number; item_price: number }[];
}) {
  useEffect(() => {
    const key = `mnk_purchase_${orderNo}`;
    try {
      if (sessionStorage.getItem(key)) return; // aynı sayfada tekrar sayma
      sessionStorage.setItem(key, "1");
    } catch {}
    trackPurchase({ orderNo, value, contents });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
