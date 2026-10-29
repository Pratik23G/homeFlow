"use server";

import { randomUUID } from "node:crypto";
import { getSlotsForDate, type Slot } from "@/lib/availability";
import { createMeetEvent } from "@/lib/google";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getAvailableSlots(dateStr: string): Promise<Slot[]> {
  try {
    return await getSlotsForDate(dateStr);
  } catch (e) {
    console.error("getAvailableSlots failed", e);
    return [];
  }
}

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export type ConsultInput = {
  name: string;
  email: string;
  phone: string;
  city: string;
  description: string;
  date: string; // YYYY-MM-DD, business time zone
  startsAt: string; // ISO, must be one of the open slots for `date`
  photos: { name: string; type: string; size: number }[];
  website?: string; // honeypot: real users leave it empty
};

export type ConsultResult =
  | { ok: true; startsAt: string; meetUrl: string | null; uploads: { path: string; token: string }[] }
  | { ok: false; code: "invalid" | "outside_area" | "slot_taken" | "server"; message: string };

const fail = (code: Extract<ConsultResult, { ok: false }>["code"], message: string): ConsultResult => ({
  ok: false,
  code,
  message,
});

export async function createConsultation(input: ConsultInput): Promise<ConsultResult> {
  // Bots fill the hidden field; pretend success without saving anything.
  if (input.website) return { ok: true, startsAt: input.startsAt, meetUrl: null, uploads: [] };

  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  const city = input.city?.trim();
  const description = input.description?.trim();

  if (!name || name.length > 100) return fail("invalid", "Please enter your name.");
  if (!email || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return fail("invalid", "Please enter a valid email.");
  if (!phone || phone.replace(/\D/g, "").length < 10 || phone.length > 30)
    return fail("invalid", "Please enter a valid phone number.");
  if (!description || description.length > 2000)
    return fail("invalid", "Please tell Nick what you want fixed (up to 2000 characters).");
  if (!Array.isArray(input.photos) || input.photos.length > MAX_PHOTOS)
    return fail("invalid", `You can add up to ${MAX_PHOTOS} photos.`);
  for (const p of input.photos) {
    if (!PHOTO_TYPES.includes(p.type) || p.size > MAX_PHOTO_BYTES)
      return fail("invalid", "Photos must be JPG, PNG, WebP or HEIC, up to 10 MB each.");
  }

  try {
    const db = supabaseAdmin();

    // Service area.
    const { data: cityRow } = await db
      .from("service_cities")
      .select("name")
      .ilike("name", city)
      .eq("active", true)
      .maybeSingle();
    if (!cityRow)
      return fail(
        "outside_area",
        "Sorry, that's outside our area for now. We serve the SF Peninsula, San Francisco to Palo Alto.",
      );

    // Slot must still be open (re-checked on the server, never trusted from the browser).
    const slots = await getSlotsForDate(input.date);
    const slot = slots.find((s) => s.startsAt === new Date(input.startsAt).toISOString());
    if (!slot) return fail("slot_taken", "That time was just taken. Please pick another.");

    // Find or create the client.
    const { data: existing } = await db.from("clients").select("id").ilike("email", email).maybeSingle();
    let clientId = existing?.id as string | undefined;
    if (clientId) {
      await db.from("clients").update({ name, phone, city: cityRow.name }).eq("id", clientId);
    } else {
      const { data: created, error } = await db
        .from("clients")
        .insert({ name, email, phone, city: cityRow.name })
        .select("id")
        .single();
      if (error) throw error;
      clientId = created.id;
    }

    // The exclusion constraint is the final guard against double booking.
    const { data: consult, error: consultError } = await db
      .from("consultations")
      .insert({ client_id: clientId, starts_at: slot.startsAt, ends_at: slot.endsAt, description })
      .select("id")
      .single();
    if (consultError) {
      if (consultError.code === "23P01") return fail("slot_taken", "That time was just taken. Please pick another.");
      throw consultError;
    }

    // Google Calendar event + Meet link; Google emails the invite to the client.
    // A Google failure must not lose the booking, so it is logged and the consult stays saved.
    let meetUrl: string | null = null;
    try {
      const event = await createMeetEvent({
        requestId: consult.id,
        summary: `HomeFlow free kitchen consult: ${name}`,
        description: `What the client wants fixed:\n${description}\n\nPhone: ${phone}\nCity: ${cityRow.name}`,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        attendeeEmail: email,
        attendeeName: name,
      });
      if (event) {
        meetUrl = event.meetUrl;
        await db
          .from("consultations")
          .update({ google_event_id: event.eventId, meet_url: event.meetUrl })
          .eq("id", consult.id);
      }
    } catch (e) {
      console.error("Google Meet creation failed", e);
    }

    // Photos upload straight from the browser to storage (avoids the serverless body-size limit).
    const uploads: { path: string; token: string }[] = [];
    for (const p of input.photos) {
      const safe = p.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
      const path = `${consult.id}/${randomUUID()}-${safe}`;
      const { data, error } = await db.storage.from("consult-photos").createSignedUploadUrl(path);
      if (error || !data) continue;
      await db.from("consultation_photos").insert({ consultation_id: consult.id, storage_path: path });
      uploads.push({ path, token: data.token });
    }

    return { ok: true, startsAt: slot.startsAt, meetUrl, uploads };
  } catch (e) {
    console.error("createConsultation failed", e);
    return fail("server", "Something went wrong on our end. Please try again in a moment.");
  }
}
