"use client";

import { useState, useTransition } from "react";
import { submitProjectRequest } from "@/app/project/actions";

const field =
  "w-full rounded-lg border border-line bg-cream px-4 py-3 text-charcoal placeholder:text-charcoal/40 focus:border-gold focus:outline-none";

export function ProjectForm({ consultationId }: { consultationId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done)
    return (
      <div className="rounded-xl border border-gold bg-cream p-8 text-center">
        <h2 className="font-serif text-3xl font-medium">Thank you</h2>
        <p className="mt-2 text-muted">
          Your project details are in. Nicholas will review them and send your personalized estimate soon.
        </p>
      </div>
    );

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const r = await submitProjectRequest({
            consultationId,
            address: String(f.get("address") ?? ""),
            scope: String(f.get("scope") ?? ""),
            timing: String(f.get("timing") ?? ""),
            payMethod: String(f.get("payMethod") ?? ""),
            website: String(f.get("website") ?? ""),
          });
          if (r.ok) setDone(true);
          else setError(r.message);
        });
      }}
    >
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Project address or ZIP</span>
        <input name="address" required maxLength={300} className={field} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Project details</span>
        <textarea name="scope" required rows={5} maxLength={3000} className={field} placeholder="What would you like done, and where?" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Preferred timing (optional)</span>
        <input name="timing" maxLength={200} className={field} placeholder="e.g. weekdays, within the next month" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">How would you like to pay? (optional)</span>
        <select name="payMethod" defaultValue="" className={field}>
          <option value="">Decide later</option>
          <option value="zelle">Zelle</option>
          <option value="venmo">Venmo</option>
          <option value="apple_pay">Apple Pay</option>
        </select>
      </label>
      {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-gold px-6 text-[15px] font-medium text-charcoal transition-colors duration-150 hover:bg-gold-dark hover:text-white disabled:opacity-40"
      >
        {pending ? "Sending..." : "Send project details"}
      </button>
    </form>
  );
}
