import { NextResponse } from "next/server";
import { getStore } from "@/lib/workroom/store";
import { readPayLink, payLinkPath } from "@/lib/paylink";
import { recordInterest } from "@/lib/pay";

/**
 * "Ask us about these" from a bill that is paid somewhere else (at the
 * carrier, or by phone), where there is no checkout to carry the ticks.
 * Records the interest as a lead and sends the customer back to their bill
 * with a thank-you line. Plain form POST, scripts off included.
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
  const read = readPayLink(token);
  if (!read) return back("/pay");
  const keys = form.getAll("interest").filter((v): v is string => typeof v === "string").slice(0, 8);
  const store = getStore();
  const policy = await store.policies.get(read.policyId);
  const customer = policy ? await store.customers.get(policy.customerId) : null;
  if (!policy || !customer) return back("/pay");
  // Nothing ticked is not a request: back to the bill, no message.
  if (keys.length === 0) return back(payLinkPath(token));
  const names = await recordInterest(policy, customer, keys, "ask");
  return back(names.length ? `${payLinkPath(token)}?asked=${names.length}` : payLinkPath(token));
}
