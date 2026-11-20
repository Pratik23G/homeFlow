"use server";

import { getSlotsForDate } from "@/lib/availability";
import { sendClientCancelled, sendClientConfirmation, sendOwnerChange } from "@/lib/email";
import { createMeetEvent, deleteEvent, updateEventTimes } from "@/lib/google";
import { loadConsult } from "@/lib/lifecycle";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyLink } from "@/lib/token";

export type ManageResult = { ok: true; startsAt?: string; endsAt?: string } | { ok: false; message: string };
const bad = (message: string): ManageResult => ({ ok: false, message });

/** Only scheduled or no-show consults can be changed. */
async function loadEditable(id: string, token: string) {
  if (!verifyLink(id, "client", token)) return null;
  const c = await loadConsult(id);
  if (!c?.clients || !["scheduled", "no_show"].includes(c.status)) return null;
  return c;
}

export async function rescheduleConsult(input: { id: string; token: string; date: string; startsAt: string }): Promise<ManageResult> {
  try {
    const c = await loadEditable(input.id, input.token);
    if (!c?.clients) return bad("This link is no longer valid. Please reply to your email.");

    const slots = await getSlotsForDate(input.date);
    const slot = slots.find((s) => s.startsAt === new Date(input.startsAt).toISOString());
    if (!slot) return bad("That time was just taken. Please pick another.");

    const db = supabaseAdmin();
    const { error } = await db
      .from("consultations")
      .update({
        starts_at: slot.startsAt,
        ends_at: slot.endsAt,
        status: "scheduled",
        // New time = fresh lifecycle: reminders, Nicholas's check-in and follow-ups all start over.
        reminder_sent_at: null,
        reminder_soon_sent_at: null,
        owner_prompt_sent_at: null,
        owner_nudge_sent_at: null,
        followup_sent_at: null,
        missed_sent_at: null,
        nudge_sent_at: null,
      })
      .eq("id", c.id);
    if (error) {
      if (error.code === "23P01") return bad("That time was just taken. Please pick another.");
      throw error;
    }

    // Calendar: move the event (Google emails the client). A Google failure must not undo the change.
    let meetUrl = c.meet_url;
    try {
      if (c.google_event_id) await updateEventTimes(c.google_event_id, slot.startsAt, slot.endsAt);
      else {
        const ev = await createMeetEvent({
          requestId: `${c.id}-r`,
          summary: `HomeFlow complimentary assessment: ${c.clients.name}`,
          description: `Rescheduled by the client.\nPhone: ${c.clients.phone ?? ""}`,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          attendeeEmail: c.clients.email,
          attendeeName: c.clients.name,
        });
        if (ev) {
          meetUrl = ev.meetUrl;
          await db.from("consultations").update({ google_event_id: ev.eventId, meet_url: ev.meetUrl }).eq("id", c.id);
        }
      }
    } catch (e) {
      console.error("Google reschedule failed", e);
    }

    const results = await Promise.allSettled([
      sendClientConfirmation({
        consultationId: c.id,
        rescheduled: true,
        to: c.clients.email,
        name: c.clients.name,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        meetUrl,
      }),
      sendOwnerChange({
        kind: "rescheduled",
        name: c.clients.name,
        email: c.clients.email,
        phone: c.clients.phone ?? "",
        oldStartsAt: c.starts_at,
        newStartsAt: slot.startsAt,
      }),
    ]);
    results.forEach((r) => r.status === "rejected" && console.error("Email failed", r.reason));
    return { ok: true, startsAt: slot.startsAt, endsAt: slot.endsAt };
  } catch (e) {
    console.error("rescheduleConsult failed", e);
    return bad("Something went wrong on our end. Please try again in a moment.");
  }
}

export async function cancelConsult(input: { id: string; token: string }): Promise<ManageResult> {
  try {
    const c = await loadEditable(input.id, input.token);
    if (!c?.clients) return bad("This link is no longer valid. Please reply to your email.");
    const { error } = await supabaseAdmin().from("consultations").update({ status: "cancelled" }).eq("id", c.id);
    if (error) throw error;
    try {
      if (c.google_event_id) await deleteEvent(c.google_event_id);
    } catch (e) {
      console.error("Google cancel failed", e);
    }
    const results = await Promise.allSettled([
      sendClientCancelled({ to: c.clients.email, name: c.clients.name }),
      sendOwnerChange({
        kind: "cancelled",
        name: c.clients.name,
        email: c.clients.email,
        phone: c.clients.phone ?? "",
        oldStartsAt: c.starts_at,
      }),
    ]);
    results.forEach((r) => r.status === "rejected" && console.error("Email failed", r.reason));
    return { ok: true };
  } catch (e) {
    console.error("cancelConsult failed", e);
    return bad("Something went wrong on our end. Please try again in a moment.");
  }
}
