import "server-only";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CAL_URL = "https://www.googleapis.com/calendar/v3";

type GoogleEnv = { clientId: string; clientSecret: string; refreshToken: string; calendarId: string };

function googleEnv(): GoogleEnv | null {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_CALENDAR_ID } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null;
  return {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    refreshToken: GOOGLE_REFRESH_TOKEN,
    calendarId: GOOGLE_CALENDAR_ID || "primary",
  };
}

export const googleConfigured = () => googleEnv() !== null;

async function accessToken(env: GoogleEnv): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.clientId,
      client_secret: env.clientSecret,
      refresh_token: env.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token as string;
}

type CalendarEvent = {
  id: string;
  hangoutsMeetLink?: string;
  conferenceData?: {
    entryPoints?: { entryPointType: string; uri: string }[];
    createRequest?: { status?: { statusCode?: string } };
  };
};

const meetLinkOf = (e: CalendarEvent) =>
  e.hangoutsMeetLink ?? e.conferenceData?.entryPoints?.find((p) => p.entryPointType === "video")?.uri ?? null;

/** Create a calendar event with a Google Meet link and email the invite to the client. */
export async function createMeetEvent(args: {
  requestId: string;
  summary: string;
  description: string;
  startsAt: string;
  endsAt: string;
  attendeeEmail: string;
  attendeeName: string;
}): Promise<{ eventId: string; meetUrl: string | null } | null> {
  const env = googleEnv();
  if (!env) return null;
  const token = await accessToken(env);
  const auth = { Authorization: `Bearer ${token}` };

  const res = await fetch(
    `${CAL_URL}/calendars/${encodeURIComponent(env.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: args.summary,
        description: args.description,
        start: { dateTime: args.startsAt },
        end: { dateTime: args.endsAt },
        attendees: [{ email: args.attendeeEmail, displayName: args.attendeeName }],
        conferenceData: {
          createRequest: { requestId: args.requestId, conferenceSolutionKey: { type: "hangoutsMeet" } },
        },
        reminders: { useDefault: true },
      }),
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`Google event create failed: ${res.status} ${await res.text()}`);
  let event = (await res.json()) as CalendarEvent;

  // Meet creation is occasionally still pending on the first response.
  if (!meetLinkOf(event) && event.conferenceData?.createRequest?.status?.statusCode === "pending") {
    await new Promise((r) => setTimeout(r, 1500));
    const again = await fetch(
      `${CAL_URL}/calendars/${encodeURIComponent(env.calendarId)}/events/${event.id}?conferenceDataVersion=1`,
      { headers: auth, cache: "no-store" },
    );
    if (again.ok) event = (await again.json()) as CalendarEvent;
  }
  return { eventId: event.id, meetUrl: meetLinkOf(event) };
}

/** Busy periods on Nick's Google Calendar, so personal events block slots. */
export async function getGoogleBusy(fromIso: string, toIso: string): Promise<{ s: number; e: number }[]> {
  const env = googleEnv();
  if (!env) return [];
  const token = await accessToken(env);
  const res = await fetch(`${CAL_URL}/freeBusy`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: fromIso, timeMax: toIso, items: [{ id: env.calendarId }] }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google freeBusy failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  const busy = (json.calendars?.[env.calendarId]?.busy ?? json.calendars?.primary?.busy ?? []) as {
    start: string;
    end: string;
  }[];
  return busy.map((b) => ({ s: new Date(b.start).getTime(), e: new Date(b.end).getTime() }));
}
