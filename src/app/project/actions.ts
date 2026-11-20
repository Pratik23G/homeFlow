"use server";

import { sendOwnerProjectRequest } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProjectInput = {
  consultationId: string;
  address: string;
  scope: string;
  timing: string;
  payMethod: string;
  website?: string; // honeypot
};
export type ProjectResult = { ok: true } | { ok: false; message: string };

export async function submitProjectRequest(input: ProjectInput): Promise<ProjectResult> {
  if (input.website) return { ok: true };
  const address = input.address?.trim();
  const scope = input.scope?.trim();
  const timing = input.timing?.trim() || null;
  const payMethod = ["zelle", "venmo", "apple_pay"].includes(input.payMethod) ? input.payMethod : null;
  if (!UUID.test(input.consultationId ?? "")) return { ok: false, message: "This link isn't valid. Please reply to your email." };
  if (!address || address.length > 300) return { ok: false, message: "Please enter the project address or ZIP code." };
  if (!scope || scope.length > 3000) return { ok: false, message: "Please describe the project (up to 3000 characters)." };
  if (timing && timing.length > 200) return { ok: false, message: "Preferred timing is too long." };

  try {
    const db = supabaseAdmin();
    const { data: c } = await db
      .from("consultations")
      .select("id,clients(name,email,phone)")
      .eq("id", input.consultationId)
      .maybeSingle();
    const client = (c as unknown as { clients: { name: string; email: string; phone: string } | null } | null)?.clients;
    if (!c || !client) return { ok: false, message: "We couldn't find your consultation. Please reply to your email." };
    const { error } = await db
      .from("project_requests")
      .insert({ consultation_id: c.id, address, scope, timing, pay_method: payMethod });
    if (error) throw error;
    await sendOwnerProjectRequest({ ...client, address, scope, timing, payMethod }).catch((e) =>
      console.error("Owner project email failed", e),
    );
    return { ok: true };
  } catch (e) {
    console.error("submitProjectRequest failed", e);
    return { ok: false, message: "Something went wrong on our end. Please try again in a moment." };
  }
}
