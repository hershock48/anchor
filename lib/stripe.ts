import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stripe over raw REST. No SDK, a handful of calls, one fewer dependency to
 * patch (louies' pattern, kept through the parked checkout). The key is read
 * per call so a deployment without one degrades to "not switched on" rather
 * than crashing at import.
 *
 * STRIPE CONNECT, since September 2, 2026. The key is GLAZED'S platform key,
 * and every call carries a `Stripe-Account` header naming HER connected
 * account (STRIPE_ACCOUNT, an acct_... id), so the charge lands in her
 * balance under her name and her statement descriptor, while the .99 rides
 * along as an application fee that Stripe moves to Glazed's balance at the
 * moment of payment. Nothing to invoice, and the fee never touches the
 * producer's account. Without STRIPE_ACCOUNT the calls run on the key's own
 * account and no application fee is set, which is how a single-account
 * setup (or a first test) still works.
 *
 * TEST MODE IS ITS OWN STATE. A key starting sk_test_ can never move real
 * money, so lib/pay.ts lets a test key open the checkout even while the
 * production switch is off: the whole flow can be walked on the deployment,
 * with Stripe's test cards, before anything is real. The bill page says
 * "test mode" while that is the case.
 *
 * The webhook check below is the part worth reading twice. Stripe signs the
 * RAW request body with the endpoint secret; the signature covers
 * `${timestamp}.${body}`, and the check must run on the bytes as received,
 * before any JSON parsing, or a re-serialized body verifies nothing.
 */

export function stripeKey(): string | null {
  return process.env.STRIPE_SECRET_KEY?.trim() || null;
}

/** Her connected account, when the platform arrangement is in place. */
export function stripeAccount(): string | null {
  return process.env.STRIPE_ACCOUNT?.trim() || null;
}

export type StripeMode = "off" | "test" | "live";

export function stripeMode(): StripeMode {
  const key = stripeKey();
  if (!key) return "off";
  return key.startsWith("sk_test_") || key.startsWith("rk_test_") ? "test" : "live";
}

/** Overridable so a local mock can stand in for Stripe in the end-to-end test. */
function apiBase(): string {
  return process.env.STRIPE_API_BASE?.trim() || "https://api.stripe.com";
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
  opts: { method?: "GET" | "POST" | "DELETE"; body?: URLSearchParams; account?: string | null } = {}
): Promise<T> {
  const key = stripeKey();
  if (!key) throw new StripeError(0, "STRIPE_SECRET_KEY is not set.");
  const account = opts.account === undefined ? stripeAccount() : opts.account;
  const res = await fetch(`${apiBase()}${path}`, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers: {
      Authorization: `Bearer ${key}`,
      ...(account ? { "Stripe-Account": account } : {}),
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

/**
 * The application fee for a subscription has to be a PERCENTAGE with two
 * decimals (Stripe allows no flat amount on recurring direct charges), so
 * this finds the percentage of the installment-plus-fee total that rounds
 * closest to the flat fee. Exact for ordinary installments; for very large
 * ones (over about $9,900 a cycle) one hundredth of a percent is worth more
 * than a cent, and the variance is on Glazed's side of the split, never on
 * what the customer is charged.
 */
export function feePercentFor(totalCents: number, feeCents: number): string {
  if (totalCents <= 0 || feeCents <= 0) return "0";
  const ideal = (feeCents / totalCents) * 100;
  let best = Math.round(ideal * 100) / 100;
  let bestErr = Math.abs(Math.round((totalCents * best) / 100) - feeCents);
  for (const p of [best - 0.01, best + 0.01]) {
    if (p < 0) continue;
    const err = Math.abs(Math.round((totalCents * p) / 100) - feeCents);
    if (err < bestErr) {
      best = p;
      bestErr = err;
    }
  }
  return best.toFixed(2);
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
