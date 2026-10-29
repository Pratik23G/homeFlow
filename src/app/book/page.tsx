import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { BookingForm } from "@/components/booking/BookingForm";

export const metadata: Metadata = {
  title: "Book a free kitchen consult | HomeFlow",
};

export default function BookPage() {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" aria-label="HomeFlow home">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-white/80 hover:text-gold">
            ← Back to site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="font-serif text-4xl font-semibold sm:text-5xl">Book a free kitchen consult</h1>
        <p className="mt-3 max-w-2xl text-muted">
          A 30-minute video call on Google Meet. Tell Nick what you want fixed and he&apos;ll give you an
          estimate. No payment needed.
        </p>
        <BookingForm />
      </main>
      <Footer />
    </>
  );
}
