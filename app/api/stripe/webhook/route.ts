import { NextResponse } from "next/server";
import { verifyStripeSignature, type StripeInvoice } from "@/lib/stripe";
import { getStore } from "@/lib/workroom/store";
import { endAutopay, recordInvoice, recordSession } from "@/lib/pay";

/**
 * Stripe tells us what happened. Three events matter:
 *
 *   checkout.session.completed   a one-time payment (recorded) or autopay
 *                                switched on (remembered on the policy)
 *   invoice.paid                 one autopay cycle collected (recorded)
 *   customer.subscription.deleted autopay ended on Stripe's side
 *
 * Signature first, on the RAW body, always. Unset secret means this route
 * answers 503 and Stripe keeps retrying, which is the visible failure we
 * want; the return page still records one-time payments meanwhile, and
 * autopay cycles are recorded the first time this route is configured and
 * Stripe replays them. A 500 here makes Stripe retry, so any throw is fine.
 *
 * Configure in Stripe, on GLAZED'S platform account: Developers > Webhooks >
 * add endpoint https://<host>/api/stripe/webhook, choose "events on
 * Connected accounts", pick those three events, then set
 * STRIPE_WEBHOOK_SECRET in Vercel. (Without Connect, a plain endpoint on
 * the key's own account works the same way.)
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const raw = await req.text();
  if (!secret) {
    console.error("[stripe] webhook received but STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }
  if (!verifyStripeSignature(raw, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Bad signature." }, { status: 400 });
  }

  // A Connect endpoint delivers events from HER account with `account` set;
  // the session is fetched from that account, never from the platform's.
  let event: { id: string; type: string; account?: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad JSON." }, { status: 400 });
  }
  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const r = await recordSession(String(obj.id), "webhook", event.account);
      console.log("[stripe] session", obj.id, r.payment ? "recorded" : r.autopayStarted ? "autopay on" : "nothing to record");
      break;
    }
    case "invoice.paid": {
      const p = await recordInvoice(obj as unknown as StripeInvoice);
      console.log("[stripe] invoice", obj.id, p ? "recorded" : "not ours or nothing paid");
      break;
    }
    case "customer.subscription.deleted": {
      const subId = String(obj.id);
      const policy = (await getStore().policies.list()).find((p) => p.autopay?.subscriptionId === subId);
      if (policy) await endAutopay(policy, false);
      console.log("[stripe] subscription ended", subId, policy ? `policy ${policy.id}` : "not ours");
      break;
    }
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
