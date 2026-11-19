import "server-only";
import { CAL_TITLE, googleCalendarUrl } from "@/lib/calendar";
import { sendGmail } from "@/lib/google";
import { BUSINESS_TZ } from "@/lib/time";

const FROM = process.env.EMAIL_FROM || "HomeFlow <onboarding@resend.dev>";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Mail = { to: string; subject: string; html: string; replyTo?: string };

/** Gmail (from Nick's account) first; Resend only if Google isn't set up or Gmail fails. */
async function send(args: Mail) {
  let gmailError: unknown = null;
  try {
    if (await sendGmail(args)) return;
  } catch (e) {
    gmailError = e;
  }
  if (!process.env.RESEND_API_KEY) {
    if (gmailError) throw gmailError;
    console.warn(`Email not sent (no Gmail or Resend configured): ${args.subject}`);
    return;
  }
  if (gmailError) console.error("Gmail send failed, trying Resend", gmailError);
  await sendResend(args);
}

async function sendResend(args: Mail) {
  const key = process.env.RESEND_API_KEY!;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      ...(args.replyTo ? { reply_to: args.replyTo } : {}),
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: BUSINESS_TZ,
    timeZoneName: "short",
  });

const button = (href: string, label: string) =>
  `<a href="${esc(href)}" style="display:inline-block;background:#c68b4a;color:#000;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:999px;margin:0 8px 8px 0">${label}</a>`;

const wrap = (body: string) =>
  `<div style="background:#000;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#0d0d0d;border:1px solid #2a2a2a;border-radius:12px;padding:32px;color:#fff;line-height:1.5">
      <div style="letter-spacing:6px;font-weight:700;font-size:20px"><span style="color:#fff">HOME</span><span style="color:#c68b4a">FLOW</span></div>
      ${body}
    </div></div>`;

export async function sendClientConfirmation(a: {
  to: string;
  name: string;
  startsAt: string;
  endsAt: string;
  meetUrl: string | null;
}) {
  const call = a.meetUrl
    ? `<p style="margin:20px 0 8px">${button(a.meetUrl, "Join the video call")}${button(
        googleCalendarUrl(a.startsAt, a.endsAt, a.meetUrl),
        "Add to Google Calendar",
      )}</p><p style="color:#b3b3b3;font-size:13px;word-break:break-all">${esc(a.meetUrl)}</p>`
    : `<p>Nick will email you the video call link shortly.</p>`;
  await send({
    to: a.to,
    subject: `Your free kitchen consult: ${when(a.startsAt)}`,
    replyTo: process.env.NOTIFY_EMAIL || undefined,
    html: wrap(`
      <h1 style="font-size:24px;margin:24px 0 8px">You're booked, ${esc(a.name.split(" ")[0])}.</h1>
      <p style="margin:0;color:#b3b3b3">${esc(CAL_TITLE)} (30-minute video call, free)</p>
      <p style="font-size:18px;margin:20px 0 0"><strong>${esc(when(a.startsAt))}</strong></p>
      ${call}
      <p style="color:#b3b3b3;font-size:14px;margin-top:24px">On the call, tell Nick what you want fixed and he'll give you an estimate. No payment is needed.
      Need to change the time? Just reply to this email.</p>`),
  });
}

export async function sendOwnerNotification(a: {
  name: string;
  email: string;
  phone: string;
  city: string;
  description: string;
  startsAt: string;
  meetUrl: string | null;
  photoCount: number;
}) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  await send({
    to,
    subject: `New consult: ${a.name}, ${when(a.startsAt)}`,
    replyTo: a.email,
    html: wrap(`
      <h1 style="font-size:22px;margin:24px 0 8px">New free consult booked</h1>
      <p><strong>${esc(when(a.startsAt))}</strong></p>
      <p>${esc(a.name)}<br>${esc(a.email)}<br>${esc(a.phone)}<br>${esc(a.city)}</p>
      <p style="color:#b3b3b3">${esc(a.description).replace(/\n/g, "<br>")}</p>
      <p style="color:#b3b3b3;font-size:13px">${a.photoCount} photo(s) attached to the booking.</p>
      ${a.meetUrl ? `<p>${button(a.meetUrl, "Join the video call")}</p>` : ""}`),
  });
}

export async function sendClientReminder(a: {
  to: string;
  name: string;
  startsAt: string;
  endsAt: string;
  meetUrl: string | null;
}) {
  const call = a.meetUrl
    ? `<p style="margin:20px 0 8px">${button(a.meetUrl, "Join the video call")}${button(
        googleCalendarUrl(a.startsAt, a.endsAt, a.meetUrl),
        "Add to Google Calendar",
      )}</p><p style="color:#b3b3b3;font-size:13px;word-break:break-all">${esc(a.meetUrl)}</p>`
    : `<p>Nick will email you the video call link before the call.</p>`;
  await send({
    to: a.to,
    subject: `Reminder: your free kitchen consult, ${when(a.startsAt)}`,
    replyTo: process.env.NOTIFY_EMAIL || undefined,
    html: wrap(`
      <h1 style="font-size:24px;margin:24px 0 8px">See you soon, ${esc(a.name.split(" ")[0])}.</h1>
      <p style="margin:0;color:#b3b3b3">Your ${esc(CAL_TITLE)} is coming up.</p>
      <p style="font-size:18px;margin:20px 0 0"><strong>${esc(when(a.startsAt))}</strong></p>
      ${call}
      <p style="color:#b3b3b3;font-size:14px;margin-top:24px">Have the area you want fixed handy so you can show Nick on camera.
      Need a different time? Just reply to this email.</p>`),
  });
}
