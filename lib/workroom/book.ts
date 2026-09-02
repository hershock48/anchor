/**
 * The book: her customers, their policies, and what each one owes and when.
 *
 * This is the piece that makes payment seamless for the CUSTOMER: the site
 * cannot ask a carrier what a policy owes (no carrier offers that to an
 * agency this size, and the paid vendors in this space do not have it
 * either), so the amount and the due date come from HER, entered here or
 * imported from her agency management system's export. From a book entry the
 * workroom mints a pay link that opens an Anchor-branded checkout already
 * filled in, and the customer never has an account or a password.
 *
 * SHARED BY THE SERVER STORE AND THE BROWSER SCREENS, so this file must stay
 * free of `server-only` and of any database import (lib/workroom/leads.ts
 * records why: a value import drags `pg` into the client bundle). Types,
 * constants, date arithmetic and validation only.
 */

export type Cadence = "monthly" | "quarterly" | "semiannual" | "annual" | "once";

export const CADENCES: {
  key: Cadence;
  label: string;
  /** Months between installments. 0 means a single invoice. */
  months: number;
  /** How Stripe bills it as autopay. Absent for a single invoice. */
  stripe?: { interval: "month" | "year"; count: number };
}[] = [
  { key: "monthly", label: "Monthly", months: 1, stripe: { interval: "month", count: 1 } },
  { key: "quarterly", label: "Every 3 months", months: 3, stripe: { interval: "month", count: 3 } },
  { key: "semiannual", label: "Every 6 months", months: 6, stripe: { interval: "month", count: 6 } },
  { key: "annual", label: "Yearly", months: 12, stripe: { interval: "year", count: 1 } },
  { key: "once", label: "One invoice", months: 0 },
];

export const cadenceOf = (key: string) => CADENCES.find((c) => c.key === key) ?? null;

/** The pay-to value meaning "an invoice from the agency itself". */
export const AGENCY = "agency";

export type PolicyStatus = "active" | "closed";

export type Customer = {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  phone: string;
  email: string;
  /** Five digits. With the policy number, the two things a customer knows
   *  that let them find their bill without a login. */
  zip: string;
  /** The agency's own notes about the customer. */
  notes: string;
};

export type Policy = {
  id: string;
  customerId: string;
  createdAt: number;
  updatedAt: number;
  status: PolicyStatus;
  /** The carrier's name as it appears in site.carriers, or any name. */
  carrier: string;
  policyNumber: string;
  /** policyNumber with spaces, dashes and case removed, for the lookup. */
  policyNumberKey: string;
  /** How the customer knows it: "the Civic", "the house". Used in messages. */
  label: string;
  /** Coverage line slug, if known. */
  line: string;
  /** The installment. What one payment is. */
  amountCents: number;
  cadence: Cadence;
  /** YYYY-MM-DD of the next installment, or null when nothing is due. */
  nextDue: string | null;
  /** AGENCY, or a carrier name. Whether the site may take the money for a
   *  carrier is decided by that carrier's payableHere flag in site.ts, never
   *  by this field alone. */
  payTo: string;
  /** Set when the customer turned on autopay through the site. */
  autopay: { subscriptionId: string; since: number } | null;
  /** Reminder bookkeeping: for each due date, which reminders went out. */
  reminded: Record<string, string[]>;
};

export type Payment = {
  /** The Stripe object that proves it: a checkout session id for a one-time
   *  payment, an invoice id for an autopay cycle. Being the id is what makes
   *  recording idempotent across the return page and the webhook. */
  id: string;
  createdAt: number;
  policyId: string;
  customerId: string;
  /** Premium and fee kept apart, always. */
  premiumCents: number;
  feeCents: number;
  totalCents: number;
  kind: "one-time" | "autopay";
  /** The installment date this paid, if the book knew one. */
  forDue: string | null;
  paidAt: number;
  payerEmail: string;
  /** Which path recorded it first. */
  recordedVia: "return" | "webhook";
  stripe: { sessionId?: string; paymentIntentId?: string; invoiceId?: string; subscriptionId?: string };
};

/** One row of the book list: a customer with a summary of their policies. */
export type BookRow = Customer & {
  policies: Pick<Policy, "id" | "carrier" | "policyNumber" | "label" | "amountCents" | "cadence" | "nextDue" | "payTo" | "status">[];
  /** The earliest upcoming due date across active policies, for the list. */
  nextDue: string | null;
  autopay: boolean;
};

/* ------------------------------ helpers ------------------------------ */

export function normalizePolicyNumber(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function normalizeZip(s: string): string {
  const d = s.replace(/\D/g, "");
  return d.slice(0, 5);
}

export const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + "T00:00:00Z"));

/**
 * Calendar arithmetic on a YYYY-MM-DD string, no time zone involved: a due
 * date is a date, and the 31st plus one month is the last day of the next
 * month, which is what a bill does.
 */
export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const day = Math.min(d, lastDay);
  return `${first.getUTCFullYear()}-${String(first.getUTCMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Days from `from` to `to`, both YYYY-MM-DD. Negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / 86_400_000);
}

/** "Mar 3" or "Mar 3, 2027" when the year differs from `today`. */
export function dueLabel(iso: string, today?: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const sameYear = today ? today.slice(0, 4) === iso.slice(0, 4) : true;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC", ...(sameYear ? {} : { year: "numeric" }) });
}

export function money(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** "$1,234.56" or "1234.5" -> 123456. Null when it does not read as money. */
export function toCents(raw: string): number | null {
  const s = raw.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const cents = Math.round(parseFloat(s) * 100);
  return Number.isSafeInteger(cents) ? cents : null;
}

/* ----------------------------- validation ----------------------------- */

export type CustomerInput = Pick<Customer, "name" | "phone" | "email" | "zip" | "notes">;
export type PolicyInput = Pick<Policy, "carrier" | "policyNumber" | "label" | "line" | "cadence" | "payTo"> & {
  amount: string;
  nextDue: string;
};

export function customerErrors(c: Partial<CustomerInput>): Partial<Record<keyof CustomerInput, string>> {
  const e: Partial<Record<keyof CustomerInput, string>> = {};
  if (!c.name?.trim()) e.name = "A name is needed.";
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) e.email = "That does not look like an email address.";
  if (c.phone && c.phone.replace(/\D/g, "").length < 10) e.phone = "A phone number needs ten digits.";
  if (!c.zip || normalizeZip(c.zip).length !== 5) e.zip = "Five digits. The customer uses it to find their bill.";
  return e;
}

export function policyErrors(p: Partial<PolicyInput>, maxCents: number): Partial<Record<keyof PolicyInput, string>> {
  const e: Partial<Record<keyof PolicyInput, string>> = {};
  if (!p.carrier?.trim()) e.carrier = "Which carrier.";
  if (!p.policyNumber?.trim() || normalizePolicyNumber(p.policyNumber).length < 3) e.policyNumber = "The policy number as it appears on the bill.";
  const cents = toCents(p.amount ?? "");
  if (cents === null || cents < 100) e.amount = "The installment amount, like 142.10.";
  else if (cents > maxCents) e.amount = `Above ${money(maxCents)}, which the site does not take online.`;
  if (!p.cadence || !cadenceOf(p.cadence)) e.cadence = "How often it is billed.";
  if (p.nextDue && !isISODate(p.nextDue)) e.nextDue = "A date, like 2026-03-03.";
  if (!p.payTo?.trim()) e.payTo = "Who the money is for.";
  return e;
}
