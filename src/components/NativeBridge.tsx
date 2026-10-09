"use client";

import { useEffect } from "react";
import { useCart } from "./CartContext";

type BackEvent = { canGoBack: boolean };
type AppPlugin = {
  addListener: (e: "backButton", cb: (ev: BackEvent) => void) => Promise<{ remove: () => void }>;
  exitApp: () => void;
};
type CapacitorGlobal = { isNativePlatform?: () => boolean; Plugins?: { App?: AppPlugin } };

/**
 * Yalnızca mobil uygulamada (Capacitor) çalışır; web'de hiçbir şey yapmaz.
 * Android geri tuşu: sepet açıksa kapatır → geçmiş varsa geri gider → yoksa uygulamadan çıkar.
 */
export default function NativeBridge() {
  const { isOpen, setOpen } = useCart();

  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
    const app = cap?.isNativePlatform?.() ? cap.Plugins?.App : undefined;
    if (!app) return;

    let handle: { remove: () => void } | undefined;
    let cancelled = false;
    app
      .addListener("backButton", ({ canGoBack }) => {
        if (isOpen) setOpen(false);
        else if (canGoBack) window.history.back();
        else app.exitApp();
      })
      .then((h) => (cancelled ? h.remove() : (handle = h)));
    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, [isOpen, setOpen]);

  return null;
}
