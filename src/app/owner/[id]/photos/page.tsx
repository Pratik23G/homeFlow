import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { UUID, loadConsult } from "@/lib/lifecycle";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BUSINESS_TZ } from "@/lib/time";
import { verifyLink } from "@/lib/token";

export const metadata: Metadata = { title: "Client photos | HomeFlow", robots: { index: false } };

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: BUSINESS_TZ,
  });

/** Photos live in a private bucket, so each visit mints fresh short-lived links (the email link never expires). */
async function PhotosBody({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t } = await searchParams;
  if (!UUID.test(id) || !verifyLink(id, "owner", t)) {
    return <p className="rounded-xl border border-line bg-cream p-6 text-muted">This link isn&apos;t valid.</p>;
  }
  const c = await loadConsult(id);
  const db = supabaseAdmin();
  const { data: rows } = await db
    .from("consultation_photos")
    .select("storage_path")
    .eq("consultation_id", id)
    .order("created_at");
  const paths = (rows ?? []).map((r) => r.storage_path as string);
  const { data: signed } = paths.length
    ? await db.storage.from("consult-photos").createSignedUrls(paths, 3600)
    : { data: [] };
  // Rows exist from booking time; files only exist once the client's browser finished uploading.
  const urls = (signed ?? []).flatMap((s) => (s.signedUrl && !s.error ? [s.signedUrl] : []));

  return (
    <>
      {c?.clients && (
        <p className="mt-3 text-muted">
          {c.clients.name} &middot; {fmt(c.starts_at)} PT
        </p>
      )}
      {urls.length === 0 ? (
        <p className="mt-6 rounded-xl border border-line bg-cream p-6 text-muted">
          No photos have arrived yet. If the client just booked, refresh in a moment.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {urls.map((u, i) => (
            <li key={u}>
              <a href={u} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL from a private bucket */}
                <img src={u} alt={`Client photo ${i + 1}`} loading="lazy" className="h-auto w-full" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function PhotosPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-serif text-4xl font-medium leading-[1.1] sm:text-5xl">Client photos</h1>
        <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-xl bg-cream" />}>
          <PhotosBody {...props} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
