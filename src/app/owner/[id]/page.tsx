import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import type { OwnerAction } from "@/lib/email";
import { loadConsult, ownerMark } from "@/lib/lifecycle";
import { verifyLink } from "@/lib/token";
import { BUSINESS_TZ } from "@/lib/time";

export const metadata: Metadata = { title: "Consult | HomeFlow", robots: { index: false } };

const ACTIONS: Record<OwnerAction, { title: string; body: string; button: string; done: string }> = {
  done: {
    title: "We met: send the project form?",
    body: "The client gets a thank-you email with the project details form and payment info.",
    button: "Send project form",
    done: "Marked completed. The client was emailed the project form.",
  },
  noshow: {
    title: "Mark as no-show?",
    body: "The client gets a friendly email with a link to pick a new time. Nothing else is lost.",
    button: "Mark no-show and send reschedule link",
    done: "Marked no-show. The client was emailed a link to rebook.",
  },
  skip: {
    title: "Close without emailing?",
    body: "The consult is marked completed and the client is not emailed.",
    button: "Close without emailing",
    done: "Closed. No email was sent.",
  },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: BUSINESS_TZ,
  });

async function OwnerBody({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ a?: string; t?: string; err?: string }>;
}) {
  const { id } = await params;
  const { a, t, err } = await searchParams;
  const action = a as OwnerAction;
  const valid = verifyLink(id, "owner", t) && action in ACTIONS;
  const c = valid ? await loadConsult(id) : null;
  const copy = valid ? ACTIONS[action] : null;

  async function confirm() {
    "use server";
    const r = await ownerMark(id, action);
    redirect(`/owner/${id}?a=${action}&t=${t}${r.ok ? "" : "&err=1"}`);
  }

  return !c || !copy ? (
      <p className="rounded-xl border border-line bg-cream p-6 text-muted">This link isn&apos;t valid or has expired.</p>
    ) : (
      <div className="rounded-xl border border-line bg-cream p-8">
        <p className="text-sm text-muted">
          {c.clients?.name} &middot; {fmt(c.starts_at)} PT
        </p>
        {c.status === "scheduled" ? (
          <>
            <h1 className="mt-2 font-serif text-3xl font-medium">{copy.title}</h1>
            <p className="mt-3 text-muted">{copy.body}</p>
            {err && <p className="mt-3 text-sm text-red-800">Couldn&apos;t send the email. Nothing changed; try again.</p>}
            <form action={confirm} className="mt-6">
              <button className="h-12 rounded-full bg-gold px-6 text-[15px] font-medium text-charcoal transition-colors duration-150 hover:bg-gold-dark hover:text-white">
                {copy.button}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="mt-2 font-serif text-3xl font-medium">Done</h1>
            <p className="mt-3 text-muted">
              {c.status === "no_show" && "Marked no-show. The client was emailed a link to rebook."}
              {c.status === "completed" && (c.followup_sent_at ? copy.done : "Marked completed.")}
              {c.status === "cancelled" && "This consult was cancelled by the client."}
            </p>
          </>
        )}
      </div>
    );
}

export default function OwnerPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ a?: string; t?: string; err?: string }>;
}) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-xl px-5 py-12">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-cream" />}>
          <OwnerBody {...props} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
