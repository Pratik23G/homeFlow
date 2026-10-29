import { Button } from "../Button";

export function ClosingBand() {
  return (
    <section className="border-t border-gold/40 bg-black px-5 py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
        <p className="font-serif text-2xl tracking-[0.2em] text-white sm:text-3xl">
          YOUR HOME. IN RHYTHM. BY DESIGN.
        </p>
        <Button href="/book">Book a free consult →</Button>
      </div>
    </section>
  );
}
