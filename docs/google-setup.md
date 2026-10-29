# Google Calendar + Meet setup

Creates a Google Meet link for each free consult and emails Nick's calendar invite to the client.
Use the Google account whose calendar should hold the consults.

1. https://console.cloud.google.com → create a project named `HomeFlow`.
2. **APIs & Services → Library** → enable **Google Calendar API**.
3. **APIs & Services → OAuth consent screen** (Google Auth Platform):
   - User type **External**, app name `HomeFlow`, your email as support/contact.
   - Add yourself/Nick under **Test users**.
   - Then **Publish app** (set to "In production"). In "Testing" mode refresh tokens expire after 7 days.
     Unverified is fine for personal use; you will see a "Google hasn't verified this app" screen. Click Advanced → continue.
4. **Credentials → Create credentials → OAuth client ID** → type **Desktop app**. Copy the client ID and secret into `.env`:
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
5. Get the refresh token: `node --env-file=.env scripts/google-auth.mjs`, open the printed URL, sign in as Nick's account,
   approve. Paste the printed `GOOGLE_REFRESH_TOKEN=...` line into `.env`.
6. Add all four Google vars to Vercel env vars too.
