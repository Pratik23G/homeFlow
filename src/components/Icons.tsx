/** 16px line arrows, 1.5 stroke, inherit text color. Replaces the ← → text glyphs. */
const base = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const ArrowLeft = () => (
  <svg {...base}><path d="M13 8H3M7 4 3 8l4 4" /></svg>
);
export const ArrowRight = () => (
  <svg {...base}><path d="M3 8h10M9 4l4 4-4 4" /></svg>
);
