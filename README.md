# HomeFlow

**Residential operations management. Make your home work for you.**

HomeFlow is a kitchen organization and setup service on the San Francisco Peninsula, run by Nick. Nick helps homeowners get their kitchens working: organized cabinets and pantries, the right fixtures and hardware, small repairs, and layout fixes that make daily routines easier.

This repository is the HomeFlow website and booking system. Clients learn what HomeFlow does, book a free consult, book a paid job, and pay online. Nick manages clients, estimates and invoices from a private admin area.

> *Your home. In rhythm. By design.*

## What HomeFlow does

Kitchen services:

- **Cabinet & pantry organization:** storage, containers and systems so everything has a place.
- **Fixtures & hardware:** faucets, pulls, handles, lighting and other swap-outs.
- **Small repairs:** hinges, drawers, loose fittings and the fix-it list that keeps growing.
- **Layout & flow fixes:** rework how you move and work in the space.

More rooms are planned after kitchens.

## How it works for a client

1. **Free video consult.** A 30-minute Google Meet call. The client books a time, describes what they want fixed, and can upload photos. Nick gives an estimate on the call. No payment.
2. **Book a date.** The client picks a day up to 90 days ahead and pays an $80 deposit through Stripe Checkout. The slot is confirmed once the deposit is paid. The deposit is applied to the final bill.
3. **Nick does the work.** Nick sends an invoice by email and the client pays online. The invoice total is reduced by the deposit.
4. **Feedback.** After the job, the client can leave feedback and is pointed to HomeFlow's Google and Yelp review pages. No incentives are tied to reviews.

## Pricing and policies

| | |
|---|---|
| Free consult | $0 (30-minute video call) |
| Booking deposit | $80, applied to the final bill |
| Labor | about $80/hour. The final price depends on scope. |

Nick builds a custom estimate for each job from labor (hours × rate), materials and other line items, and can edit it before sending.

**Cancellation and rescheduling**

- Cancel more than 24 hours before the job: the deposit is fully refunded.
- Cancel within 24 hours: the deposit is kept.
- Reschedule: the deposit carries over to the new time.

The policy is shown at booking, in the confirmation email and on the invoice.

## Service area

San Francisco to Palo Alto: San Francisco, Daly City, Colma, Brisbane, South San Francisco, San Bruno, Millbrae, Burlingame, San Mateo, Belmont, San Carlos, Redwood City, Atherton, Menlo Park, East Palo Alto and Palo Alto.

Job addresses are checked against this list at booking. Anything outside it gets a friendly "outside our area" message.

![HomeFlow service area, San Francisco to Palo Alto](public/images/service-area.png)

## The site

**Public pages**

- Landing page: hero, kitchen services, how it works, pricing and cancellation, work showcase, service area, Meet Nick, review links and FAQ.
- `/book`: pick a day, pick a 30-minute slot, enter contact details and what needs fixing, optionally add photos.

**Admin area (owner only, behind login)**

- Client registry with visit history and status: lead, consulted, active, completed.
- Stats: free consults done, new clients, jobs completed.
- Estimates: build, edit and send. Accept or decline a job after the consult.
- Invoices: create, email, track paid and unpaid.
- Availability: block off personal time.
- Service area list, rates and policy values editable without code changes.
- Calendar invites sent automatically when a job is scheduled.

## Brand

Black background, white text, gold accent (`#C68B4A`, pending confirmation). Solid colors only, no gradients.
Headlines in Cormorant Garamond, body in Manrope, wordmark in Montserrat.
Photos of Nick's work are being collected and will replace the labelled placeholders on the site.

## Tech stack

- [Next.js](https://nextjs.org) (App Router), TypeScript, Tailwind CSS
- [Supabase](https://supabase.com): Postgres, auth, photo storage (schema in `supabase/`)
- [Stripe](https://stripe.com): Checkout for deposits, Invoicing for final bills, refunds
- Google Calendar API: availability, invites and Meet links
- [Resend](https://resend.com): transactional email
- Hosted on [Vercel](https://vercel.com)

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in values; never commit this file
npm run dev
```

Open http://localhost:3000. Other commands: `npm run lint`, `npm run build`.

Database setup: see [`supabase/README.md`](supabase/README.md).
