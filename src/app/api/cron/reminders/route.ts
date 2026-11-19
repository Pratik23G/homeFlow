import { sendClientReminder } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** How far ahead to look. The cron runs daily, so 24h covers every consult before the next run. */
const LOOKAHEAD_HOURS = 24;

type Due = {
  id: string;
  starts_at: string;
  ends_at: string;
  meet_url: string | null;
  clients: { name: string; email: string } | null;
};

/**
 * Sends reminder emails for consults starting in the next 24 hours.
 * Called by Vercel Cron (see vercel.json), which sends `Authorization: Bearer $CRON_SECRET`.
 * Run by hand: curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const now = new Date();
  const until = new Date(now.getTime() + LOOKAHEAD_HOURS * 3600_000);
  const { data, error } = await db
    .from("consultations")
    .select("id,starts_at,ends_at,meet_url,clients(name,email)")
    .eq("status", "scheduled")
    .is("reminder_sent_at", null)
    .gt("starts_at", now.toISOString())
    .lte("starts_at", until.toISOString())
    .order("starts_at");
  if (error) {
    console.error("Reminder lookup failed", error);
    return Response.json({ error: "lookup failed" }, { status: 500 });
  }

  let sent = 0;
  const failed: string[] = [];
  for (const c of (data ?? []) as unknown as Due[]) {
    if (!c.clients?.email) continue;
    // Claim the row first so overlapping runs can't email the same client twice.
    const { data: claimed } = await db
      .from("consultations")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", c.id)
      .is("reminder_sent_at", null)
      .select("id");
    if (!claimed?.length) continue;
    try {
      await sendClientReminder({
        to: c.clients.email,
        name: c.clients.name,
        startsAt: c.starts_at,
        endsAt: c.ends_at,
        meetUrl: c.meet_url,
      });
      sent++;
    } catch (e) {
      console.error("Reminder send failed", c.id, e);
      failed.push(c.id);
      // Release the claim so the next run retries.
      await db.from("consultations").update({ reminder_sent_at: null }).eq("id", c.id);
    }
  }
  return Response.json({ sent, failed: failed.length });
}
