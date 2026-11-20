import Image from "next/image";
import { Button } from "../Button";
import { SectionHeading } from "../SectionHeading";
import { BUSINESS_EMAIL, BUSINESS_PHONE, INSTAGRAM_URL, SERVICE_AREA_CITIES } from "@/lib/content";

const process = [
  ["Tell us about your project", "A brief description of the installation, improvement or maintenance you need."],
  ["Initial consultation", "A video call to talk through goals, requirements and options."],
  ["Receive a project estimate", "A personalized estimate based on the agreed scope of work."],
  ["Schedule your service", "Confirm the details and pick a time that suits you."],
];

export function ServiceArea() {
  return (
    <section id="area" className="border-t border-line bg-cream px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Service area"
              title="Serving San Francisco and the Peninsula"
              intro="From San Francisco to Palo Alto."
            />
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {SERVICE_AREA_CITIES.map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />
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
            className="w-full rounded-xl border border-line"
          />
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="Let's talk about your project"
              intro="Tell us what you would like done and we will help you work out the next steps."
            />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href="/book">Book a complimentary assessment</Button>
            </div>
            <ul className="mt-6 space-y-1 text-sm text-muted">
              {BUSINESS_PHONE && <li><a className="transition-colors duration-150 hover:text-gold-dark" href={`tel:${BUSINESS_PHONE}`}>{BUSINESS_PHONE}</a></li>}
              {BUSINESS_EMAIL && <li><a className="transition-colors duration-150 hover:text-gold-dark" href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a></li>}
              <li><a className="transition-colors duration-150 hover:text-gold-dark" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a></li>
            </ul>
          </div>
          <ol className="space-y-6">
            {process.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-medium text-charcoal">{i + 1}</span>
                <div>
                  <h3 className="font-medium">{t}</h3>
                  <p className="mt-1 text-sm text-muted">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
