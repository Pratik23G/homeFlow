import Image from "next/image";
import { Button } from "../Button";
import { SectionHeading } from "../SectionHeading";

const values = [
  ["Precision", "Careful craftsmanship and attention to detail"],
  ["Function", "Practical solutions for everyday living"],
  ["Aesthetics", "Clean installations that suit the home's design"],
  ["Communication", "Clear expectations and honest recommendations"],
  ["Prevention", "Small concerns fixed before they grow"],
];

export function About() {
  return (
    <section id="about" className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1fr_1.2fr]">
      <div className="relative mx-auto w-full max-w-md pb-10 pr-8 lg:max-w-none">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line">
          <Image
            src="/images/NickProfile/nick-portrait.jpeg"
            alt="Nicholas, founder of HomeFlow"
            fill
            sizes="(min-width: 1024px) 480px, 90vw"
            className="object-cover object-top"
          />
        </div>
        <div className="absolute bottom-0 right-0 aspect-square w-2/5 overflow-hidden rounded-full border-4 border-paper">
          <Image
            src="/images/NickProfile/nick-coffee.jpeg"
            alt="Nicholas enjoying a coffee"
            fill
            sizes="200px"
            className="object-cover"
          />
        </div>
      </div>
      <div>
        <SectionHeading eyebrow="About HomeFlow" title="The person behind the details" />
        <p className="mt-4 text-muted">
          HomeFlow started from a simple belief: a well-maintained home should look good and work without effort.
          With a background in technical problem-solving and hands-on residential maintenance, I handle
          installations, organization, equipment care and everyday home improvements.
        </p>
        <p className="mt-3 text-muted">
          My work comes down to precision and practical solutions. The smallest details make the biggest difference.
        </p>
        <p className="mt-3 text-sm font-medium">Nicholas, founder</p>
        <h3 className="mt-10 font-serif text-2xl font-medium">What guides the work</h3>
        <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
          {values.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-6">
              <dt className="font-medium text-gold-dark sm:w-36 sm:shrink-0">{k}</dt>
              <dd className="text-muted">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10">
          <p className="font-serif text-2xl font-medium">Let&apos;s make your home work beautifully</p>
          <div className="mt-4"><Button href="/book">Book a complimentary assessment</Button></div>
        </div>
      </div>
    </section>
  );
}
