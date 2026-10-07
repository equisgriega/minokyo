// Kabul edilen ödeme yöntemleri — tek renk (monokrom) rozetler
const box = "h-7 px-2.5 border border-line bg-card grid place-items-center text-muted";

export default function PaymentBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Kabul edilen ödeme yöntemleri">
      <span className={box} title="iyzico ile güvenli ödeme">
        <span className="text-[11px] font-bold tracking-tight">iyzico</span>
      </span>
      <span className={box} title="Visa">
        <span className="text-[12px] font-extrabold italic tracking-tight">VISA</span>
      </span>
      <span className={box} title="Mastercard">
        <svg viewBox="0 0 32 20" width="28" height="18" aria-hidden="true">
          <circle cx="12" cy="10" r="7" fill="currentColor" opacity="0.55" />
          <circle cx="20" cy="10" r="7" fill="currentColor" opacity="0.35" />
        </svg>
      </span>
      <span className={box} title="Troy">
        <span className="text-[12px] font-bold tracking-tight">troy</span>
      </span>
      <span className="h-7 px-2.5 border border-line bg-card flex items-center gap-1 text-muted" title="256-bit SSL şifreleme">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        <span className="text-[10px] font-semibold">SSL</span>
      </span>
    </div>
  );
}
