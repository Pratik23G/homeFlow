"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { createConsultation, getAvailableSlots } from "@/app/book/actions";
import { CAL_TITLE, googleCalendarUrl } from "@/lib/calendar";
import { BOOKING_WINDOW_DAYS, CITIES } from "@/lib/content";
import { supabaseBrowser } from "@/lib/supabase/browser";

const BUSINESS_TZ = "America/Los_Angeles";
const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

type Slot = { startsAt: string; endsAt: string };
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmtSlot = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: BUSINESS_TZ });
const icsStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function downloadIcs(startsAt: string, endsAt: string, meetUrl: string | null) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HomeFlow//Consult//EN",
    "BEGIN:VEVENT",
    `UID:${icsStamp(startsAt)}-${Math.random().toString(36).slice(2)}@homeflow`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(startsAt)}`,
    `DTEND:${icsStamp(endsAt)}`,
    `SUMMARY:${CAL_TITLE}`,
    ...(meetUrl ? [`LOCATION:${meetUrl}`, `DESCRIPTION:Join the video call: ${meetUrl}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "homeflow-consult.ics";
  a.click();
  URL.revokeObjectURL(url);
}

const fmtSlotDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: BUSINESS_TZ });

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) => a.getTime() === b.getTime();
const subscribe = () => () => {};

/** Render only on the client so "today" never mismatches server HTML. */
export function BookingForm() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  if (!mounted) return <div className="mt-10 h-96 animate-pulse rounded-lg bg-cream" />;
  return <BookingFormInner today={startOfDay(new Date())} />;
}

function BookingFormInner({ today }: { today: Date }) {
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [day, setDay] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [city, setCity] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ startsAt: string; endsAt: string; meetUrl: string | null; photosFailed: boolean } | null>(null);
  const latestDay = useRef<string | null>(null);

  async function pickDay(d: Date) {
    const key = ymd(d);
    latestDay.current = key;
    setDay(d);
    setSlot(null);
    setSlots(null);
    const result = await getAvailableSlots(key);
    if (latestDay.current === key) setSlots(result); // ignore stale responses
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!day || !slot) return;
    const f = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);
    const res = await createConsultation({
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      city,
      description: String(f.get("what") ?? ""),
      date: ymd(day),
      startsAt: slot.startsAt,
      photos: photos.map((p) => ({ name: p.name, type: p.type, size: p.size })),
      website: String(f.get("website") ?? ""),
    });
    if (!res.ok) {
      setError(res.message);
      setSubmitting(false);
      if (res.code === "slot_taken") await pickDay(day); // refresh the list
      return;
    }
    let photosFailed = false;
    if (res.uploads.length) {
      const storage = supabaseBrowser().storage.from("consult-photos");
      const results = await Promise.all(
        res.uploads.map((u, i) => storage.uploadToSignedUrl(u.path, u.token, photos[i])),
      );
      photosFailed = results.some((r) => r.error);
    }
    setDone({ startsAt: res.startsAt, endsAt: res.endsAt, meetUrl: res.meetUrl, photosFailed });
    setSubmitting(false);
  }

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
  if (done) {
    return (
      <div className="mt-10 rounded-lg border border-gold p-8">
        <h2 className="font-serif text-3xl font-medium">Request received</h2>
        <p className="mt-3 text-muted">
          Your free consult is booked for {fmtSlotDay(done.startsAt)} at {fmtSlot(done.startsAt)} Pacific.
          {done.meetUrl
            ? " Save the link below or add it to your calendar. Google also emails you an invite."
            : " Nicholas will email you the video call link shortly."}
        </p>
        {done.meetUrl && (
          <a href={done.meetUrl} className="mt-4 inline-block break-all text-gold-dark underline">
            {done.meetUrl}
          </a>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={googleCalendarUrl(done.startsAt, done.endsAt, done.meetUrl)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-gold px-6 py-3 text-center text-sm font-medium text-charcoal transition-colors duration-150 hover:bg-gold-dark hover:text-white"
          >
            Add to Google Calendar
          </a>
          <button
            type="button"
            onClick={() => downloadIcs(done.startsAt, done.endsAt, done.meetUrl)}
            className="rounded-full border border-gold px-6 py-3 text-sm font-medium text-gold-dark transition-colors duration-150 hover:bg-gold hover:text-charcoal"
          >
            Apple / Outlook (.ics)
          </button>
        </div>
        {done.photosFailed && (
          <p className="mt-3 text-sm text-gold-dark">
            Some photos did not upload. You can show them to Nicholas on the call or reply to his email with them.
          </p>
        )}
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-line bg-cream px-4 py-3 text-charcoal placeholder:text-charcoal/40 focus:border-gold focus:outline-none";
  const label = "mb-1.5 block text-sm font-medium";

  return (
    <form
      className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]"
      onSubmit={onSubmit}
    >
      <div className="space-y-10">
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        {/* 1. Day */}
        <section>
          <h2 className="mb-4 font-serif text-2xl font-medium">1. Pick a day</h2>
          <div className="max-w-md rounded-lg border border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="rounded px-3 py-1 text-gold-dark disabled:opacity-30"
                aria-label="Previous month"
              >
                ←
              </button>
              <span className="font-medium">
                {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="rounded px-3 py-1 text-gold-dark disabled:opacity-30"
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
                    onClick={() => pickDay(d)}
                    className={`aspect-square rounded-md text-sm transition-colors disabled:text-charcoal/25 ${
                      day && sameDay(day, d)
                        ? "bg-gold font-medium text-charcoal"
                        : isBookable(d)
                          ? "text-charcoal hover:bg-gold/20"
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
          <p className="mt-2 text-xs text-muted">Bookings open up to {BOOKING_WINDOW_DAYS} days ahead.</p>
        </section>

        {/* 2. Time */}
        <section>
          <h2 className="mb-4 font-serif text-2xl font-medium">2. Pick a 30-minute time</h2>
          {!day ? (
            <p className="text-sm text-muted">Choose a day first.</p>
          ) : slots === null ? (
            <p className="text-sm text-muted">Loading times...</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted">No times open that day. Try another date.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s.startsAt}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={`rounded-lg border px-3 py-2.5 text-sm transition-colors duration-150 ${
                    slot?.startsAt === s.startsAt
                      ? "border-gold bg-gold font-medium text-charcoal"
                      : "border-line hover:border-gold"
                  }`}
                >
                  {fmtSlot(s.startsAt)}
                </button>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-muted">Times are Pacific.</p>
        </section>

        {/* 3. Details */}
        <section>
          <h2 className="mb-4 font-serif text-2xl font-medium">3. Your details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="name">Name</label>
              <input id="name" name="name" required autoComplete="name" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" className={input} />
            </div>
            <div>
              <label className={label} htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" required autoComplete="tel" className={input} />
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
                <p className="mt-2 text-sm text-red-800">
                  We&apos;re sorry, that&apos;s outside our area for now. We serve the SF Peninsula, San Francisco to Palo Alto.
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="what">What do you want fixed?</label>
              <textarea id="what" name="what" required maxLength={2000} rows={5} className={input} placeholder="e.g. Mount a 65-inch TV and hide the cables, hang three mirrors in the hallway" />
            </div>
            <div className="sm:col-span-2">
              <label className={label} htmlFor="photos">Photos (optional)</label>
              <input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length > MAX_PHOTOS || files.some((f) => f.size > MAX_PHOTO_BYTES)) {
                    setPhotoError(`Up to ${MAX_PHOTOS} photos, 10 MB each.`);
                    e.target.value = "";
                    setPhotos([]);
                    return;
                  }
                  setPhotoError(null);
                  setPhotos(files);
                }}
                className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:font-medium file:text-charcoal"
              />
              {photos.length > 0 && (
                <p className="mt-2 text-xs text-muted">{photos.length} photo(s) selected</p>
              )}
              {photoError && <p role="alert" className="mt-2 text-sm text-red-800">{photoError}</p>}
            </div>
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className="h-fit rounded-xl border border-line bg-cream p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-2xl font-medium">Summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted">Service</dt>
            <dd>Complimentary assessment, 30-minute video call</dd>
          </div>
          <div>
            <dt className="text-muted">When</dt>
            <dd>{slot ? `${fmtSlotDay(slot.startsAt)}, ${fmtSlot(slot.startsAt)} PT` : "Not selected yet"}</dd>
          </div>
          <div>
            <dt className="text-muted">Where</dt>
            <dd>Video call (Google Meet), link sent by email</dd>
          </div>
          <div>
            <dt className="text-muted">Cost</dt>
            <dd className="font-medium text-gold-dark">$0, no payment required</dd>
          </div>
        </dl>
        <button
          type="submit"
          disabled={!day || !slot || city === "other" || submitting}
          className="mt-6 w-full h-12 rounded-full bg-gold px-6 font-medium text-charcoal transition-colors hover:bg-gold-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Sending..." : "Request assessment"}
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-red-800">{error}</p>}
      </aside>
    </form>
  );
}
