import { NextResponse } from "next/server";
import { isWorkroomAuthed } from "@/lib/workroom/auth";
import { getStore } from "@/lib/workroom/store";
import { endAutopay } from "@/lib/pay";

/**
 * Stop a customer's autopay, on their call or email. Cancels the Stripe
 * subscription and clears the policy. This is the one thing behind the gate
 * that reaches into Stripe, and it can only ever STOP money moving, never
 * start it or refund it; those stay in the Stripe dashboard behind Stripe's
 * own login (lib/workroom/auth.ts says why).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { policyId?: string } | null;
  if (!body?.policyId) return NextResponse.json({ error: "Malformed." }, { status: 400 });
  const policy = await getStore().policies.get(body.policyId);
  if (!policy) return NextResponse.json({ error: "No such policy." }, { status: 404 });
  if (!policy.autopay) return NextResponse.json({ ok: true, policy });
  try {
    await endAutopay(policy, true);
  } catch (err) {
    console.error("[pay] could not cancel the subscription", err);
    return NextResponse.json({ error: "Stripe did not accept the cancellation. Try again, or cancel it in the Stripe dashboard." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, policy });
}
