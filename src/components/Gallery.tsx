"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "./Icons";

export type GalleryItem = { src: string; alt: string; label: string };

/** Swipeable photo gallery: native scroll-snap plus arrow buttons. */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const track = useRef<HTMLUListElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={track}
        tabIndex={0}
        aria-label="HomeFlow project photos"
        className="gallery-track flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
      >
        {items.map((w) => (
          <li key={w.src} className="w-[78%] shrink-0 snap-center sm:w-[44%] lg:w-[30%]">
            <figure>
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-line">
                <Image src={w.src} alt={w.alt} fill sizes="(min-width: 1024px) 360px, 80vw" className="object-cover" />
              </div>
              <figcaption className="mt-3 font-serif text-xl font-medium">{w.label}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-center gap-3">
        {([-1, 1] as const).map((d) => (
          <button
            key={d}
            type="button"
            aria-label={d < 0 ? "Previous photos" : "Next photos"}
            onClick={() => scroll(d)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold text-gold-dark transition-colors duration-150 hover:bg-gold hover:text-charcoal"
          >
            {d < 0 ? <ArrowLeft /> : <ArrowRight />}
          </button>
        ))}
      </div>
    </div>
  );
}
