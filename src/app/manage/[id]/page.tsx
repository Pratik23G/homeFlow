import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ManageConsult } from "@/components/booking/ManageConsult";
import { loadConsult } from "@/lib/lifecycle";
import { verifyLink } from "@/lib/token";

export const metadata: Metadata = { title: "Manage your assessment | HomeFlow", robots: { index: false } };

async function ManageBody({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t } = await searchParams;
  const c = verifyLink(id, "client", t) ? await loadConsult(id) : null;
  const editable = !!c && ["scheduled", "no_show"].includes(c.status);

  return !c ? (
    <p className="mt-6 rounded-xl border border-line bg-cream p-6 text-muted">
      This link isn&apos;t valid. Please reply to your email and Nicholas will help.
    </p>
  ) : !editable ? (
    <p className="mt-6 rounded-xl border border-line bg-cream p-6 text-muted">
      {c.status === "cancelled"
        ? "This assessment was cancelled. You can book a new time any time from the Book an Assessment button."
        : "This assessment is already complete. If you need anything, just reply to your email."}
    </p>
  ) : (
    <ManageConsult id={id} token={t!} startsAt={c.starts_at} meetUrl={c.meet_url} missed={c.status === "no_show"} />
  );
}

export default function ManagePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-serif text-4xl font-medium leading-[1.1] sm:text-5xl">Your assessment</h1>
        <Suspense fallback={<div className="mt-6 h-64 animate-pulse rounded-lg bg-cream" />}>
          <ManageBody {...props} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
