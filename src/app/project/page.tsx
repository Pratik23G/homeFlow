import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { PaymentMethods } from "@/components/PaymentMethods";
import { ProjectForm } from "@/components/ProjectForm";
import { CANCEL_HOURS, DEPOSIT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Share your project details | HomeFlow",
  robots: { index: false },
};

async function FormArea({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  return c ? (
    <ProjectForm consultationId={c} />
  ) : (
    <p className="rounded-xl border border-line bg-cream p-6 text-muted">
      Please use the link in your follow-up email, or reply to it and Nicholas will help.
    </p>
  );
}

export default function ProjectPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-serif text-4xl font-medium leading-[1.1] sm:text-5xl">Share your project details</h1>
        <p className="mt-3 text-muted">
          Thank you for speaking with Nicholas. A few details help him prepare an estimate based on the scope of your project.
        </p>
        <div className="mt-8">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-cream" />}>
            <FormArea searchParams={searchParams} />
          </Suspense>
        </div>
        <h2 className="mt-14 font-serif text-3xl font-medium">How payment works</h2>
        <p className="mt-2 text-sm text-muted">
          A ${DEPOSIT} booking deposit holds your date and is applied to your final bill. If you cancel more than {CANCEL_HOURS} hours
          before, the deposit is refunded. Nicholas accepts:
        </p>
        <div className="mt-5"><PaymentMethods /></div>
      </main>
      <Footer />
    </>
  );
}
