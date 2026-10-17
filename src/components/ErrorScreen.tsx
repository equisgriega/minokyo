"use client";

import { useEffect, useState } from "react";

/** Türkçe hata ekranı: hatayı sunucuya kaydeder, "Ayrıntılar"da mesajı ve tarayıcı sürümünü gösterir. */
export default function ErrorScreen({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.error(error);
    fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `${error.name}: ${error.message}`,
        stack: error.stack,
        digest: error.digest,
        url: window.location.href,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif", color: "#141414", background: "#faf8f5" }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Bir şeyler ters gitti</h1>
        <p style={{ fontSize: 15, color: "#6f6a63", margin: "0 0 24px", lineHeight: 1.5 }}>
          Sayfa yüklenirken bir sorun oluştu. Tekrar dener misin?
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => (retry ? retry() : window.location.reload())}
            style={{ height: 48, padding: "0 24px", background: "#141414", color: "#fff", border: 0, fontWeight: 600, fontSize: 14 }}
          >
            Tekrar Dene
          </button>
          <button
            // Çökme sonrası istemci yönlendiricisi bozuk olabilir → bilinçli olarak tam sayfa yükleme
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            onClick={() => window.location.assign("/")}
            style={{ height: 48, padding: "0 24px", background: "#fff", color: "#141414", border: "1px solid #e4dfd8", fontWeight: 600, fontSize: 14 }}
          >
            Ana Sayfa
          </button>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ marginTop: 28, background: "none", border: 0, padding: 0, color: "#6f6a63", fontSize: 13, textDecoration: "underline" }}
        >
          {open ? "Ayrıntıları gizle" : "Ayrıntılar"}
        </button>
        {open && (
          <pre style={{ marginTop: 10, padding: 12, background: "#efebe5", fontSize: 11, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {`${error.name}: ${error.message}${error.digest ? `\nKod: ${error.digest}` : ""}\n\n${ua}`}
          </pre>
        )}
      </div>
    </div>
  );
}
