import "server-only";

import { site, payments, isPlaceholder } from "@/lib/site";
import { getFacts } from "@/lib/content";
import { getStore } from "@/lib/workroom/store";
import {
  AGENCY,
  addMonths,
  cadenceOf,
  dueLabel,
  money,
  type Customer,
  type Payment,
  type Policy,
} from "@/lib/workroom/book";
import {
  feePercentFor,
  invoiceMetadata,
  invoiceSubscriptionId,
  stripe,
  stripeAccount,
  stripeMode,
  type StripeInvoice,
  type StripeMode,
  type StripeSession,
} from "@/lib/stripe";
import { mintPayLink, payLinkPath } from "@/lib/paylink";

/**
 * The money logic, in one place: where a policy's payment goes, how a
 * checkout is built from the book, how a completed payment is recorded, and
 * how the customer is told what is due.
 *
 * THE BOOK IS THE ONLY SOURCE OF AN AMOUNT. The customer never types one:
 * the checkout is built from the policy row, so a hand-crafted POST cannot
 * pay $1 against a $400 installment, and the receipt says what the book
 * says. What the customer chooses is one thing only: pay this once, or
 * pay it automatically from now on.
 *
 * Recording is IDEMPOTENT by Stripe's own id, so the return page and the
 * webhook can both try and the second one is a no-op. That is what lets the
 * site work correctly with the webhook not yet configured (the return page
 * records) and keep working when the customer closes the tab before the
 * return page loads (the webhook records).
 */

/* ------------------------------ routing ------------------------------ */

export type PayRoute =
  | { kind: "here" }
  | { kind: "portal"; carrier: string; url?: string; phone?: string }
  | { kind: "nothing" };

/**
 * Where this policy's money goes. "here" only for the agency's own invoices
 * and for carriers whose agreement authorizes the agency to collect, which
 * is the payableHere flag in site.ts, set from the agreement and never from
 * a book entry. Everything else routes to the carrier.
 */
export function payRoute(policy: Policy): PayRoute {
  if (policy.status !== "active" || !policy.nextDue || policy.amountCents < 100) return { kind: "nothing" };
  if (policy.payTo === AGENCY) return { kind: "here" };
  const carrier = site.carriers.find((c) => c.name.toLowerCase() === policy.payTo.toLowerCase());
  if (carrier?.payableHere) return { kind: "here" };
  return { kind: "portal", carrier: policy.payTo, url: carrier?.payUrl, phone: carrier?.billingPhone };
}

/**
 * Whether the site can take a card right now. A LIVE key needs the switch
 * in site.ts as well; a TEST key opens the checkout on its own, because a
 * test key cannot move real money and walking the whole flow on the
 * deployment before the flip is the point of test mode. The bill page says
 * "test mode" while that is the case.
 */
export function checkoutMode(): StripeMode {
  const mode = stripeMode();
  if (mode === "live" && !payments.checkoutEnabled) return "off";
  return mode;
}

export function checkoutLive(): boolean {
  return checkoutMode() !== "off";
}

/** Today in Manchester, as YYYY-MM-DD. Due dates are calendar dates there. */
export function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Detroit", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/* ------------------------------ checkout ------------------------------ */

const feeName = "Online payment fee";

/**
 * Build the Stripe Checkout Session for a book entry and return its URL.
 * Autopay is a subscription on the policy's cadence, with its billing cycle
 * ANCHORED to the next due date and no proration, so nothing is charged
 * today and the first full installment lands on the due date. It was a
 * trial ending on the due date first; Stripe presents any trial as "40 days
 * free" and "Try premium…", which is the wrong story for an insurance
 * installment, and Kevin saw it on the first autopay walk (September 2,
 * 2026). The anchor says the same thing in Stripe's plain wording.
 */
export async function createCheckout(opts: {
  policy: Policy;
  customer: Customer;
  autopay: boolean;
  origin: string;
}): Promise<string> {
  const { policy, customer, autopay, origin } = opts;
  const cadence = cadenceOf(policy.cadence);
  const recurring = autopay && cadence?.stripe ? cadence.stripe : null;
  // "Premium: the Civic, policy PRG-1234" or "Progressive premium: …". Stripe
  // puts this name in its own sentences ("Subscribe to …"), so it reads as a
  // noun phrase and starts with a capital.
  const paidTo = policy.payTo === AGENCY ? "Premium" : `${policy.payTo} premium`;
  const what = policy.label ? `${policy.label}, ` : "";

  const body = new URLSearchParams();
  body.set("mode", recurring ? "subscription" : "payment");
  body.set("success_url", `${origin}/pay/received?session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${origin}/pay`);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", String(policy.amountCents));
  body.set(
    "line_items[0][price_data][product_data][name]",
    `${paidTo}: ${what}policy ${policy.policyNumber}${recurring ? " (autopay)" : ""}`
  );
  if (recurring) {
    body.set("line_items[0][price_data][recurring][interval]", recurring.interval);
    body.set("line_items[0][price_data][recurring][interval_count]", String(recurring.count));
  }
  // The online-channel fee is its OWN line item, so the receipt shows premium
  // and fee apart and the fee is never inside premium. The line is plain on
  // purpose (the customer is dealing with Anchor); who charges it is said in
  // the sentence under the button, and on the form before they got here.
  if (payments.convenienceFeeCents > 0) {
    body.set("line_items[1][quantity]", "1");
    body.set("line_items[1][price_data][currency]", "usd");
    body.set("line_items[1][price_data][unit_amount]", String(payments.convenienceFeeCents));
    body.set("line_items[1][price_data][product_data][name]", feeName);
    if (recurring) {
      body.set("line_items[1][price_data][recurring][interval]", recurring.interval);
      body.set("line_items[1][price_data][recurring][interval_count]", String(recurring.count));
    }
    // The one sentence the fee posture rests on (charged by the technology
    // provider, not the producer). Kept short; the line item already says
    // the amount, and the bill page already said it was coming.
    body.set("custom_text[submit][message]", "The online payment fee is charged by Glazed Web, the payment technology provider.");
  }
  const meta: Record<string, string> = {
    policyId: policy.id,
    customerId: customer.id,
    forDue: policy.nextDue ?? "",
    payer_name: customer.name,
    policy: policy.policyNumber,
    pay_to: policy.payTo,
  };
  for (const [k, v] of Object.entries(meta)) body.set(`metadata[${k}]`, v);
  if (recurring) {
    for (const [k, v] of Object.entries(meta)) body.set(`subscription_data[metadata][${k}]`, v);
    // Anchor the cycle to the due date when it is in the future, with no
    // proration, so today's charge is $0 and the first installment is the
    // full amount on the due date. A due date that is today or past means
    // the first charge is now and the cycle runs from today.
    if (policy.nextDue) {
      const dueTs = Math.floor(Date.parse(policy.nextDue + "T12:00:00-05:00") / 1000);
      if (dueTs > Date.now() / 1000 + 3600) {
        body.set("subscription_data[billing_cycle_anchor]", String(dueTs));
        body.set("subscription_data[proration_behavior]", "none");
      }
    }
  }
  if (customer.email.includes("@")) body.set("customer_email", customer.email);

  // THE .99 GOES TO GLAZED AT THE MOMENT OF PAYMENT. With her account
  // connected under Glazed's platform, the charge is hers and the fee is an
  // application fee Stripe moves to the platform balance: nothing to invoice
  // and the fee never sits in the producer's account. One-time payments take
  // the flat amount; subscriptions can only take a percentage, so it is the
  // percentage of the cycle total that rounds to the flat fee (see
  // feePercentFor). Without a connected account there is no application fee
  // to set, and the fee simply lands with whoever owns the key.
  if (payments.convenienceFeeCents > 0 && stripeAccount()) {
    if (recurring) {
      body.set(
        "subscription_data[application_fee_percent]",
        feePercentFor(policy.amountCents + payments.convenienceFeeCents, payments.convenienceFeeCents)
      );
    } else {
      body.set("payment_intent_data[application_fee_amount]", String(payments.convenienceFeeCents));
    }
  }

  const session = await stripe<{ url?: string }>("/v1/checkout/sessions", { body });
  if (!session.url) throw new Error("Stripe returned no checkout URL.");
  return session.url;
}

/* ------------------------------ recording ------------------------------ */

function rollDue(policy: Policy, forDue: string | null): void {
  if (!forDue || policy.nextDue !== forDue) return; // already rolled, or paid something else
  const cadence = cadenceOf(policy.cadence);
  policy.nextDue = cadence && cadence.months > 0 ? addMonths(forDue, cadence.months) : null;
}

async function saveRecorded(payment: Payment, policy: Policy): Promise<void> {
  const store = getStore();
  await store.payments.put(payment);
  rollDue(policy, payment.forDue);
  policy.updatedAt = Date.now();
  await store.policies.put(policy);
  const customer = await store.customers.get(policy.customerId);
  await notifyAgency(
    `Payment received: ${customer?.name ?? "unknown"}, policy ${policy.policyNumber}, ${money(payment.totalCents)}`,
    `${customer?.name ?? "A customer"} paid ${money(payment.premiumCents)} premium` +
      (payment.feeCents ? ` plus the ${money(payment.feeCents)} online fee` : "") +
      ` on policy ${policy.policyNumber} (${policy.carrier}${policy.label ? ", " + policy.label : ""}).\n` +
      `Pay to: ${policy.payTo === AGENCY ? "agency invoice" : policy.payTo}\n` +
      `Kind: ${payment.kind}\nFor the installment due: ${payment.forDue ?? "(none on file)"}\n` +
      `Next due on the book: ${policy.nextDue ?? "nothing"}\n` +
      `Stripe: ${payment.stripe.paymentIntentId ?? payment.stripe.invoiceId ?? payment.id}\n\n` +
      `The book in the workroom shows it under the customer.`
  );
}

/**
 * Record a completed Checkout Session. Called from the return page (with the
 * id from the URL) and from the webhook (with the event's object). Fetches
 * the session from Stripe either way, so a forged id records nothing.
 */
export async function recordSession(
  sessionId: string,
  via: Payment["recordedVia"],
  /** The connected account the event came from; undefined means the env's. */
  account?: string
): Promise<{ payment: Payment | null; policy: Policy | null; autopayStarted: boolean }> {
  const store = getStore();
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return { payment: null, policy: null, autopayStarted: false };
  const session = await stripe<StripeSession>(`/v1/checkout/sessions/${sessionId}`, account ? { account } : {});
  const policyId = session.metadata?.policyId;
  if (!policyId) return { payment: null, policy: null, autopayStarted: false };
  const policy = await store.policies.get(policyId);
  if (!policy) return { payment: null, policy: null, autopayStarted: false };

  if (session.mode === "subscription") {
    // Autopay switched on. The money for each cycle arrives as invoice.paid
    // (or is recorded by recordInvoice from the first invoice); here we only
    // remember the subscription so the book and the workroom know.
    const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    let changed = false;
    if (subId && policy.autopay?.subscriptionId !== subId) {
      policy.autopay = { subscriptionId: subId, since: Date.now() };
      policy.updatedAt = Date.now();
      await store.policies.put(policy);
      changed = true;
    }
    return { payment: null, policy, autopayStarted: changed || !!subId };
  }

  if (session.payment_status !== "paid") return { payment: null, policy, autopayStarted: false };
  const existing = await store.payments.get(session.id);
  if (existing) return { payment: existing, policy, autopayStarted: false };

  const total = session.amount_total ?? 0;
  const fee = payments.convenienceFeeCents > 0 && total > policy.amountCents ? payments.convenienceFeeCents : 0;
  const payment: Payment = {
    id: session.id,
    createdAt: Date.now(),
    policyId: policy.id,
    customerId: policy.customerId,
    premiumCents: total - fee,
    feeCents: fee,
    totalCents: total,
    kind: "one-time",
    forDue: session.metadata?.forDue || null,
    paidAt: Date.now(),
    payerEmail: session.customer_details?.email ?? "",
    recordedVia: via,
    stripe: { sessionId: session.id, paymentIntentId: session.payment_intent ?? undefined },
  };
  await saveRecorded(payment, policy);
  return { payment, policy, autopayStarted: false };
}

/** Record a paid subscription invoice (one autopay cycle). Webhook only. */
export async function recordInvoice(inv: StripeInvoice): Promise<Payment | null> {
  const store = getStore();
  if (inv.status !== "paid" || !inv.amount_paid) return null; // a $0 trial invoice is not a payment
  const existing = await store.payments.get(inv.id);
  if (existing) return existing;
  const meta = invoiceMetadata(inv);
  const subId = invoiceSubscriptionId(inv);
  let policy = meta.policyId ? await store.policies.get(meta.policyId) : null;
  if (!policy && subId) {
    policy = (await store.policies.list()).find((p) => p.autopay?.subscriptionId === subId) ?? null;
  }
  if (!policy) return null;
  if (subId && !policy.autopay) policy.autopay = { subscriptionId: subId, since: Date.now() };
  const total = inv.amount_paid;
  const fee = payments.convenienceFeeCents > 0 && total > policy.amountCents ? payments.convenienceFeeCents : 0;
  const payment: Payment = {
    id: inv.id,
    createdAt: Date.now(),
    policyId: policy.id,
    customerId: policy.customerId,
    premiumCents: total - fee,
    feeCents: fee,
    totalCents: total,
    kind: "autopay",
    forDue: policy.nextDue,
    paidAt: (inv.status_transitions?.paid_at ?? Math.floor(Date.now() / 1000)) * 1000,
    payerEmail: inv.customer_email ?? "",
    recordedVia: "webhook",
    stripe: { invoiceId: inv.id, subscriptionId: subId ?? undefined },
  };
  await saveRecorded(payment, policy);
  return payment;
}

/** Autopay ended, from the workroom or from Stripe's side. */
export async function endAutopay(policy: Policy, cancelAtStripe: boolean): Promise<void> {
  if (cancelAtStripe && policy.autopay?.subscriptionId) {
    await stripe(`/v1/subscriptions/${policy.autopay.subscriptionId}`, { method: "DELETE" });
  }
  policy.autopay = null;
  policy.updatedAt = Date.now();
  await getStore().policies.put(policy);
}

/* ------------------------------ messages ------------------------------ */

export function payLinkFor(policy: Policy, origin: string, ttlSeconds = payments.payLinkDays * 86400): string | null {
  const token = mintPayLink(policy.id, ttlSeconds);
  return token ? `${origin}${payLinkPath(token)}` : null;
}

async function sendMail(msg: { to: string; subject: string; text: string; replyTo?: string }): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set, so no mail can go out from this deployment." };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${site.name} <anchor@glazedweb.com>`,
        to: [msg.to],
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
        subject: msg.subject,
        text: msg.text,
      }),
    });
    if (!res.ok) return { ok: false, error: `Mail refused: ${res.status} ${await res.text()}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `Mail did not go out: ${String(err)}` };
  }
}

/** The agency's own inbox, when PAY_NOTIFY_TO is set. Never fails the caller. */
export async function notifyAgency(subject: string, text: string): Promise<void> {
  const to = process.env.PAY_NOTIFY_TO;
  if (!to) {
    console.warn("[pay] PAY_NOTIFY_TO is not set; agency not emailed:", subject);
    return;
  }
  const r = await sendMail({ to, subject, text });
  if (!r.ok) console.error("[pay] agency notify failed:", r.error);
}

/**
 * The "your payment is due" message. Same words whether she taps Send in the
 * workroom or the nightly job sends it. Plain text on purpose: it reads as a
 * note from a person, and the link is the whole point.
 */
export async function sendReminder(policy: Policy, customer: Customer, origin: string, why: "upcoming" | "due" | "manual"): Promise<{ ok: boolean; error?: string }> {
  if (!customer.email.includes("@")) return { ok: false, error: "No email address on the customer." };
  if (!policy.nextDue) return { ok: false, error: "Nothing is due on this policy." };
  const facts = await getFacts();
  const route = payRoute(policy);
  const link = payLinkFor(policy, origin);
  const first = customer.name.trim().split(/\s+/)[0] || "there";
  const what = policy.label || `policy ${policy.policyNumber}`;
  const due = dueLabel(policy.nextDue, today());
  const phone = isPlaceholder(facts.contact.phone) ? "" : ` or call us at ${facts.contact.phone}`;

  let how: string;
  if (route.kind === "here" && link && checkoutLive()) {
    how = `Pay it here, one tap, no login:\n${link}\n\nOn that page you can also turn on autopay, so this is the last one you have to think about.`;
  } else if (route.kind === "portal") {
    how = route.url
      ? `This one is billed by ${route.carrier}, so it is paid on their site:\n${route.url}` + (route.phone ? `\n\nOr call their billing line at ${route.phone}.` : "")
      : `This one is billed by ${route.carrier}. Pay it through the site or phone number printed on your ${route.carrier} bill.`;
  } else {
    how = `Reply to this email${phone} and we will take it over the phone.`;
  }

  const subject =
    why === "due"
      ? `Your ${site.name} payment of ${money(policy.amountCents)} is due today`
      : `Your ${site.name} payment: ${money(policy.amountCents)} due ${due}`;
  const text =
    `Hi ${first},\n\n` +
    `Your ${money(policy.amountCents)} payment for ${what} is due ${why === "due" ? "today" : due}.\n\n` +
    `${how}\n\n` +
    `Questions? Reply to this email${phone}.\n\n` +
    `${site.name}\n${site.legalName}`;

  const r = await sendMail({
    to: customer.email,
    subject,
    text,
    replyTo: isPlaceholder(facts.contact.email) ? undefined : facts.contact.email,
  });
  if (r.ok) {
    const list = policy.reminded[policy.nextDue] ?? [];
    policy.reminded = { ...policy.reminded, [policy.nextDue]: [...list, why] };
    policy.updatedAt = Date.now();
    await getStore().policies.put(policy);
  }
  return r;
}
