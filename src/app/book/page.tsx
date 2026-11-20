import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { BookingForm } from "@/components/booking/BookingForm";

export const metadata: Metadata = {
  title: "Book a complimentary assessment | HomeFlow",
};

export default function BookPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <h1 className="font-serif text-4xl font-medium leading-[1.1] sm:text-5xl">Book a complimentary assessment</h1>
        <p className="mt-3 max-w-2xl text-muted">
          A 30-minute video call on Google Meet. Tell Nicholas about your project and share photos if you have them, and he will
          help you work out the next steps. No payment needed.
        </p>
        <BookingForm />
      </main>
      <Footer />
    </>
  );
}
