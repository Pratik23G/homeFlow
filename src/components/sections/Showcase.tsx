import { Gallery } from "../Gallery";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import { INSTAGRAM_URL } from "@/lib/content";

const works = [
  { src: "/images/works/wall-lights.jpeg", alt: "Lit decorative wall fixtures on a textured wall", label: "Lighting installs" },
  { src: "/images/works/roman-shade.jpeg", alt: "Roman shade being adjusted above a bright window", label: "Window treatments" },
  { src: "/images/works/tv-mounted.jpeg", alt: "Wall-mounted TV above a wooden dresser in a paneled room", label: "TV mounting and wire concealment" },
  { src: "/images/works/tv-mount-level.jpeg", alt: "TV mount bracket being leveled on a paneled wall", label: "Level, every time" },
  { src: "/images/works/hanging-art.jpeg", alt: "Framed photo being hung on a wall", label: "Art and décor hanging" },
  { src: "/images/works/neon-sign.jpeg", alt: "Illuminated sign mounted in a gold alcove", label: "Illuminated displays" },
  { src: "/images/works/plumbing.jpeg", alt: "Copper and PVC pipe fitting", label: "Fixtures and plumbing" },
  { src: "/images/works/appliance-repair.jpeg", alt: "Cordless drill opening up an appliance for repair", label: "Equipment care" },
];

export function Showcase() {
  return (
    <section id="work" className="border-y border-line bg-cream px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow="Selected work"
            title="A closer look at Nicholas's work"
            intro="A selection of recent HomeFlow projects. Swipe or use the arrows."
            center
          />
        </Reveal>
        <div className="mt-12">
          <Gallery items={works} />
        </div>
        <div className="mt-10 text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-full border border-gold px-6 text-[15px] font-medium text-gold-dark transition-colors duration-150 hover:bg-gold hover:text-charcoal"
          >
            View our work on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
