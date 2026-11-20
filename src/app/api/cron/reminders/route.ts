import { sendClientReminder } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** "Tomorrow" reminder goes to consults starting within this window... */
const REMINDER_HOURS = 24;
/** ...and "starting soon" to anything closer than this, so no consult falls between the two. */
const SOON_HOURS = 2;
/** Don't send "starting soon" right after someone books a near-term slot; the confirmation just went out. */
const MIN_AGE_MINUTES = 60;

type Due = {
  id: string;
  starts_at: string;
  ends_at: string;
  meet_url: string | null;
  clients: { name: string; email: string } | null;
};

/**
 * Reminder emails to clients. Safe to call as often as you like (every 15 min is ideal):
 * each stamp column is claimed before sending, so a client is never emailed twice.
 * Run by hand: curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const h = 3600_000;
  const select = "id,starts_at,ends_at,meet_url,clients(name,email)";

  const [early, soon] = await Promise.all([
    db
      .from("consultations")
      .select(select)
      .eq("status", "scheduled")
      .is("reminder_sent_at", null)
      .gt("starts_at", iso(now + SOON_HOURS * h))
      .lte("starts_at", iso(now + REMINDER_HOURS * h))
      .order("starts_at"),
    db
      .from("consultations")
      .select(select)
      .eq("status", "scheduled")
      .is("reminder_soon_sent_at", null)
      .gt("starts_at", iso(now))
      .lte("starts_at", iso(now + SOON_HOURS * h))
      .lt("created_at", iso(now - MIN_AGE_MINUTES * 60_000))
      .order("starts_at"),
  ]);
  if (early.error || soon.error) {
    console.error("Reminder lookup failed", early.error ?? soon.error);
    return Response.json({ error: "lookup failed" }, { status: 500 });
  }

  const sent = { early: 0, soon: 0 };
  const failed: string[] = [];
  const run = async (rows: Due[], column: "reminder_sent_at" | "reminder_soon_sent_at", isSoon: boolean) => {
    for (const c of rows) {
      if (!c.clients?.email) continue;
      // Claim the row first so overlapping runs can't email the same client twice.
      const { data: claimed } = await db
        .from("consultations")
        .update({ [column]: new Date().toISOString() })
        .eq("id", c.id)
        .is(column, null)
        .select("id");
      if (!claimed?.length) continue;
      try {
        await sendClientReminder({
          consultationId: c.id,
          soon: isSoon,
          to: c.clients.email,
          name: c.clients.name,
          startsAt: c.starts_at,
          endsAt: c.ends_at,
          meetUrl: c.meet_url,
        });
        sent[isSoon ? "soon" : "early"]++;
      } catch (e) {
        console.error("Reminder send failed", c.id, e);
        failed.push(c.id);
        await db.from("consultations").update({ [column]: null }).eq("id", c.id); // retry next run
      }
    }
  };
  await run((early.data ?? []) as unknown as Due[], "reminder_sent_at", false);
  await run((soon.data ?? []) as unknown as Due[], "reminder_soon_sent_at", true);
  return Response.json({ sent, failed: failed.length });
}
