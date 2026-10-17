"use client";

import ErrorScreen from "@/components/ErrorScreen";

// Kök layout dahil her şey çökerse: kendi <html>/<body>'sini tanımlamak zorunda
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0 }}>
        <ErrorScreen error={error} retry={retry} />
      </body>
    </html>
  );
}
