import { PaymentMethods } from "../PaymentMethods";
import { Reveal } from "../Reveal";
import { SectionHeading } from "../SectionHeading";
import { CANCEL_HOURS, DEPOSIT } from "@/lib/content";

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <SectionHeading
          eyebrow="Pricing"
          title="Clear, project-based pricing."
          intro="Every project is unique. You get a personalized estimate based on the scope of work, agreed before work begins."
          center
        />
      </Reveal>
      <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gold bg-cream p-10 text-center">
          <p className="text-sm font-medium text-muted">Consultation</p>
          <p className="mt-3 font-serif text-7xl font-medium text-gold-dark">$0</p>
          <p className="mt-2 text-sm text-muted">Complimentary 30-minute video call</p>
        </div>
        <div className="rounded-xl border border-line bg-cream p-10 text-center">
          <p className="text-sm font-medium text-muted">Booking deposit</p>
          <p className="mt-3 font-serif text-7xl font-medium text-gold-dark">${DEPOSIT}</p>
          <p className="mt-2 text-sm text-muted">Applied to your final bill</p>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-3xl">
        <p className="mb-3 text-center text-sm font-medium text-muted">Ways to pay</p>
        <PaymentMethods />
      </div>
      <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-line p-6 sm:p-8">
        <h3 className="font-serif text-2xl font-medium">Cancellation and rescheduling</h3>
        <dl className="mt-4 divide-y divide-line text-sm">
          {[
            [`${CANCEL_HOURS}+ hours before`, "Deposit refunded"],
            [`Within ${CANCEL_HOURS} hours`, "Deposit kept"],
            ["Reschedule", "Your deposit becomes credit toward the new booking"],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
              <dt className="font-medium sm:w-48 sm:shrink-0">{k}</dt>
              <dd className="text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm text-muted">
          Complimentary consultations are video calls. Any on-site diagnostic or assessment visit is billable and quoted in advance.
        </p>
      </div>
    </section>
  );
}
