import Image from "next/image";
import { SectionHeading } from "../SectionHeading";
import { BOOKING_WINDOW_DAYS, DEPOSIT } from "@/lib/content";

const steps = [
  { n: 1, title: "Free video consult", text: "A 30-minute Google Meet call. Tell Nick what you want fixed and he gives you an estimate on the call." },
  { n: 2, title: "Book a date", text: `Pick a day up to ${BOOKING_WINDOW_DAYS} days out with a $${DEPOSIT} deposit. The deposit is applied to your final bill.` },
  { n: 3, title: "Nick does the work", text: "You get the invoice by email and pay online. The deposit is already deducted." },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2">
      {/* Stock stand-in: swap for a photo of Nick at work. */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-line">
        <Image
          src="/images/stock/bright-kitchen.webp"
          alt="Open, well-organized kitchen with an island and pendant lights"
          fill
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
        />
      </div>
      <div>
        <SectionHeading eyebrow="A simple process" title="How it works" />
        <ol className="mt-8 space-y-6">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold font-semibold text-black">
                {s.n}
              </span>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
