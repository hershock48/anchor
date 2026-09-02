import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stripe over raw REST. No SDK, four calls, one fewer dependency to patch
 * (louies' pattern, kept through the parked checkout). The key is read per
 * call so a deployment without one degrades to "not switched on" rather than
 * crashing at import.
 *
 * The webhook check below is the part worth reading twice. Stripe signs the
 * RAW request body with the endpoint secret; the signature covers
 * `${timestamp}.${body}`, and the check must run on the bytes as received,
 * before any JSON parsing, or a re-serialized body verifies nothing.
 */

export function stripeKey(): string | null {
  return process.env.STRIPE_SECRET_KEY?.trim() || null;
}

export class StripeError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function stripe<T>(
  path: string,
  opts: { method?: "GET" | "POST" | "DELETE"; body?: URLSearchParams } = {}
): Promise<T> {
  const key = stripeKey();
  if (!key) throw new StripeError(0, "STRIPE_SECRET_KEY is not set.");
  const res = await fetch(`https://api.stripe.com${path}`, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers: {
      Authorization: `Bearer ${key}`,
      ...(opts.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: opts.body,
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) throw new StripeError(res.status, json.error?.message ?? `Stripe ${res.status}`);
  return json;
}

/**
 * Verify a Stripe-Signature header against the raw body. Tolerance guards
 * replay; the comparison is constant time. Returns false rather than
 * throwing, so a bad signature is a quiet 400 and never a stack trace in
 * a log an attacker can read.
 */
export function verifyStripeSignature(rawBody: string, header: string | null, secret: string, toleranceSec = 300): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    })
  ) as Record<string, string>;
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  // Several v1 signatures can be present during a secret rotation.
  const given = header
    .split(",")
    .map((kv) => kv.trim())
    .filter((kv) => kv.startsWith("v1="))
    .map((kv) => kv.slice(3));
  const a = Buffer.from(expected);
  return given.some((g) => {
    const b = Buffer.from(g);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

/** What the code reads off a retrieved Checkout Session. */
export type StripeSession = {
  id: string;
  mode: "payment" | "subscription" | "setup";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  amount_total: number | null;
  payment_intent: string | null;
  subscription: string | { id: string } | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string>;
};

/** What the code reads off an Invoice, across the API versions that moved
 *  the subscription pointer under `parent`. */
export type StripeInvoice = {
  id: string;
  status: string | null;
  amount_paid: number;
  customer_email?: string | null;
  subscription?: string | null;
  subscription_details?: { metadata?: Record<string, string> } | null;
  parent?: { subscription_details?: { subscription?: string | null; metadata?: Record<string, string> } | null } | null;
  status_transitions?: { paid_at?: number | null } | null;
  lines?: { data: { amount: number }[] };
};

export function invoiceSubscriptionId(inv: StripeInvoice): string | null {
  return inv.subscription ?? inv.parent?.subscription_details?.subscription ?? null;
}

export function invoiceMetadata(inv: StripeInvoice): Record<string, string> {
  return inv.subscription_details?.metadata ?? inv.parent?.subscription_details?.metadata ?? {};
}
