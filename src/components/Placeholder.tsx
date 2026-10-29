/** Clearly labelled stand-in for a real photo. */
export function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`flex items-center justify-center border border-dashed border-gold/50 bg-ink p-4 text-center text-sm text-gold/80 ${className}`}
    >
      [Photo: {label}]
    </div>
  );
}
