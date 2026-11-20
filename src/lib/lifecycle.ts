import "server-only";
import { sendClientFollowUp, sendClientMissed, type OwnerAction } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ConsultRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  meet_url: string | null;
  google_event_id: string | null;
  followup_sent_at: string | null;
  missed_sent_at: string | null;
  clients: { name: string; email: string; phone: string | null } | null;
};

export async function loadConsult(id: string): Promise<ConsultRow | null> {
  if (!UUID.test(id)) return null;
  const { data } = await supabaseAdmin()
    .from("consultations")
    .select("id,starts_at,ends_at,status,meet_url,google_event_id,followup_sent_at,missed_sent_at,clients(name,email,phone)")
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as ConsultRow | null) ?? null;
}

/**
 * Nicholas's answer after a call. Only a still-'scheduled' consult can be marked, and the status
 * change is the claim, so a double click (or a second device) can't email the client twice.
 */
export async function ownerMark(id: string, action: OwnerAction): Promise<{ ok: boolean }> {
  const c = await loadConsult(id);
  if (!c?.clients || c.status !== "scheduled") return { ok: false };
  const db = supabaseAdmin();
  const now = new Date().toISOString();
  const status = action === "noshow" ? "no_show" : "completed";
  const stamps =
    action === "done" ? { followup_sent_at: now } : action === "noshow" ? { missed_sent_at: now } : { followup_sent_at: now, nudge_sent_at: now };

  const { data: claimed } = await db
    .from("consultations")
    .update({ status, ...stamps })
    .eq("id", id)
    .eq("status", "scheduled")
    .select("id");
  if (!claimed?.length) return { ok: false };

  try {
    if (action === "done") await sendClientFollowUp({ to: c.clients.email, name: c.clients.name, consultationId: id });
    if (action === "noshow") await sendClientMissed({ to: c.clients.email, name: c.clients.name, consultationId: id });
  } catch (e) {
    console.error("Owner action email failed", id, action, e);
    // Undo, so Nicholas can tap again once email works.
    await db
      .from("consultations")
      .update({ status: "scheduled", followup_sent_at: null, missed_sent_at: null, nudge_sent_at: null })
      .eq("id", id);
    return { ok: false };
  }
  return { ok: true };
}
