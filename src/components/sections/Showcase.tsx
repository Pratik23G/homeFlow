import { Button } from "../Button";
import Image from "next/image";
import { SectionHeading } from "../SectionHeading";

const tiles = [
  { src: "/images/stock/organized-drawer.webp", alt: "Utensil drawer with wooden dividers", label: "Organized storage" },
  { src: "/images/stock/faucet.webp", alt: "Close-up of a chrome kitchen faucet", label: "Updated fixtures" },
  { src: "/images/stock/kitchen-layout.webp", alt: "Modern white kitchen with a central island", label: "Better layouts" },
];

export function Showcase() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="grid items-end gap-8 lg:grid-cols-2">
        <SectionHeading
          eyebrow="More than a handyman"
          title="Practical solutions for a better kitchen."
          intro="Sometimes the answer is a repair. Sometimes it's reorganizing a cabinet or moving things to where you actually use them. Nick finds the friction and fixes it."
        />
        <div className="lg:text-right">
          <Button href="/book">Book your free consult →</Button>
        </div>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {tiles.map((t) => (
          <figure key={t.src}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line">
              <Image src={t.src} alt={t.alt} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-sm font-semibold tracking-wide text-gold">{t.label}</figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-muted">More rooms coming soon.</p>
    </section>
  );
}
