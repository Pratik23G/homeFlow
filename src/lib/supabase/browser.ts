import { createClient } from "@supabase/supabase-js";

/** Public client for the browser. Used only for signed photo uploads for now. */
export function supabaseBrowser() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
