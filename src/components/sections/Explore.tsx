import { HeroShowcase } from "../HeroShowcase";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

export function Explore() {
  return (
    <section id="explore" className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2">
      <Reveal>
        <SectionHeading
          eyebrow="Explore a room"
          title="See where the details go"
          intro="Tap or hover the dots to see the kind of work Nicholas does in each space."
        />
      </Reveal>
      <HeroShowcase />
    </section>
  );
}
