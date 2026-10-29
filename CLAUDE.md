# HomeFlow

Website for HomeFlow, a kitchen organization and setup business run by Nick. v1 = kitchen only.
Tagline: "Make your home work for you." Closing line: "Your home. In rhythm. By design."
Read AGENTS.md first: this Next.js version has breaking changes; check `node_modules/next/dist/docs/`.

## Stack
Next.js (App Router) + TypeScript + Tailwind v4, `src/` dir, `@/*` alias.
Planned: Supabase (Postgres, auth, photo storage), Stripe (Checkout for deposit, Invoicing for balance, refunds),
Google Calendar API (availability, invites, Meet links), Resend (email), Vercel.
Secrets go in `.env.local` only. Never commit them.

## Brand / design
- Solid colors only, no gradients. Tailwind theme tokens in `src/app/globals.css`: black #000000, white #FFFFFF,
  gold #C68B4A (to be confirmed by Nick; change only the `--color-gold` token).
- Fonts: Cormorant Garamond (`font-serif`, headlines), Manrope (`font-sans`, body), Montserrat (`font-brand`, wordmark).
- Logo: `src/components/Logo.tsx`, inline SVG (house in split white/gold circle, gold waves) + HOME (white) FLOW (gold).
- Image slots use `<Placeholder label="..."/>`. No stock photos, no fake reviews or stats.
- design/ folder (mockup.png, logo-spec.png, colors.jpg, service-area.png) is the visual reference; mockup = layout only.

## Business rules
- Owner: Nick. Service area: SF Peninsula, San Francisco to Palo Alto. 16 cities in `src/lib/content.ts`
  (later: editable DB table, admin add/remove). Validate city/ZIP on the paid booking; friendly "outside our area" message.
- Free consult: 30-min VIDEO call (Google Meet link auto-created via Calendar API, in confirmation email + invite).
  Client describes the problem, optional photos. Nick gives an estimate after the call. No payment.
- Pricing: labor ~ $80/hr (config value). Nick builds a custom estimate per job (hours x rate, materials, other), editable before sending.
- Paid job: $80 deposit via Stripe Checkout at booking; slot confirmed only when deposit paid.
  Balance = final invoice minus deposit (Stripe Invoicing).
- Cancel > 24h before: full deposit refund. Within 24h: deposit kept. Reschedule: deposit carries over as credit.
  24h cutoff is a config value. Show policy at booking, in confirmation email, and on invoice.
- Booking window: 90 days ahead (rolling). Nick can block personal time.
- Config values (deposit, hourly rate, cancel hours, window) live in `src/lib/content.ts` now; move to DB later.

## Conventions
- Sections in `src/components/sections/`, shared UI in `src/components/`, booking UI in `src/components/booking/`.
- Server components by default; `"use client"` only where state is needed.
- Avoid `new Date()` in server components (breaks prerender); compute dates client-side.

## Status
Phase 1 done: landing page + static `/book` UI. Phase 2 done: Supabase schema in `supabase/migrations/0001_init.sql` (tested on Postgres via pglite). Next: connect `/book` to Supabase (save consult requests), then Google Calendar/Meet.

## Run
`npm run dev` -> http://localhost:3000 ; `npm run lint` ; `npm run build`
