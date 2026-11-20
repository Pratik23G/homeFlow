"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "../Button";

// Stock B-roll stand-ins. Replace with Nicholas's before/after footage (keep the poster frames in sync).
const clips = [
  { src: "/videos/bright-room.mp4", poster: "/videos/bright-room.jpg" },
  { src: "/videos/organized-closet.mp4", poster: "/videos/organized-closet.jpg" },
  { src: "/videos/calm-bedroom.mp4", poster: "/videos/calm-bedroom.jpg" },
];

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)");
const motionAllowed = () => !reduced().matches;
function subscribeMotion(cb: () => void) {
  const m = reduced();
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

export function VideoBand() {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [i, setI] = useState(0);
  const motion = useSyncExternalStore(subscribeMotion, motionAllowed, () => false);

  // play only the visible clip; restart it when it becomes current
  useEffect(() => {
    if (!motion) return;
    refs.current.forEach((v, n) => {
      if (!v) return;
      if (n === i) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [i, motion]);

  return (
    <section aria-label="HomeFlow in motion" className="relative isolate overflow-hidden border-y border-line">
      <div className="absolute inset-0 -z-10 bg-cream">
        {clips.map((c, n) => (
          <video
            key={c.src}
            ref={(el) => { refs.current[n] = el; }}
            src={motion ? c.src : undefined}
            poster={c.poster}
            muted
            playsInline
            preload={n === 0 ? "auto" : "metadata"}
            aria-hidden
            onEnded={() => n === i && setI((i + 1) % clips.length)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${n === i ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div aria-hidden className="absolute inset-0 bg-paper/60" />
      </div>
      <div className="mx-auto flex min-h-[26rem] max-w-6xl items-center justify-center px-5 py-20 sm:min-h-[32rem]">
        <div className="relative max-w-2xl bg-paper/85 px-8 py-12 text-center shadow-[0_8px_24px_rgba(0,0,0,0.08)] sm:px-14">
          {/* gold hairline frame */}
          <span aria-hidden className="pointer-events-none absolute inset-2 border border-gold/70" />
          <p className="text-sm font-medium text-gold-dark">Before and after</p>
          <h2 className="mt-3 font-serif text-4xl font-medium leading-[1.1] sm:text-5xl">
            See what your home can become
          </h2>
          <span aria-hidden className="mx-auto mt-5 block h-px w-14 bg-gold" />
          <p className="mt-5 text-muted">
            Book a complimentary assessment and talk through your space with Nicholas.
          </p>
          <div className="mt-6"><Button href="/book">Book a complimentary assessment</Button></div>
          <div className="mt-6 flex justify-center gap-2" role="group" aria-label="Choose clip">
            {clips.map((c, n) => (
              <button
                key={c.src}
                type="button"
                aria-label={`Show clip ${n + 1}`}
                aria-current={n === i}
                onClick={() => setI(n)}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${n === i ? "w-8 bg-gold" : "w-3 bg-charcoal/25 hover:bg-gold/60"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
