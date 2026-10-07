"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print px-6 py-2.5 rounded-none bg-ink text-white font-semibold hover:bg-ink-2 transition"
    >
      🖨️ Yazdır / PDF Kaydet
    </button>
  );
}
