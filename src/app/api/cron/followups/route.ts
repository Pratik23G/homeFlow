import {
  sendClientMissed,
  sendClientProjectNudge,
  sendOwnerConsultCheck,
} from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Ask Nicholas how the call went this long after it was due to end. */
const PROMPT_DELAY_MIN = 30;
/** If Nicholas hasn't answered, ask once more after this long. */
const OWNER_NUDGE_HOURS = 24;
/** Nudge a client who hasn't acted (project form / rebooking) after this long. */
const CLIENT_NUDGE_DAYS = 2;
/** Never email about consults older than this (downtime guard). */
const MAX_AGE_DAYS = 14;

type Row = {
  id: string;
  starts_at: string;
  clients: { name: string; email: string; phone: string | null } | null;
};
const SELECT = "id,starts_at,clients(name,email,phone)";

/**
 * After-call workflow. Safe to call often (every 15 min is ideal); each step claims a stamp column first.
 *  1. Consult ended -> email Nicholas "how did it go?" (buttons: we met / no-show / skip).
 *  2. Nicholas hasn't answered after 24h -> ask once more.
 *  3. Client met but never sent project details -> one gentle nudge.
 *  4. No-show client never rebooked -> one gentle nudge.
 * The client's own emails (project form, "we missed you") are sent when Nicholas answers, see /owner/[id].
 * Run by hand: curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/followups
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const min = 60_000, hour = 3600_000, day = 86400_000;
  const oldest = iso(now - MAX_AGE_DAYS * day);
  const counts = { ownerPrompt: 0, ownerNudge: 0, projectNudge: 0, missedNudge: 0 };
  const failed: string[] = [];

  /** Claim `column`, run `send`; on failure release the claim so the next run retries. */
  async function claimAndSend(id: string, column: string, send: () => Promise<void>, counter: keyof typeof counts) {
    const { data: claimed } = await db
      .from("consultations")
      .update({ [column]: new Date().toISOString() })
      .eq("id", id)
      .is(column, null)
      .select("id");
    if (!claimed?.length) return;
    try {
      await send();
      counts[counter]++;
    } catch (e) {
      console.error(`Follow-up step ${counter} failed`, id, e);
      failed.push(id);
      await db.from("consultations").update({ [column]: null }).eq("id", id);
    }
  }

  // 1 + 2. Ask Nicholas.
  const [prompt, nudge] = await Promise.all([
    db
      .from("consultations")
      .select(SELECT)
      .eq("status", "scheduled")
      .is("owner_prompt_sent_at", null)
      .lte("ends_at", iso(now - PROMPT_DELAY_MIN * min))
      .gt("ends_at", iso(now - 3 * day))
      .order("ends_at"),
    db
      .from("consultations")
      .select(SELECT)
      .eq("status", "scheduled")
      .not("owner_prompt_sent_at", "is", null)
      .lte("owner_prompt_sent_at", iso(now - OWNER_NUDGE_HOURS * hour))
      .is("owner_nudge_sent_at", null)
      .gt("ends_at", oldest)
      .order("ends_at"),
  ]);
  for (const [rows, column, counter, reminder] of [
    [prompt.data, "owner_prompt_sent_at", "ownerPrompt", false],
    [nudge.data, "owner_nudge_sent_at", "ownerNudge", true],
  ] as const) {
    for (const c of (rows ?? []) as unknown as Row[]) {
      if (!c.clients) continue;
      const cl = c.clients;
      await claimAndSend(
        c.id,
        column,
        () =>
          sendOwnerConsultCheck({
            consultationId: c.id,
            name: cl.name,
            email: cl.email,
            phone: cl.phone ?? "",
            startsAt: c.starts_at,
            reminder,
          }),
        counter,
      );
    }
  }

  // 3. Met, but no project details yet.
  const { data: met } = await db
    .from("consultations")
    .select(SELECT)
    .eq("status", "completed")
    .not("followup_sent_at", "is", null)
    .lte("followup_sent_at", iso(now - CLIENT_NUDGE_DAYS * day))
    .is("nudge_sent_at", null)
    .gt("ends_at", oldest);
  const metRows = (met ?? []) as unknown as Row[];
  if (metRows.length) {
    const { data: answered } = await db
      .from("project_requests")
      .select("consultation_id")
      .in("consultation_id", metRows.map((r) => r.id));
    const done = new Set((answered ?? []).map((r) => r.consultation_id as string));
    for (const c of metRows) {
      if (!c.clients || done.has(c.id)) continue;
      const cl = c.clients;
      await claimAndSend(
        c.id,
        "nudge_sent_at",
        () => sendClientProjectNudge({ to: cl.email, name: cl.name, consultationId: c.id }),
        "projectNudge",
      );
    }
  }

  // 4. No-show who never rebooked (rebooking flips status back to 'scheduled' and resets the stamps).
  const { data: missed } = await db
    .from("consultations")
    .select(SELECT)
    .eq("status", "no_show")
    .not("missed_sent_at", "is", null)
    .lte("missed_sent_at", iso(now - CLIENT_NUDGE_DAYS * day))
    .is("nudge_sent_at", null)
    .gt("ends_at", oldest);
  for (const c of (missed ?? []) as unknown as Row[]) {
    if (!c.clients) continue;
    const cl = c.clients;
    await claimAndSend(
      c.id,
      "nudge_sent_at",
      () => sendClientMissed({ to: cl.email, name: cl.name, consultationId: c.id, nudge: true }),
      "missedNudge",
    );
  }

  return Response.json({ ...counts, failed: failed.length });
}
