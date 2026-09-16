import { NextResponse } from "next/server";
import { isWorkroomAuthed } from "@/lib/workroom/auth";
import { stripe, stripeKey } from "@/lib/stripe";
import { CADENCES } from "@/lib/workroom/book";

/**
 * The payments view, read only.
 *
 * READ ONLY IS THE WHOLE DESIGN. The workroom gate is a passcode, and
 * lib/workroom/auth.ts says out loud what that means: nothing behind it may
 * charge or refund. So this route lists what Stripe already knows and never
 * writes. Refunds happen in the Stripe dashboard, behind Stripe's own login.
 *
 * Two calls, because they answer two different questions:
 *
 *   checkout sessions  who paid, how much, for which policy and carrier. Our
 *                      labels live on the SESSION (that is where
 *                      /api/pay puts them), not on the payment intent, so
 *                      this is the list that can say "Jane, policy 4471".
 *   subscriptions      whose autopay is running, and for what. The recurring
 *                      months after the first are invoices rather than
 *                      sessions, so without this a month-three charge would
 *                      be invisible here.
 *
 * BOTH GO THROUGH lib/stripe.ts, AND THAT IS NOT TIDINESS. This route had
 * its own fetch helper from before Stripe Connect was wired (September 2,
 * 2026), with no `Stripe-Account` header. Once STRIPE_ACCOUNT is set the
 * checkout creates sessions on HER connected account, so a listing on the
 * bare platform key would have shown her an empty screen, or worse, the
 * studio's own sessions from other clients' agreement pages. The shared
 * helper sends the header on every call, and honours STRIPE_API_BASE so the
 * stand-in used by the end-to-end test covers this screen too.
 *
 * Honest states: no key means payments are not switched on yet and the screen
 * says exactly that, rather than showing an empty table that reads as "nobody
 * has ever paid you".
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StripeList = { data?: Record<string, unknown>[] };

/**
 * The book's own label for a Stripe recurring price ("monthly", "every 3
 * months", "yearly"), so the screen says what the cadence actually is
 * instead of calling every autopay monthly.
 */
function cadenceLabel(price: Record<string, unknown>): string {
  const rec = (price.recurring ?? {}) as { interval?: string; interval_count?: number };
  if (!rec.interval) return "";
  const count = rec.interval_count ?? 1;
  const known = CADENCES.find((c) => c.stripe && c.stripe.interval === rec.interval && c.stripe.count === count);
  if (known) return known.label.toLowerCase();
  return `every ${count} ${rec.interval}${count > 1 ? "s" : ""}`;
}

export async function GET() {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });

  if (!stripeKey()) return NextResponse.json({ configured: false });

  try {
    const [sessions, subs] = await Promise.all([
      stripe<StripeList>("/v1/checkout/sessions?limit=25"),
      stripe<StripeList>("/v1/subscriptions?limit=25&status=active"),
    ]);

    const payments = (sessions.data ?? [])
      // A session exists from the moment someone reaches the card form, so
      // unpaid ones are abandoned checkouts, not money. Only paid rows here.
      .filter((s) => s.payment_status === "paid")
      .map((s) => {
        const meta = (s.metadata ?? {}) as Record<string, string>;
        const details = (s.customer_details ?? {}) as Record<string, unknown>;
        return {
          id: String(s.id ?? ""),
          created: Number(s.created ?? 0),
          amountCents: Number(s.amount_total ?? 0),
          mode: String(s.mode ?? ""),
          email: typeof details.email === "string" ? details.email : "",
          payer: meta.payer_name ?? "",
          policy: meta.policy ?? "",
          payTo: meta.pay_to ?? "",
        };
      });

    const autopays = (subs.data ?? []).map((s) => {
      const meta = (s.metadata ?? {}) as Record<string, string>;
      const items = ((s.items as Record<string, unknown>)?.data ?? []) as Record<string, unknown>[];
      const cycleCents = items.reduce((sum, it) => {
        const price = (it.price ?? {}) as Record<string, unknown>;
        return sum + Number(price.unit_amount ?? 0) * Number(it.quantity ?? 1);
      }, 0);
      const first = items[0] ?? {};
      return {
        id: String(s.id ?? ""),
        created: Number(s.created ?? 0),
        // Stripe's 2025-03-31 API version moved current_period_end from the
        // subscription onto each of its items. Read whichever this account's
        // version sends; 0 means neither did.
        nextCharge: Number(s.current_period_end ?? first.current_period_end ?? 0),
        cycleCents,
        cadence: cadenceLabel((first.price ?? {}) as Record<string, unknown>),
        payer: meta.payer_name ?? "",
        policy: meta.policy ?? "",
        payTo: meta.pay_to ?? "",
      };
    });

    return NextResponse.json({ configured: true, payments, autopays });
  } catch (err) {
    console.error("[workroom] stripe read failed", err);
    return NextResponse.json({ configured: true, error: "Stripe did not answer." }, { status: 502 });
  }
}
