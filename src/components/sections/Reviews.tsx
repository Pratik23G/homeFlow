import { Button } from "../Button";
import { SectionHeading } from "../SectionHeading";
import { GOOGLE_REVIEWS_URL, YELP_REVIEWS_URL } from "@/lib/content";

export function Reviews() {
  return (
    <section className="border-y border-line bg-ink px-5 py-16 text-center">
      <SectionHeading
        eyebrow="Reviews"
        title="See what clients say"
        intro="Read honest reviews from past clients, or leave your own after your job."
        center
      />
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button href={GOOGLE_REVIEWS_URL} variant="outline">Google reviews</Button>
        <Button href={YELP_REVIEWS_URL} variant="outline">Yelp reviews</Button>
      </div>
    </section>
  );
}
