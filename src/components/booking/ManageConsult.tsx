"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { getAvailableSlots } from "@/app/book/actions";
import { cancelConsult, rescheduleConsult } from "@/app/manage/actions";
import { BOOKING_WINDOW_DAYS } from "@/lib/content";

const TZ = "America/Los_Angeles";
type Slot = { startsAt: string; endsAt: string };
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: TZ });
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const subscribe = () => () => {};

type Props = { id: string; token: string; startsAt: string; meetUrl: string | null; missed: boolean };

/** Render only on the client so "today" never mismatches server HTML. */
export function ManageConsult(props: Props) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  if (!mounted) return <div className="mt-8 h-96 animate-pulse rounded-lg bg-cream" />;
  return <Inner {...props} today={startOfDay(new Date())} />;
}

function Inner({ id, token, startsAt, meetUrl, missed, today }: Props & { today: Date }) {
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [day, setDay] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"rescheduled" | "cancelled" | null>(null);
  const [newStart, setNewStart] = useState<string | null>(null);
  const latest = useRef<string | null>(null);

  async function pickDay(d: Date) {
    const key = ymd(d);
    latest.current = key;
    setDay(d);
    setSlot(null);
    setSlots(null);
    const r = await getAvailableSlots(key);
    if (latest.current === key) setSlots(r);
  }

  async function reschedule() {
    if (!day || !slot) return;
    setBusy(true);
    setError(null);
    const r = await rescheduleConsult({ id, token, date: ymd(day), startsAt: slot.startsAt });
    setBusy(false);
    if (!r.ok) {
      setError(r.message);
      await pickDay(day);
      return;
    }
    setNewStart(r.startsAt ?? slot.startsAt);
    setDone("rescheduled");
  }

  async function cancel() {
    if (!window.confirm("Cancel this assessment?")) return;
    setBusy(true);
    setError(null);
    const r = await cancelConsult({ id, token });
    setBusy(false);
    if (!r.ok) return setError(r.message);
    setDone("cancelled");
  }

  if (done)
    return (
      <div className="mt-8 rounded-xl border border-gold bg-cream p-8 text-center">
        <h2 className="font-serif text-3xl font-medium">{done === "rescheduled" ? "You're rescheduled" : "Cancelled"}</h2>
        <p className="mt-2 text-muted">
          {done === "rescheduled" && newStart
            ? `New time: ${fmtDay(newStart)} at ${fmtTime(newStart)} Pacific. A fresh invite and email are on the way.`
            : "Whenever you're ready, you're welcome to book a new time."}
        </p>
      </div>
    );

  const lastDay = addDays(today, BOOKING_WINDOW_DAYS);
  const canPrev = month > new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= lastDay;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(month.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  const isBookable = (d: Date) => d >= today && d <= lastDay && d.getDay() !== 0;

  return (
    <div className="mt-6 space-y-8">
      <div className="rounded-xl border border-line bg-cream p-6">
        <p className="text-sm text-muted">{missed ? "Your missed appointment" : "Currently booked"}</p>
        <p className="mt-1 font-serif text-2xl font-medium">
          {fmtDay(startsAt)} at {fmtTime(startsAt)} PT
        </p>
        {!missed && meetUrl && (
          <a href={meetUrl} className="mt-2 inline-block break-all text-sm text-gold-dark underline">
            {meetUrl}
          </a>
        )}
      </div>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-medium">Pick a new day</h2>
        <div className="rounded-lg border border-line p-4">
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
            <span className="font-medium">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
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
              <div key={n} className="py-1">
                {n}
              </div>
            ))}
            {cells.map((d, i) =>
              d ? (
                <button
                  key={i}
                  type="button"
                  disabled={!isBookable(d)}
                  onClick={() => pickDay(d)}
                  className={`aspect-square rounded-md text-sm transition-colors disabled:text-charcoal/25 ${
                    day && day.getTime() === d.getTime()
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
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl font-medium">Pick a time</h2>
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
                className={`rounded-md border px-3 py-2.5 text-sm transition-colors ${
                  slot?.startsAt === s.startsAt ? "border-gold bg-gold font-medium text-charcoal" : "border-line hover:border-gold"
                }`}
              >
                {fmtTime(s.startsAt)}
              </button>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-muted">Times are Pacific.</p>
      </section>

      {error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={!slot || busy}
          onClick={reschedule}
          className="h-12 rounded-full bg-gold px-8 font-medium text-charcoal transition-colors duration-150 hover:bg-gold-dark hover:text-white disabled:opacity-40"
        >
          {busy ? "Saving..." : missed ? "Book this time" : "Move my assessment"}
        </button>
        <button type="button" disabled={busy} onClick={cancel} className="text-sm text-muted underline disabled:opacity-40">
          Cancel instead
        </button>
      </div>
    </div>
  );
}
