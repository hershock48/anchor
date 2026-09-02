import { NextResponse } from "next/server";
import { getStore } from "@/lib/workroom/store";
import { readPayLink, payLinkPath } from "@/lib/paylink";
import { checkoutLive, createCheckout, payRoute } from "@/lib/pay";
import { cadenceOf, money } from "@/lib/workroom/book";

/**
 * From the prefilled bill to Stripe. The form carries the pay-link token
 * and ONE choice (once, or autopay). Everything about money comes from the
 * book: the amount, the cadence, who it is for. Refuses independently of
 * the page when the switch is off, when the key is missing, or when the
 * policy routes to a carrier, so a stale form or a hand-crafted POST cannot
 * take money the agency is not cleared to take.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const back = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return back("/pay");
  }
  const token = String(form.get("token") ?? "");
  const mode = String(form.get("mode") ?? "once");
  const read = readPayLink(token);
  if (!read) return back("/pay");
  const bill = payLinkPath(token);

  if (!checkoutLive()) {
    console.warn("[pay] checkout POST while the switch is off or the key is missing; refused.");
    return back(`${bill}?problem=off`);
  }

  const store = getStore();
  const policy = await store.policies.get(read.policyId);
  const customer = policy ? await store.customers.get(policy.customerId) : null;
  if (!policy || !customer) return back("/pay");
  if (payRoute(policy).kind !== "here" || policy.autopay) return back(bill);

  const autopay = mode === "autopay" && !!cadenceOf(policy.cadence)?.stripe;
  console.log(
    "[pay] checkout",
    JSON.stringify({ at: new Date().toISOString(), policyId: policy.id, amount: money(policy.amountCents), autopay, payTo: policy.payTo })
  );
  try {
    const url = await createCheckout({ policy, customer, autopay, origin: new URL(req.url).origin });
    return NextResponse.redirect(url, 303);
  } catch (err) {
    console.error("[pay] stripe refused or was unreachable:", err);
    return back(`${bill}?problem=stripe`);
  }
}
