"use client";

import { useState, useSyncExternalStore } from "react";
import { BOOKING_WINDOW_DAYS, CITIES } from "@/lib/content";

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
// Static placeholder availability: 9:00 to 16:30, every 30 minutes, Mon-Sat.
const SLOTS = Array.from({ length: 16 }, (_, i) => {
  const mins = 9 * 60 + i * 30;
  return { h: Math.floor(mins / 60), m: mins % 60 };
});

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime();
const fmtTime = (h: number, m: number) =>
  `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;

const subscribe = () => () => {};

/** Render only on the client so "today" never mismatches server HTML. */
export function BookingForm() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  if (!mounted) return <div className="mt-10 h-96 animate-pulse rounded-lg bg-ink" />;
  return <BookingFormInner today={startOfDay(new Date())} />;
}

function BookingFormInner({ today }: { today: Date }) {
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const lastDay = addDays(today, BOOKING_WINDOW_DAYS);

  const canPrev = month > new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= lastDay;
  const firstWeekday = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];

  const isBookable = (d: Date) => d >= today && d <= lastDay && d.getDay() !== 0;
  const slotLabel = slot ? fmtTime(...(slot.split(":").map(Number) as [number, number])) : null;
  const dayLabel = day?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (submitted) {
    return (
      <div className="mt-10 rounded-lg border border-gold p-8">
        <h2 className="font-serif text-3xl font-semibold">Thanks, this is a preview</h2>
        <p className="mt-3 text-muted">
          The booking page is static for now, so nothing was saved or sent. Backend is coming in a later phase.
        </p>
        <button onClick={() => setSubmitted(false)} className="mt-6 text-gold underline">
          Back to the form
        </button>
      </div>
    );
  }

  const input =
    "w-full rounded-md border border-line bg-ink px-4 py-3 text-white placeholder:text-white/40 focus:border-gold focus:outline-none";
  const label = "mb-1.5 block text-sm font-medium";

  return (
    <form
      className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <div className="space-y-10">
        {/* 1. Day */}
        <section>
          <h2 className="mb-4 font-serif text-2xl font-semibold">1. Pick a day</h2>
          <div className="max-w-md rounded-lg border border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="rounded px-3 py-1 text-gold disabled:opacity-30"
                aria-label="Previous month"
              >
                ←
              </button>
              <span className="font-semibold">
                {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="rounded px-3 py-1 text-gold disabled:opacity-30"
                aria-label="Next month"
              >
                →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
              {DAY_NAMES.map((n) => (
                <div key={n} className="py-1">{n}</div>
              ))}
              {cells.map((d, i) =>
                d ? (
                  <button
                    key={i}
                    type="button"
                    disabled={!isBookable(d)}
                    onClick={() => {
                      setDay(d);
                      setSlot(null);
                    }}
                    className={`aspect-square rounded-md text-sm transition-colors disabled:text-white/20 ${
                      day && sameDay(day, d)
                        ? "bg-gold font-semibold text-black"
                        : isBookable(d)
                          ? "text-white hover:bg-gold/20"
                          : ""
                    }`}
                  >
                    {d.getDate()}
                  </button>
                ) : (
                  <div key={i} />
                ),
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">Bookings open up to {BOOKING_WINDOW_DAYS} days ahead. Times shown are placeholders.</p>
        </section>

        {/* 2. Time */}
        <section>
          <h2 className="mb-4 font-serif text-2xl font-semibold">2. Pick a 30-minute time</h2>
          {day ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SLOTS.map(({ h, m }) => {
                const v = `${h}:${m}`;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSlot(v)}
                    className={`rounded-md border px-3 py-2.5 text-sm transition-colors ${
                      slot === v ? "border-gold bg-gold font-semibold text-black" : "border-line hover:border-gold"
                    }`}
                  >
                    {fmtTime(h, m)}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted">Choose a day first.</p>
          )}
        </section>

        {/* 3. Details */}
        <section>
          <h2 className="mb-4 font-serif text-2xl font-semibold">3. Your details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="name">Name</label>
              <input id="name" required autoComplete="name" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="email">Email</label>
              <input id="email" type="email" required autoComplete="email" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="phone">Phone</label>
              <input id="phone" type="tel" required autoComplete="tel" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="city">City</label>
              <select id="city" required value={city} onChange={(e) => setCity(e.target.value)} className={input}>
                <option value="">Select your city</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="other">Other / not listed</option>
              </select>
              {city === "other" && (
                <p className="mt-2 text-sm text-gold">
                  We&apos;re sorry, that&apos;s outside our area for now. We serve the SF Peninsula, San Francisco to Palo Alto.
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="what">What do you want fixed?</label>
              <textarea id="what" required rows={5} className={input} placeholder="e.g. Pantry is a mess, cabinet door hangs crooked, want better counter flow..." />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="photos">Kitchen photos (optional)</label>
              <input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
                className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:font-semibold file:text-black"
              />
              {photos.length > 0 && (
                <p className="mt-2 text-xs text-muted">{photos.length} photo(s) selected (not uploaded yet)</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-lg border border-gold/50 bg-ink p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-2xl font-semibold">Summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted">Service</dt>
            <dd>Free kitchen consult · 30-min video call</dd>
          </div>
          <div>
            <dt className="text-muted">When</dt>
            <dd>{dayLabel && slotLabel ? `${dayLabel}, ${slotLabel}` : "Not selected yet"}</dd>
          </div>
          <div>
            <dt className="text-muted">Where</dt>
            <dd>Google Meet link sent by email</dd>
          </div>
          <div>
            <dt className="text-muted">Cost</dt>
            <dd className="font-semibold text-gold">$0, no payment required</dd>
          </div>
        </dl>
        <button
          type="submit"
          disabled={!day || !slot || city === "other"}
          className="mt-6 w-full rounded-full bg-gold px-6 py-3 font-semibold text-black transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          Request free consult
        </button>
      </aside>
    </form>
  );
}
