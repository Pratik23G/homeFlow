import Image from "next/image";
import { Button } from "../Button";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";

const services = [
  { title: "Art, mirrors and décor installation", text: "Level, secure mounting for artwork, mirrors and decorative pieces.", src: "/images/works/hanging-art.jpeg", alt: "Framed photograph being hung on a wall" },
  { title: "Lighting and ambiance", text: "Accent, display and task lighting that sets the mood and shows off the architecture.", src: "/images/works/wall-lights.jpeg", alt: "Lit decorative wall fixtures on a textured wall" },
  { title: "Wire management and concealment", text: "Clean cable routing for TVs, home offices and living rooms, with no wires on show.", src: "/images/works/tv-mounted.jpeg", alt: "Wall-mounted TV above a wooden dresser in a paneled room" },
  { title: "Espresso machine care", text: "Cleaning, preventive maintenance and troubleshooting for home espresso machines.", src: "/images/stock/espresso-machine.webp", alt: "Espresso machine pouring into a white cup" },
  { title: "Shelving and organization", text: "Shelves, floating displays and closet systems that add order without cluttering the look.", src: "/images/stock/organized-drawer.webp", alt: "Neatly organized wooden utensil drawer" },
  { title: "Repairs and improvements", text: "Household repairs, hardware adjustments and preventive maintenance.", src: "/images/works/appliance-repair.jpeg", alt: "Cordless drill opening up an appliance for repair" },
];

export function Services() {
  return (
    <section id="services" className="border-y border-line bg-cream px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Services"
            title="What Nicholas takes care of"
            intro="From hanging a mirror to servicing an espresso machine, six kinds of work that keep a home running well."
            center
          />
        </Reveal>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 50} className="h-full">
              <article className="group h-full">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line transition-colors duration-150 group-hover:border-gold">
                  <Image src={s.src} alt={s.alt} fill sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
                <p className="mt-5 font-serif text-lg text-gold-dark">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 font-serif text-2xl font-medium leading-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mx-auto mt-16 max-w-xl text-center">
          <p className="font-serif text-2xl font-medium">Have a project in mind?</p>
          <p className="mt-2 text-muted">Tell Nicholas what you need and he will help you work out the next steps.</p>
          <div className="mt-6"><Button href="/book">Book a complimentary assessment</Button></div>
        </div>
      </div>
    </section>
  );
}
