import Image from "next/image";
import { Button } from "../Button";

/** Full-bleed scene. The photo's calm left side carries the headline; on phones it stacks above the text. */
export function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden border-b border-line">
      <div className="relative h-72 sm:h-96 lg:absolute lg:inset-0 lg:h-auto">
        <Image
          src="/images/hero-scene.webp"
          alt="Sunlit living room with a framed print above an oak console and a brass sconce"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_50%]"
        />
      </div>
      <div className="relative mx-auto flex max-w-6xl items-center px-5 py-12 lg:min-h-[44rem] lg:py-24">
        <div className="max-w-lg">
          <h1 className="animate-rise font-serif text-5xl font-medium leading-[1.05] sm:text-6xl lg:text-7xl">
            <span className="block">Your home.</span>
            <span className="block">In rhythm.</span>
            <span className="block">By design.</span>
          </h1>
          <p style={{ animationDelay: "80ms" }} className="animate-rise mt-6 text-lg text-muted lg:text-charcoal/75">
            Mounting, lighting, cable concealment, shelving and everyday repairs for homes across San Francisco and the
            Peninsula. Nicholas takes care of the finishing details that make a home work better.
          </p>
          <div style={{ animationDelay: "160ms" }} className="animate-rise mt-8">
            <Button href="/book">Book a complimentary assessment</Button>
          </div>
          <p style={{ animationDelay: "240ms" }} className="animate-rise mt-4 text-sm text-muted lg:text-charcoal/70">
            Free 30-minute video call. No payment needed.
          </p>
        </div>
      </div>
    </section>
  );
}
