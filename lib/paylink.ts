import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Pay links: the customer's "sign-in" that is not one.
 *
 * A link in a text or an email carries a signed token naming the policy and
 * an expiry. Opening it shows that policy's bill, prefilled, and nothing
 * else. There is no account and no password, because a customer will not
 * keep a password for an insurance agent and should not have to. The token
 * is not a secret about the customer: knowing it lets you SEE one bill and
 * PAY it, which is the same exposure as a paper bill in a mailbox, and the
 * card is still typed on Stripe's page.
 *
 * Two lifetimes: the link the workroom mints for a message lasts
 * `payments.payLinkDays`, because a bill sits in an inbox for weeks; the
 * link the find-your-bill lookup mints lasts an hour, because the customer
 * is on the page right now.
 *
 * PAY_LINK_SECRET signs them. Unset in production means no pay links at
 * all, said out loud on the pay page, the same rule as the workroom
 * passcode: a closed door beats a known lock. Rotating the secret retires
 * every link ever sent, which is the emergency lever.
 */

const DEV_SECRET = "pay-link-dev";

export function payLinkSecret(): string | null {
  const set = process.env.PAY_LINK_SECRET?.trim();
  if (set) return set;
  return process.env.NODE_ENV === "production" ? null : DEV_SECRET;
}

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url").toString();

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function mintPayLink(policyId: string, ttlSeconds: number): string | null {
  const secret = payLinkSecret();
  if (!secret) return null;
  const payload = `${policyId}|${Math.floor(Date.now() / 1000) + ttlSeconds}`;
  return `${b64(payload)}.${sign(payload, secret)}`;
}

export function readPayLink(token: string): { policyId: string } | null {
  const secret = payLinkSecret();
  if (!secret || typeof token !== "string" || token.length > 400) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  let payload: string;
  try {
    payload = unb64(token.slice(0, dot));
  } catch {
    return null;
  }
  const a = Buffer.from(sign(payload, secret));
  const b = Buffer.from(token.slice(dot + 1));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const bar = payload.lastIndexOf("|");
  const policyId = payload.slice(0, bar);
  const exp = Number(payload.slice(bar + 1));
  if (!policyId || !exp || exp < Date.now() / 1000) return null;
  return { policyId };
}

export const payLinkPath = (token: string) => `/pay/p/${token}`;
