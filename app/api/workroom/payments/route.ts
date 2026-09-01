import { NextResponse } from "next/server";
import { isWorkroomAuthed } from "@/lib/workroom/auth";

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
 * Honest states: no key means payments are not switched on yet and the screen
 * says exactly that, rather than showing an empty table that reads as "nobody
 * has ever paid you".
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StripeList = { data?: Record<string, unknown>[]; error?: { message?: string } };

async function stripe(path: string, key: string): Promise<StripeList> {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  return (await res.json()) as StripeList;
}

export async function GET() {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ configured: false });

  try {
    const [sessions, subs] = await Promise.all([
      stripe("checkout/sessions?limit=25", key),
      stripe("subscriptions?limit=25&status=active", key),
    ]);

    if (sessions.error || subs.error) {
      console.error("[workroom] stripe read failed:", sessions.error?.message ?? subs.error?.message);
      return NextResponse.json({ configured: true, error: "Stripe did not answer." }, { status: 502 });
    }

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
      const monthlyCents = items.reduce((sum, it) => {
        const price = (it.price ?? {}) as Record<string, unknown>;
        return sum + Number(price.unit_amount ?? 0) * Number(it.quantity ?? 1);
      }, 0);
      return {
        id: String(s.id ?? ""),
        created: Number(s.created ?? 0),
        currentPeriodEnd: Number(s.current_period_end ?? 0),
        monthlyCents,
        payer: meta.payer_name ?? "",
        policy: meta.policy ?? "",
        payTo: meta.pay_to ?? "",
      };
    });

    return NextResponse.json({ configured: true, payments, autopays });
  } catch (err) {
    console.error("[workroom] stripe unreachable", err);
    return NextResponse.json({ configured: true, error: "Stripe could not be reached." }, { status: 502 });
  }
}
