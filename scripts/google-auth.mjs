// One-time helper: gets a Google refresh token for the calendar owner (Nick).
// Run:  node --env-file=.env scripts/google-auth.mjs
// Then sign in as the Google account whose calendar should hold the consults.
import http from "node:http";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.");
  process.exit(1);
}

const PORT = 3456;
const redirectUri = `http://localhost:${PORT}`;
const scope = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
].join(" ");

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent", // forces a refresh token to be issued
  });

console.log("\nOpen this URL in your browser and approve access:\n\n" + authUrl + "\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirectUri);
  const code = url.searchParams.get("code");
  if (!code) {
    res.end("Waiting for Google...");
    return;
  }
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const json = await tokenRes.json();
  if (!json.refresh_token) {
    res.end("No refresh token returned. See the terminal.");
    console.error("Failed:", json);
  } else {
    res.end("Done. You can close this tab and go back to the terminal.");
    console.log("\nAdd this line to .env (keep it secret):\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${json.refresh_token}\n`);
  }
  server.close();
});
server.listen(PORT);
