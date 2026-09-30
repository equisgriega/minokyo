"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print px-6 py-2.5 rounded-full bg-[#5a2e86] text-white font-semibold hover:bg-[#7a4fb0] transition"
    >
      🖨️ Yazdır / PDF Kaydet
    </button>
  );
}
