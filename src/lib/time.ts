/** Business time zone. Working hours in the DB are in this zone. */
export const BUSINESS_TZ = "America/Los_Angeles";

function tzOffsetMs(at: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** Convert a wall-clock time in the business zone ("2027-01-05", 9, 30) to a UTC Date. */
export function localToUtc(dateStr: string, hour: number, minute: number, tz = BUSINESS_TZ): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, hour, minute);
  let utc = guess - tzOffsetMs(new Date(guess), tz);
  const off2 = tzOffsetMs(new Date(utc), tz);
  utc = guess - off2;
  return new Date(utc);
}

/** "YYYY-MM-DD" for an instant, in the business zone. */
export function localDateString(at: Date, tz = BUSINESS_TZ): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

export function addDaysStr(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
