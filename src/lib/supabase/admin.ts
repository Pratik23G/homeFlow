import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Service-role client: bypasses RLS. Server code only. */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars. See .env.example.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
