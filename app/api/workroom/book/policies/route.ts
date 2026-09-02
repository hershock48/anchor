import { NextResponse } from "next/server";
import { isWorkroomAuthed } from "@/lib/workroom/auth";
import { getStore, newId } from "@/lib/workroom/store";
import { payments } from "@/lib/site";
import {
  AGENCY,
  cadenceOf,
  normalizePolicyNumber,
  policyErrors,
  toCents,
  type Cadence,
  type Policy,
  type PolicyInput,
} from "@/lib/workroom/book";

/**
 * A customer's policies. POST adds, PUT edits (or closes, via `status`),
 * DELETE removes one that never took a payment and is not on autopay;
 * anything else is closed instead, so the payment history keeps its policy.
 *
 * Editing never touches `autopay` or `reminded`: those belong to Stripe and
 * to the nightly job respectively, and a form should not be able to forget
 * that a subscription exists.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanPolicy(raw: Record<string, unknown>): PolicyInput {
  const s = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).trim().slice(0, 200) : "");
  const carrier = s("carrier");
  const payToRaw = s("payTo");
  return {
    carrier,
    policyNumber: s("policyNumber"),
    label: s("label"),
    line: s("line"),
    amount: s("amount"),
    cadence: (s("cadence") || "monthly") as Cadence,
    nextDue: s("nextDue"),
    // "agency" or the carrier itself; a free-text pay-to is not a thing.
    payTo: payToRaw.toLowerCase() === AGENCY ? AGENCY : carrier,
  };
}

function apply(target: Policy, input: PolicyInput): Policy {
  return {
    ...target,
    carrier: input.carrier,
    policyNumber: input.policyNumber,
    policyNumberKey: normalizePolicyNumber(input.policyNumber),
    label: input.label,
    line: input.line,
    amountCents: toCents(input.amount) ?? target.amountCents,
    cadence: cadenceOf(input.cadence) ? input.cadence : target.cadence,
    nextDue: input.nextDue || null,
    payTo: input.payTo,
    updatedAt: Date.now(),
  };
}

export async function POST(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { customerId?: string; policy?: Record<string, unknown> } | null;
  if (!body?.customerId || !body.policy) return NextResponse.json({ error: "Malformed." }, { status: 400 });
  const store = getStore();
  if (!(await store.customers.get(body.customerId))) return NextResponse.json({ error: "No such customer." }, { status: 404 });
  const input = cleanPolicy(body.policy);
  const errors = policyErrors(input, payments.maxOnlineCents);
  if (Object.keys(errors).length) return NextResponse.json({ error: "Check the marked boxes.", errors }, { status: 400 });
  const now = Date.now();
  const policy = apply(
    {
      id: newId("pol"), customerId: body.customerId, createdAt: now, updatedAt: now, status: "active",
      carrier: "", policyNumber: "", policyNumberKey: "", label: "", line: "", amountCents: 0,
      cadence: "monthly", nextDue: null, payTo: AGENCY, autopay: null, reminded: {},
    },
    input
  );
  await store.policies.put(policy);
  return NextResponse.json({ ok: true, policy });
}

export async function PUT(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: string; policy?: Record<string, unknown>; status?: string } | null;
  if (!body?.id) return NextResponse.json({ error: "Malformed." }, { status: 400 });
  const store = getStore();
  const existing = await store.policies.get(body.id);
  if (!existing) return NextResponse.json({ error: "No such policy." }, { status: 404 });
  let next = existing;
  if (body.policy) {
    const input = cleanPolicy(body.policy);
    const errors = policyErrors(input, payments.maxOnlineCents);
    if (Object.keys(errors).length) return NextResponse.json({ error: "Check the marked boxes.", errors }, { status: 400 });
    next = apply(existing, input);
  }
  if (body.status === "active" || body.status === "closed") {
    if (body.status === "closed" && existing.autopay) {
      return NextResponse.json({ error: "Stop autopay before closing this policy." }, { status: 409 });
    }
    next = { ...next, status: body.status, updatedAt: Date.now() };
  }
  await store.policies.put(next);
  return NextResponse.json({ ok: true, policy: next });
}

export async function DELETE(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: string; purge?: boolean } | null;
  if (!body?.id) return NextResponse.json({ error: "Malformed." }, { status: 400 });
  const store = getStore();
  const existing = await store.policies.get(body.id);
  if (!existing) return NextResponse.json({ error: "No such policy." }, { status: 404 });
  if (existing.autopay) return NextResponse.json({ error: "Stop autopay first." }, { status: 409 });
  const payments = await store.payments.list({ policyId: body.id });
  if (payments.length) {
    // A paid policy closes rather than deletes, so the record keeps its
    // policy. PURGE is the explicit exception for an entry that should never
    // have existed (a test, a typo): only a CLOSED policy, only when asked
    // for by name, and the payment records go with it. Stripe still has the
    // charges; this is the book's copy.
    if (!body.purge || existing.status !== "closed") {
      return NextResponse.json({ error: "This policy took payments. Close it instead, so the record keeps its policy." }, { status: 409 });
    }
    for (const p of payments) await store.payments.remove(p.id);
  }
  await store.policies.remove(body.id);
  return NextResponse.json({ ok: true, purged: payments.length });
}
