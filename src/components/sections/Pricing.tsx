import { SectionHeading } from "../SectionHeading";
import { CANCEL_HOURS, DEPOSIT, HOURLY_RATE } from "@/lib/content";

export function Pricing() {
  const cards = [
    { label: "Consult", value: "$0", note: "30-minute video call" },
    { label: "Booking deposit", value: `$${DEPOSIT}`, note: "Applied to your bill" },
    { label: "Labor", value: `~$${HOURLY_RATE}/hr`, note: "Ballpark; final price depends on scope" },
  ];
  return (
    <section id="pricing" className="border-y border-line bg-ink px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Pricing" title="Simple, upfront pricing" center />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-lg border border-line p-8 text-center">
              <p className="text-sm tracking-widest text-muted">{c.label.toUpperCase()}</p>
              <p className="mt-3 font-serif text-5xl font-semibold text-gold">{c.value}</p>
              <p className="mt-2 text-sm text-muted">{c.note}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-lg border border-gold/40 p-6">
          <h3 className="font-serif text-2xl font-semibold">Cancellation &amp; rescheduling</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><span className="text-white">{CANCEL_HOURS}+ hours before:</span> deposit refunded.</li>
            <li><span className="text-white">Within {CANCEL_HOURS} hours:</span> deposit kept.</li>
            <li><span className="text-white">Reschedule:</span> your deposit becomes credit toward the new booking.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
