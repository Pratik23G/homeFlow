"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "./Icons";

type Spot = { x: number; y: number; title: string; text: string };
type Slide = { src: string; alt: string; position: string; label: string; spots: Spot[] };

// Spot x/y are percentages of the visible (cropped) frame.
const slides: Slide[] = [
  {
    src: "/images/stock/hero-kitchen.webp",
    alt: "Bright white kitchen with subway tile, glass cabinets and a farmhouse sink",
    position: "50% 50%",
    label: "Bright and functional",
    spots: [
      { x: 46, y: 14, title: "Lighting and ambiance", text: "Accent and functional lighting that highlights the details of a space." },
      { x: 88, y: 37, title: "Shelving and organization", text: "Shelving and storage that add order without cluttering the look." },
      { x: 46, y: 70, title: "Residential maintenance", text: "Fixtures, fittings and repairs handled cleanly and carefully." },
      { x: 9, y: 74, title: "Hardware adjustments", text: "Pulls, hinges and drawers adjusted so they feel new again." },
    ],
  },
  {
    src: "/images/stock/open-kitchen-island.webp",
    alt: "Open living space with a large island, pendant lights and a stone fireplace",
    position: "86% 50%",
    label: "Spaces that flow",
    spots: [
      { x: 51, y: 31, title: "Lighting over the island", text: "Pendants hung at the right height and spacing for how you live." },
      { x: 76, y: 42, title: "Art and décor installation", text: "Artwork and décor mounted level and secure, placed with care." },
      { x: 35, y: 86, title: "Wire management", text: "Cables routed and concealed for a clean finish." },
    ],
  },
  {
    src: "/images/stock/tiled-sink.webp",
    alt: "White tiled sink with black fixtures and a built-in niche",
    position: "50% 50%",
    label: "Clean details",
    spots: [
      { x: 32, y: 18, title: "Finishing touches", text: "Small repairs and details that make a room feel complete." },
      { x: 26, y: 46, title: "Built-in storage", text: "Niches, shelves and ledges that keep surfaces clear." },
      { x: 50, y: 59, title: "Fixtures", text: "Modern fixtures installed to last." },
    ],
  },
  {
    src: "/images/stock/window-sink.webp",
    alt: "Farmhouse sink under a wooden window with potted plants",
    position: "79% 50%",
    label: "Warm and lived-in",
    spots: [
      { x: 41, y: 22, title: "Window hardware", text: "Sticking sashes, trim and hardware fixed so everything works smoothly." },
      { x: 50, y: 61, title: "Fixture upgrades", text: "Swap something dated for something that looks and works better." },
      { x: 30, y: 85, title: "Preventive care", text: "Seals and fittings checked before small issues grow." },
    ],
  },
];

export function HeroShowcase() {
  const wrap = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);

  const go = (n: number) => {
    setSlide((n + slides.length) % slides.length);
    setActive(null);
  };

  useEffect(() => {
    if (hovering || active !== null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(slide + 1), 6500);
    return () => clearTimeout(t);
  }, [slide, hovering, active]);

  useEffect(() => {
    function away(e: PointerEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setActive(null);
        setHovering(false);
      }
    }
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, []);

  const current = slides[slide];

  return (
    <div
      ref={wrap}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => { setActive(null); setHovering(false); }}
      className="relative mx-auto w-full max-w-[520px]"
      style={{ animationDelay: "200ms" }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        {slides.map((s, i) => (
          <div
            key={s.src}
            aria-hidden={i !== slide}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${i === slide ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 520px, 100vw"
              className={`object-cover ${i === 0 ? "hero-photo" : ""}`}
              style={{ objectPosition: s.position }}
            />
          </div>
        ))}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 bg-charcoal/20 transition-opacity duration-300 ${active === null ? "opacity-0" : "opacity-100"}`}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal/55 to-transparent" />
        <p key={slide} className="hotspot-card pointer-events-none absolute bottom-4 left-5 text-sm font-medium text-white">
          {current.label}
        </p>
        <div className="absolute bottom-3 right-3 flex gap-2">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d < 0 ? "Previous photo" : "Next photo"}
              onClick={() => go(slide + d)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-charcoal/40 text-white backdrop-blur transition-colors hover:bg-gold hover:text-charcoal"
            >
              {d < 0 ? <ArrowLeft /> : <ArrowRight />}
            </button>
          ))}
        </div>
      </div>

      {current.spots.map((s, i) => {
        const open = active === i;
        const flipX = s.x > 55;
        const flipY = s.y > 55;
        return (
          <div
            key={`${slide}-${s.title}`}
            className="hotspot-card absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%`, zIndex: open ? 30 : 20 }}
          >
            <button
              type="button"
              aria-label={s.title}
              aria-expanded={open}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              onClick={() => setActive(open ? null : i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive((a) => (a === i ? null : a))}
              className="group relative -ml-3.5 -mt-3.5 flex h-7 w-7 items-center justify-center rounded-full outline-none"
            >
              <span className="absolute inset-0 rounded-full bg-gold/35" />
              <span
                className={`relative h-3.5 w-3.5 rounded-full border-2 border-white bg-gold shadow-lg transition-transform duration-150 group-focus-visible:ring-2 group-focus-visible:ring-charcoal ${open ? "scale-150" : "group-hover:scale-125"}`}
              />
            </button>
            {open && (
              <div
                role="status"
                className={`hotspot-card absolute w-60 rounded-xl border border-line bg-paper/95 p-4 shadow-xl backdrop-blur ${
                  flipX ? "right-0" : "left-0"
                } ${flipY ? "bottom-5" : "top-5"}`}
              >
                <p className="font-serif text-xl font-medium leading-tight text-charcoal">{s.title}</p>
                <p className="mt-1.5 text-sm text-muted">{s.text}</p>
                <Link href="/book" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-gold-dark transition-colors duration-150 hover:text-charcoal">
                  Book a complimentary assessment <ArrowRight />
                </Link>
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-4 flex items-center justify-center gap-3">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Show photo ${i + 1}: ${s.label}`}
            aria-current={i === slide}
            onClick={() => go(i)}
            className={`relative h-12 w-12 overflow-hidden rounded-lg border transition-[opacity,border-color] duration-150 ${
              i === slide ? "border-gold" : "border-line opacity-60 hover:opacity-100"
            }`}
          >
            <Image src={s.src} alt="" fill sizes="48px" className="object-cover" style={{ objectPosition: s.position }} />
          </button>
        ))}
      </div>
    </div>
  );
}
