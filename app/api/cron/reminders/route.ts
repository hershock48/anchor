import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { payments } from "@/lib/site";
import { siteOrigin } from "@/lib/url";
import { getStore } from "@/lib/workroom/store";
import { daysBetween } from "@/lib/workroom/book";
import { sendReminder, today } from "@/lib/pay";

/**
 * The nightly reminder: "your payment is due", sent on the schedule in
 * payments.reminderDaysBefore, once per reminder per due date, to active
 * policies that are not on autopay and whose customer has an email.
 *
 * Vercel calls this on the schedule in vercel.json and signs the call with
 * CRON_SECRET as a bearer token. No secret in production means the route
 * answers 503 and sends nothing, rather than letting anyone on the internet
 * trigger a mail run. Locally, no secret means open, so it can be exercised.
 *
 * This is the automation the .99 pays for: every installment becomes a
 * click through the site instead of a bill the customer has to remember.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: process.env.CRON_SECRET ? "Locked." : "CRON_SECRET is not set." }, { status: process.env.CRON_SECRET ? 401 : 503 });
  }
  const store = getStore();
  const origin = siteOrigin();
  const now = today();
  const out = { date: now, considered: 0, sent: 0, skipped: 0, failed: [] as string[] };

  for (const policy of await store.policies.list()) {
    if (policy.status !== "active" || !policy.nextDue || policy.autopay) continue;
    out.considered++;
    const days = daysBetween(now, policy.nextDue);
    const kind = days === 0 ? "due" : "upcoming";
    if (!payments.reminderDaysBefore.includes(days)) continue;
    if ((policy.reminded[policy.nextDue] ?? []).includes(kind)) {
      out.skipped++;
      continue;
    }
    const customer = await store.customers.get(policy.customerId);
    if (!customer?.email.includes("@")) {
      out.skipped++;
      continue;
    }
    const r = await sendReminder(policy, customer, origin, kind);
    if (r.ok) out.sent++;
    else out.failed.push(`${policy.id}: ${r.error}`);
  }
  console.log("[cron] reminders", JSON.stringify(out));
  return NextResponse.json(out);
}
