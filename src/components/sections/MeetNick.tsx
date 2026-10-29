import { Placeholder } from "../Placeholder";
import { SectionHeading } from "../SectionHeading";

export function MeetNick() {
  return (
    <section id="about" className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1fr_1.2fr]">
      <Placeholder label="Nick, portrait" className="aspect-square w-full" />
      <div>
        <SectionHeading eyebrow="About" title="Meet Nick" />
        <p className="mt-4 text-muted">[Bio placeholder: Nick&apos;s background, experience and why he started HomeFlow.]</p>
        <p className="mt-3 text-muted">[Bio placeholder: what clients can expect when working with him.]</p>
      </div>
    </section>
  );
}
