"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print px-6 py-2.5 rounded-full bg-[#5c4230] text-white font-semibold hover:bg-[#7a5a42] transition"
    >
      🖨️ Yazdır / PDF Kaydet
    </button>
  );
}
