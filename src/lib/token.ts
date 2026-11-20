import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Signed, unguessable links: emails carry /manage/<id>?t=... so no login is needed. */
export type LinkScope = "client" | "owner";

function secret() {
  const s = process.env.LINK_SECRET || process.env.CRON_SECRET;
  if (!s) throw new Error("Set CRON_SECRET (or LINK_SECRET) to sign email links");
  return s;
}

export const signLink = (id: string, scope: LinkScope) =>
  createHmac("sha256", secret()).update(`${scope}:${id}`).digest("base64url");

export function verifyLink(id: string, scope: LinkScope, token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const a = Buffer.from(signLink(id, scope));
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
