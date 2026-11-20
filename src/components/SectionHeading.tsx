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
      {eyebrow && <p className="mb-3 text-sm font-medium text-gold-dark">{eyebrow}</p>}
      <h2 className="font-serif text-4xl font-medium leading-[1.1] sm:text-5xl">{title}</h2>
      <span aria-hidden className={`mt-5 block h-px w-14 bg-gold ${center ? "mx-auto" : ""}`} />
      {intro && <p className="mt-4 text-muted">{intro}</p>}
    </div>
  );
}
