/** HomeFlow mark: house in a split white/gold circle with gold waves. */
export function LogoMark({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="HomeFlow logo mark">
      {/* split ring: white left half, gold right half */}
      <path d="M32 4 A28 28 0 0 0 32 60" fill="none" stroke="#ffffff" strokeWidth="3" />
      <path d="M32 4 A28 28 0 0 1 32 60" fill="none" stroke="#c68b4a" strokeWidth="3" />
      {/* house */}
      <path d="M32 15 L47 28 H43 V42 H21 V28 H17 Z" fill="#000" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="28" y="30" width="3.5" height="3.5" fill="#ffffff" />
      <rect x="33" y="30" width="3.5" height="3.5" fill="#ffffff" />
      <rect x="28" y="35" width="3.5" height="3.5" fill="#ffffff" />
      <rect x="33" y="35" width="3.5" height="3.5" fill="#ffffff" />
      {/* waves */}
      <path d="M6 48 C16 40 24 54 34 47 C44 40 52 52 60 44" fill="none" stroke="#c68b4a" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 55 C19 49 26 58 35 53 C44 48 51 57 57 51" fill="none" stroke="#c68b4a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <div className="flex items-center gap-3">
      <LogoMark className={big ? "h-16 w-16" : "h-11 w-11 sm:h-12 sm:w-12"} />
      <div className="leading-none">
        <div className={`font-brand font-semibold tracking-[0.3em] ${big ? "text-3xl" : "text-xl sm:text-2xl"}`}>
          <span className="text-white">HOME</span>
          <span className="text-gold">FLOW</span>
        </div>
        <div className="mt-1.5 text-[0.5rem] tracking-[0.22em] text-muted sm:text-[0.58rem]">
          RESIDENTIAL OPERATIONS MANAGEMENT
        </div>
      </div>
    </div>
  );
}
