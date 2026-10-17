"use client";

import { useEffect } from "react";
import { useCart } from "./CartContext";

type BackEvent = { canGoBack: boolean };
type Handle = { remove: () => void | Promise<void> };
type AppPlugin = {
  // Uygulamaya enjekte edilen köprü (native-bridge.js) tutamacı DOĞRUDAN döndürür;
  // @capacitor/core ise Promise döndürür. İkisi de desteklenir.
  addListener: (e: "backButton", cb: (ev: BackEvent) => void) => Handle | Promise<Handle>;
  exitApp: () => void;
};
type CapacitorGlobal = { isNativePlatform?: () => boolean; Plugins?: { App?: AppPlugin } };

/**
 * Yalnızca mobil uygulamada (Capacitor) çalışır; web'de hiçbir şey yapmaz.
 * Android geri tuşu: sepet açıksa kapatır → geçmiş varsa geri gider → yoksa uygulamadan çıkar.
 * Köprüde bir sorun olursa mağazayı çökertmez, sessizce devre dışı kalır.
 */
export default function NativeBridge() {
  const { isOpen, setOpen } = useCart();

  useEffect(() => {
    let handle: Handle | undefined;
    let cancelled = false;
    try {
      const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
      const app = cap?.isNativePlatform?.() ? cap.Plugins?.App : undefined;
      if (!app?.addListener) return;

      const result = app.addListener("backButton", ({ canGoBack }) => {
        if (isOpen) setOpen(false);
        else if (canGoBack) window.history.back();
        else app.exitApp();
      });
      Promise.resolve(result)
        .then((h) => {
          if (cancelled) void h?.remove?.();
          else handle = h;
        })
        .catch((e) => console.warn("Geri tuşu köprüsü kurulamadı", e));
    } catch (e) {
      console.warn("Geri tuşu köprüsü kurulamadı", e);
    }
    return () => {
      cancelled = true;
      try {
        void handle?.remove?.();
      } catch {}
    };
  }, [isOpen, setOpen]);

  return null;
}
