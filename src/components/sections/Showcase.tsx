import { Button } from "../Button";
import { Placeholder } from "../Placeholder";
import { SectionHeading } from "../SectionHeading";

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
        <Placeholder label="organized pantry" className="aspect-[4/5]" />
        <Placeholder label="new fixtures installed" className="aspect-[4/5]" />
        <Placeholder label="reworked kitchen layout" className="aspect-[4/5]" />
      </div>
      <p className="mt-6 text-center text-sm text-muted">More rooms coming soon.</p>
    </section>
  );
}
