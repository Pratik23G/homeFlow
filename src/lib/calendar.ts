const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export const CAL_TITLE = "HomeFlow complimentary assessment";

export function googleCalendarUrl(startsAt: string, endsAt: string, meetUrl: string | null) {
  const details = meetUrl ? `Join the video call: ${meetUrl}` : "Nicholas will email you the video call link.";
  return (
    "https://calendar.google.com/calendar/render?" +
    new URLSearchParams({
      action: "TEMPLATE",
      text: CAL_TITLE,
      dates: `${stamp(startsAt)}/${stamp(endsAt)}`,
      details,
      ...(meetUrl ? { location: meetUrl } : {}),
    })
  );
}
