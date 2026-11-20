import "server-only";
import { CAL_TITLE, googleCalendarUrl } from "@/lib/calendar";
import { sendGmail } from "@/lib/google";
import { PAY_APPLE_PAY, PAY_VENMO, PAY_ZELLE } from "@/lib/content";
import { signLink } from "@/lib/token";
import { BUSINESS_TZ } from "@/lib/time";

const FROM = process.env.EMAIL_FROM || "HomeFlow <onboarding@resend.dev>";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

type Mail = { to: string; subject: string; html: string; replyTo?: string };

/** Gmail (from Nicholas's account) first; Resend only if Google isn't set up or Gmail fails. */
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
  `<a href="${esc(href)}" style="display:inline-block;background:#c68b4a;color:#2b2926;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:999px;margin:0 8px 8px 0">${label}</a>`;

const wrap = (body: string) =>
  `<div style="background:#fbf8f2;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e3d9c8;border-radius:12px;padding:32px;color:#2b2926;line-height:1.5">
      <div style="letter-spacing:6px;font-weight:700;font-size:20px"><span style="color:#2b2926">HOME</span><span style="color:#c68b4a">FLOW</span></div>
      ${body}
    </div></div>`;

export async function sendClientConfirmation(a: {
  consultationId: string;
  rescheduled?: boolean;
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
      )}</p><p style="color:#6b655c;font-size:13px;word-break:break-all">${esc(a.meetUrl)}</p>`
    : `<p>Nicholas will email you the video call link shortly.</p>`;
  await send({
    to: a.to,
    subject: `${a.rescheduled ? "Rescheduled: your" : "Your"} complimentary assessment: ${when(a.startsAt)}`,
    replyTo: process.env.NOTIFY_EMAIL || undefined,
    html: wrap(`
      <h1 style="font-size:24px;margin:24px 0 8px">${a.rescheduled ? "You're rescheduled" : "You're booked"}, ${esc(a.name.split(" ")[0])}.</h1>
      <p style="margin:0;color:#6b655c">${esc(CAL_TITLE)} (30-minute video call, complimentary)</p>
      <p style="font-size:18px;margin:20px 0 0"><strong>${esc(when(a.startsAt))}</strong></p>
      ${call}
      <p style="color:#6b655c;font-size:14px;margin-top:24px">On the call, tell Nicholas about your project and he will help determine the next steps. No payment is needed.
      Need to change the time? <a href="${esc(manageUrl(a.consultationId))}" style="color:#9a6a2f">Reschedule or cancel here</a>, or just reply to this email.</p>`),
  });
}

export async function sendOwnerNotification(a: {
  consultationId: string;
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
      <p style="color:#6b655c">${esc(a.description).replace(/\n/g, "<br>")}</p>
      ${a.photoCount > 0 ? `<p style="margin:16px 0 8px">${button(ownerPhotosUrl(a.consultationId), `View ${a.photoCount} photo${a.photoCount === 1 ? "" : "s"}`)}</p>` : ""}
      ${a.meetUrl ? `<p>${button(a.meetUrl, "Join the video call")}</p>` : ""}`),
  });
}

export async function sendClientReminder(a: {
  consultationId: string;
  soon?: boolean;
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
      )}</p><p style="color:#6b655c;font-size:13px;word-break:break-all">${esc(a.meetUrl)}</p>`
    : `<p>Nicholas will email you the video call link before the call.</p>`;
  await send({
    to: a.to,
    subject: `${a.soon ? "Starting soon" : "Reminder"}: your complimentary assessment, ${when(a.startsAt)}`,
    replyTo: process.env.NOTIFY_EMAIL || undefined,
    html: wrap(`
      <h1 style="font-size:24px;margin:24px 0 8px">${a.soon ? "Starting soon" : "See you soon"}, ${esc(a.name.split(" ")[0])}.</h1>
      <p style="margin:0;color:#6b655c">Your ${esc(CAL_TITLE)} ${a.soon ? "starts shortly" : "is coming up"}.</p>
      <p style="font-size:18px;margin:20px 0 0"><strong>${esc(when(a.startsAt))}</strong></p>
      ${call}
      <p style="color:#6b655c;font-size:14px;margin-top:24px">Have the space or item you want help with handy so you can show Nicholas on camera.
      Can't make it? <a href="${esc(manageUrl(a.consultationId))}" style="color:#9a6a2f">Pick a new time here</a>, or just reply to this email.</p>`),
  });
}

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const projectFormUrl = (consultationId: string) => `${SITE}/project?c=${consultationId}`;

/** Sent after the free consult: thanks, link to the project form, and how to pay. */
export async function sendClientFollowUp(a: { to: string; name: string; consultationId: string }) {
  const pay = [
    PAY_ZELLE && `Zelle: ${esc(PAY_ZELLE)}`,
    PAY_VENMO && `Venmo: ${esc(PAY_VENMO)}`,
    PAY_APPLE_PAY && `Apple Pay (Apple Cash via Messages): ${esc(PAY_APPLE_PAY)}`,
  ].filter(Boolean);
  await send({
    to: a.to,
    subject: "Thank you, and your next step with HomeFlow",
    replyTo: process.env.NOTIFY_EMAIL || undefined,
    html: wrap(`
      <h1 style="font-size:24px;margin:24px 0 8px">Thank you, ${esc(a.name.split(" ")[0])}.</h1>
      <p style="margin:0;color:#6b655c">It was a pleasure learning about your project. To move forward, please share a few details so Nicholas can prepare your personalized estimate.</p>
      <p style="margin:24px 0 8px">${button(projectFormUrl(a.consultationId), "Share your project details")}</p>
      <h2 style="font-size:18px;margin:28px 0 6px">How payment works</h2>
      <p style="margin:0;color:#6b655c;font-size:14px">Your estimate is based on the scope of the project and agreed before work begins. A $80 booking deposit holds your date and is applied to your final bill. We accept Zelle, Venmo and Apple Pay.</p>
      ${pay.length ? `<p style="margin:12px 0 0;font-size:14px">${pay.join("<br>")}</p>` : `<p style="margin:12px 0 0;color:#6b655c;font-size:14px">Nicholas will send payment details with your estimate.</p>`}
      <p style="color:#6b655c;font-size:14px;margin-top:24px">Questions? Just reply to this email.</p>`),
  });
}

export async function sendOwnerProjectRequest(a: {
  name: string;
  email: string;
  phone: string;
  address: string;
  scope: string;
  timing: string | null;
  payMethod: string | null;
}) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  await send({
    to,
    subject: `Project details: ${a.name}`,
    replyTo: a.email,
    html: wrap(`
      <h1 style="font-size:22px;margin:24px 0 8px">Project details received</h1>
      <p>${esc(a.name)}<br>${esc(a.email)}<br>${esc(a.phone)}<br>${esc(a.address)}</p>
      <p style="color:#6b655c">${esc(a.scope).replace(/\n/g, "<br>")}</p>
      ${a.timing ? `<p style="color:#6b655c">Preferred timing: ${esc(a.timing)}</p>` : ""}
      ${a.payMethod ? `<p style="color:#6b655c">Plans to pay with: ${esc(a.payMethod)}</p>` : ""}`),
  });
}

export const manageUrl = (consultationId: string) =>
  `${SITE}/manage/${consultationId}?t=${signLink(consultationId, "client")}`;

/** Page that shows the client's photos (private bucket, so it mints fresh links on each visit). */
export const ownerPhotosUrl = (id: string) => `${SITE}/owner/${id}/photos?t=${signLink(id, "owner")}`;

export type OwnerAction = "done" | "noshow" | "skip";
const ownerUrl = (id: string, action: OwnerAction) =>
  `${SITE}/owner/${id}?a=${action}&t=${signLink(id, "owner")}`;

/** Asks Nicholas how the call went. His answer drives what the client is emailed next. */
export async function sendOwnerConsultCheck(a: {
  consultationId: string;
  name: string;
  email: string;
  phone: string;
  startsAt: string;
  reminder?: boolean;
}) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  await send({
    to,
    subject: `${a.reminder ? "Still need your answer: " : "How did it go? "}${a.name}, ${when(a.startsAt)}`,
    replyTo: a.email,
    html: wrap(`
      <h1 style="font-size:22px;margin:24px 0 8px">${a.reminder ? "Still waiting on this one" : "How did the consult go?"}</h1>
      <p><strong>${esc(a.name)}</strong> &middot; ${esc(when(a.startsAt))}<br>
      <a href="mailto:${esc(a.email)}">${esc(a.email)}</a> &middot; <a href="tel:${esc(a.phone)}">${esc(a.phone)}</a></p>
      <p style="color:#6b655c;font-size:14px">One tap tells HomeFlow what to email the client. Nothing is sent until you confirm on the next page.</p>
      <p style="margin:20px 0 8px">${button(ownerUrl(a.consultationId, "done"), "We met: send project form")}</p>
      <p style="margin:0 0 8px">${button(ownerUrl(a.consultationId, "noshow"), "No-show: send reschedule link")}</p>
      <p style="margin:0"><a href="${esc(ownerUrl(a.consultationId, "skip"))}" style="color:#6b655c;font-size:13px">We met, but don't email them</a></p>`),
  });
}

/** Tells Nicholas a client changed or cancelled, so he can follow up personally. */
export async function sendOwnerChange(a: {
  kind: "rescheduled" | "cancelled";
  name: string;
  email: string;
  phone: string;
  oldStartsAt: string;
  newStartsAt?: string;
}) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) return;
  const re = a.kind === "rescheduled";
  await send({
    to,
    subject: `${re ? "Rescheduled" : "Cancelled"}: ${a.name}`,
    replyTo: a.email,
    html: wrap(`
      <h1 style="font-size:22px;margin:24px 0 8px">Consult ${a.kind}</h1>
      <p>${esc(a.name)}<br><a href="mailto:${esc(a.email)}">${esc(a.email)}</a><br><a href="tel:${esc(a.phone)}">${esc(a.phone)}</a></p>
      <p style="color:#6b655c">Was: ${esc(when(a.oldStartsAt))}</p>
      ${re && a.newStartsAt ? `<p><strong>Now: ${esc(when(a.newStartsAt))}</strong></p>` : `<p style="color:#6b655c">They may still want help: a quick personal note can win them back.</p>`}`),
  });
}

/** Sent to the client after they cancel, with an easy way back. */
export async function sendClientCancelled(a: { to: string; name: string }) {
  await send({
    to: a.to,
    subject: "Your HomeFlow assessment was cancelled",
    replyTo: process.env.NOTIFY_EMAIL || undefined,
    html: wrap(`
      <h1 style="font-size:24px;margin:24px 0 8px">No problem, ${esc(a.name.split(" ")[0])}.</h1>
      <p style="margin:0;color:#6b655c">Your complimentary assessment is cancelled. Whenever you're ready, you can book a new time.</p>
      <p style="margin:24px 0 8px">${button(`${SITE}/book`, "Book a new time")}</p>`),
  });
}

/** Sent when Nicholas marks a no-show (and again as a nudge): makes rebooking one tap. */
export async function sendClientMissed(a: { to: string; name: string; consultationId: string; nudge?: boolean }) {
  await send({
    to: a.to,
    subject: a.nudge ? "Still want to meet with Nicholas?" : "We missed you: pick a new time",
    replyTo: process.env.NOTIFY_EMAIL || undefined,
    html: wrap(`
      <h1 style="font-size:24px;margin:24px 0 8px">${a.nudge ? "Still thinking it over?" : "We missed you"}, ${esc(a.name.split(" ")[0])}.</h1>
      <p style="margin:0;color:#6b655c">${a.nudge ? "Nicholas would still be glad to look at your project." : "Things come up. Nicholas wasn't able to connect with you on your call."} Pick a new time that works, no charge.</p>
      <p style="margin:24px 0 8px">${button(manageUrl(a.consultationId), "Choose a new time")}</p>
      <p style="color:#6b655c;font-size:14px;margin-top:24px">Prefer to talk? Just reply to this email.</p>`),
  });
}

/** One gentle nudge if the client hasn't sent project details after the call. */
export async function sendClientProjectNudge(a: { to: string; name: string; consultationId: string }) {
  await send({
    to: a.to,
    subject: "Ready for your estimate?",
    replyTo: process.env.NOTIFY_EMAIL || undefined,
    html: wrap(`
      <h1 style="font-size:24px;margin:24px 0 8px">Ready when you are, ${esc(a.name.split(" ")[0])}.</h1>
      <p style="margin:0;color:#6b655c">Share a few project details and Nicholas will prepare your personalized estimate.</p>
      <p style="margin:24px 0 8px">${button(projectFormUrl(a.consultationId), "Share your project details")}</p>
      <p style="color:#6b655c;font-size:14px;margin-top:24px">Questions? Just reply to this email.</p>`),
  });
}
