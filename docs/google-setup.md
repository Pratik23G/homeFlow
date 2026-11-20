# Google Calendar + Meet + Gmail setup

Creates a Google Meet link for each free consult, emails Nicholas's calendar invite to the client, and sends the
confirmation and reminder emails from Nicholas's Gmail.
Use the Google account whose calendar should hold the consults.

1. https://console.cloud.google.com → create a project named `HomeFlow`.
2. **APIs & Services → Library** → enable **Google Calendar API** and **Gmail API**.
3. **APIs & Services → OAuth consent screen** (Google Auth Platform):
   - User type **External**, app name `HomeFlow`, your email as support/contact.
   - Add yourself/Nicholas under **Test users**.
   - Then **Publish app** (set to "In production"). In "Testing" mode refresh tokens expire after 7 days.
     Unverified is fine for personal use; you will see a "Google hasn't verified this app" screen. Click Advanced → continue.
4. **Credentials → Create credentials → OAuth client ID** → type **Desktop app**. Copy the client ID and secret into `.env`:
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
5. Get the refresh token: `node --env-file=.env scripts/google-auth.mjs`, open the printed URL, sign in as Nicholas's account,
   approve. Paste the printed `GOOGLE_REFRESH_TOKEN=...` line into `.env`.
6. Add all four Google vars to Vercel env vars too.

## If bookings stop getting Meet links

Symptom: new consults have no `meet_url`, and the server log shows `Google token refresh failed: 400 ... invalid_grant`.
The refresh token was revoked or expired (most often: the consent screen was still in **Testing**, which expires
tokens after 7 days, or Nicholas changed his Google password). Fix: make sure the app is **In production** (step 3),
re-run step 5, and replace `GOOGLE_REFRESH_TOKEN` in `.env` and on Vercel.

Adding a new scope (like `gmail.send`) also means re-running step 5: old tokens don't get new scopes.

## Reminder emails

`/api/cron/reminders` emails every client whose consult starts in the next 24 hours, once.
Vercel Cron calls it daily at 15:00 UTC (7–8am Pacific) per `vercel.json`, sending `Authorization: Bearer $CRON_SECRET`.

1. Run `supabase/migrations/0002_consult_reminders.sql` in the Supabase SQL editor.
2. Set `CRON_SECRET` (any long random string, e.g. `openssl rand -hex 32`) in `.env` and on Vercel.
3. Test locally: `curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/reminders`
