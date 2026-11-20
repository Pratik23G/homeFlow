import { Button } from "../Button";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

const steps = [
  { word: "Now", title: "Fix what matters", text: "Repairs, installations and adjustments that improve safety, comfort and everyday function." },
  { word: "Soon", title: "Plan what's next", text: "Preventive maintenance and equipment servicing, before small problems turn urgent." },
  { word: "Flow", title: "Live with less friction", text: "Placement, lighting and storage that simplify daily routines." },
];

export function Approach() {
  return (
    <section id="approach" className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Our approach"
          title="Now. Soon. Flow."
          intro="A well-run home starts with knowing what needs attention now, what to plan for soon, and how each room supports daily life."
          center
        />
      </Reveal>
      <div className="mt-14 grid gap-10 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.word} delay={i * 50}>
            <div className="border-t border-gold pt-6">
              <p className="font-brand text-sm font-semibold tracking-[0.12em] text-gold-dark">{s.word}</p>
              <h3 className="mt-3 font-serif text-2xl font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mx-auto mt-16 max-w-2xl rounded-xl bg-cream p-8 text-center sm:p-10">
        <h3 className="font-serif text-3xl font-medium">Start with a free assessment</h3>
        <p className="mt-3 text-muted">
          A complimentary video call to understand your space and priorities, and to see where to begin.
        </p>
        <div className="mt-6"><Button href="/book">Book a complimentary assessment</Button></div>
      </div>
    </section>
  );
}
