import Image from "next/image";
import { SectionHeading } from "../SectionHeading";
import { CITIES } from "@/lib/content";

export function ServiceArea() {
  return (
    <section id="area" className="border-y border-line bg-ink px-5 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Service area"
            title="SF Peninsula"
            intro="From San Francisco to Palo Alto."
          />
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {CITIES.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <Image
          src="/images/service-area.png"
          alt="Map of the HomeFlow service area, San Francisco to Palo Alto"
          width={1536}
          height={1024}
          className="w-full rounded-lg border border-line"
        />
      </div>
    </section>
  );
}
