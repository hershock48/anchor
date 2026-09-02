import { NextResponse } from "next/server";
import { isWorkroomAuthed } from "@/lib/workroom/auth";
import { getStore } from "@/lib/workroom/store";
import { sendReminder } from "@/lib/pay";

/** "Email them the bill", from the customer screen. Same message the nightly job sends. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { policyId?: string } | null;
  if (!body?.policyId) return NextResponse.json({ error: "Malformed." }, { status: 400 });
  const store = getStore();
  const policy = await store.policies.get(body.policyId);
  const customer = policy ? await store.customers.get(policy.customerId) : null;
  if (!policy || !customer) return NextResponse.json({ error: "No such policy." }, { status: 404 });
  const r = await sendReminder(policy, customer, new URL(req.url).origin, "manual");
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 502 });
  return NextResponse.json({ ok: true, sentTo: customer.email });
}
