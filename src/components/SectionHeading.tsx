export function SectionHeading({
  eyebrow,
  title,
  intro,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-gold">{eyebrow.toUpperCase()}</p>}
      <h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">{title}</h2>
      {intro && <p className="mt-4 text-muted">{intro}</p>}
    </div>
  );
}
