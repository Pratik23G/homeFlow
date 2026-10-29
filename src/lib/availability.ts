import "server-only";
import { getGoogleBusy } from "@/lib/google";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { addDaysStr, localDateString, localToUtc, weekdayOf } from "@/lib/time";

/** Earliest a client may book, measured from now. */
const MIN_LEAD_HOURS = 2;

export type Slot = { startsAt: string; endsAt: string };

async function getConfigNumber(key: string, fallback: number): Promise<number> {
  const { data } = await supabaseAdmin().from("app_config").select("value").eq("key", key).maybeSingle();
  const n = Number(data?.value);
  return Number.isFinite(n) ? n : fallback;
}

/** Open consult slots for one calendar day (business time zone). */
export async function getSlotsForDate(dateStr: string): Promise<Slot[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return [];

  const db = supabaseAdmin();
  const now = new Date();
  const today = localDateString(now);
  const windowDays = await getConfigNumber("booking_window_days", 90);
  if (dateStr < today || dateStr > addDaysStr(today, windowDays)) return [];

  const consultMinutes = await getConfigNumber("consult_minutes", 30);
  const { data: hours } = await db
    .from("working_hours")
    .select("start_time,end_time")
    .eq("weekday", weekdayOf(dateStr));
  if (!hours?.length) return [];

  // Candidate slots from working hours.
  const candidates: { start: Date; end: Date }[] = [];
  const earliest = now.getTime() + MIN_LEAD_HOURS * 3600_000;
  for (const h of hours) {
    const [sh, sm] = h.start_time.split(":").map(Number);
    const [eh, em] = h.end_time.split(":").map(Number);
    const endMin = eh * 60 + em;
    for (let t = sh * 60 + sm; t + consultMinutes <= endMin; t += consultMinutes) {
      const start = localToUtc(dateStr, Math.floor(t / 60), t % 60);
      const end = new Date(start.getTime() + consultMinutes * 60_000);
      if (start.getTime() >= earliest) candidates.push({ start, end });
    }
  }
  if (!candidates.length) return [];

  // Everything that already occupies time around that day.
  const from = new Date(Math.min(...candidates.map((c) => c.start.getTime()))).toISOString();
  const to = new Date(Math.max(...candidates.map((c) => c.end.getTime()))).toISOString();
  const [consults, jobs, blocks] = await Promise.all([
    db.from("consultations").select("starts_at,ends_at").eq("status", "scheduled").lt("starts_at", to).gt("ends_at", from),
    db.from("jobs").select("starts_at,ends_at").in("status", ["pending_deposit", "confirmed"]).lt("starts_at", to).gt("ends_at", from),
    db.from("time_blocks").select("starts_at,ends_at").lt("starts_at", to).gt("ends_at", from),
  ]);
  const busy = [...(consults.data ?? []), ...(jobs.data ?? []), ...(blocks.data ?? [])].map((b) => ({
    s: new Date(b.starts_at).getTime(),
    e: new Date(b.ends_at).getTime(),
  }));
  // Nick's own Google Calendar. If Google is down, fall back to the database only.
  try {
    busy.push(...(await getGoogleBusy(from, to)));
  } catch (e) {
    console.error("Google busy lookup failed", e);
  }

  return candidates
    .filter((c) => !busy.some((b) => c.start.getTime() < b.e && c.end.getTime() > b.s))
    .map((c) => ({ startsAt: c.start.toISOString(), endsAt: c.end.toISOString() }));
}
