import { Button } from "../Button";
import { Placeholder } from "../Placeholder";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-2 lg:py-24">
      <div>
        <p className="mb-5 text-xs font-semibold tracking-[0.25em] text-gold">
          KITCHEN ORGANIZATION &amp; SETUP
        </p>
        <h1 className="font-serif text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
          Make your home <span className="text-gold">work for you.</span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-muted">
          HomeFlow helps you get your kitchen working: organized cabinets and pantry, the right
          fixtures, small repairs fixed, and a layout that makes daily routines easier.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href="/book">Book a free kitchen consult →</Button>
        </div>
        <p className="mt-5 text-sm text-muted">
          30-minute video call · No payment · Estimate from Nick on the call
        </p>
      </div>
      <Placeholder label="finished kitchen, hero image" className="aspect-[4/5] w-full" />
    </section>
  );
}
