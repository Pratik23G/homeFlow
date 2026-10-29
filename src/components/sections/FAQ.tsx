import { SectionHeading } from "../SectionHeading";
import { BOOKING_WINDOW_DAYS, CANCEL_HOURS, DEPOSIT } from "@/lib/content";

const faqs = [
  { q: "Is the consult really free?", a: "Yes. It's a 30-minute video call on Google Meet. No payment and no obligation." },
  { q: "What happens on the call?", a: "You tell Nick what you want fixed, optionally share photos, and he gives you an estimate." },
  { q: "How is the final price decided?", a: "Labor averages about $80/hour and the final price depends on scope. Nick sends a custom estimate for your job." },
  { q: "What is the deposit?", a: `A $${DEPOSIT} deposit books your date. It's applied to your final invoice.` },
  { q: "What if I need to cancel or reschedule?", a: `Cancel more than ${CANCEL_HOURS} hours before and the deposit is refunded. Within ${CANCEL_HOURS} hours it's kept. If you reschedule, the deposit carries over as credit.` },
  { q: "How far ahead can I book?", a: `Up to ${BOOKING_WINDOW_DAYS} days out.` },
  { q: "Do you cover my city?", a: "We serve the SF Peninsula, from San Francisco to Palo Alto. See the service area list above." },
];

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
      <SectionHeading eyebrow="FAQ" title="Common questions" center />
      <div className="mt-10 divide-y divide-line border-y border-line">
        {faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              {f.q}
              <span className="ml-4 text-gold transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
