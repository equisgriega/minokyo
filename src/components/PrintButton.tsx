"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print px-6 py-2.5 rounded-none bg-[#111111] text-white font-semibold hover:bg-[#444444] transition"
    >
      🖨️ Yazdır / PDF Kaydet
    </button>
  );
}
