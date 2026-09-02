import { NextResponse } from "next/server";
import { isWorkroomAuthed } from "@/lib/workroom/auth";
import { getStore, newId } from "@/lib/workroom/store";
import { customerErrors, normalizeZip, type BookRow, type Customer, type CustomerInput, type Policy } from "@/lib/workroom/book";

/**
 * The book's customer list. GET lists (with a search), POST adds, PUT edits,
 * DELETE removes a customer who has no policies. Every method checks the
 * gate itself, like every workroom route.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanCustomer(raw: Record<string, unknown>): CustomerInput {
  const s = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string).trim().slice(0, 300) : "");
  return { name: s("name"), phone: s("phone"), email: s("email").toLowerCase(), zip: normalizeZip(s("zip")), notes: s("notes").slice(0, 4000) };
}

export async function GET(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const store = getStore();
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
  const [customers, policies] = await Promise.all([store.customers.list(), store.policies.list()]);
  const byCustomer = new Map<string, Policy[]>();
  for (const p of policies) byCustomer.set(p.customerId, [...(byCustomer.get(p.customerId) ?? []), p]);

  const rows: BookRow[] = customers
    .map((c) => {
      const ps = byCustomer.get(c.id) ?? [];
      const active = ps.filter((p) => p.status === "active");
      return {
        ...c,
        policies: ps.map((p) => ({
          id: p.id, carrier: p.carrier, policyNumber: p.policyNumber, label: p.label,
          amountCents: p.amountCents, cadence: p.cadence, nextDue: p.nextDue, payTo: p.payTo, status: p.status,
        })),
        nextDue: active.map((p) => p.nextDue).filter((d): d is string => !!d).sort()[0] ?? null,
        autopay: active.some((p) => !!p.autopay),
      };
    })
    .filter((r) => {
      if (!q) return true;
      const hay = [r.name, r.phone, r.email, r.zip, ...r.policies.map((p) => `${p.carrier} ${p.policyNumber} ${p.label}`)].join(" ").toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ customers: rows, backend: store.backend });
}

export async function POST(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { customer?: Record<string, unknown> } | null;
  if (!body?.customer) return NextResponse.json({ error: "Malformed." }, { status: 400 });
  const input = cleanCustomer(body.customer);
  const errors = customerErrors(input);
  if (Object.keys(errors).length) return NextResponse.json({ error: "Check the marked boxes.", errors }, { status: 400 });
  const now = Date.now();
  const customer: Customer = { id: newId("cus"), createdAt: now, updatedAt: now, ...input };
  await getStore().customers.put(customer);
  return NextResponse.json({ ok: true, customer });
}

export async function PUT(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: string; customer?: Record<string, unknown> } | null;
  if (!body?.id || !body.customer) return NextResponse.json({ error: "Malformed." }, { status: 400 });
  const store = getStore();
  const existing = await store.customers.get(body.id);
  if (!existing) return NextResponse.json({ error: "No such customer." }, { status: 404 });
  const input = cleanCustomer(body.customer);
  const errors = customerErrors(input);
  if (Object.keys(errors).length) return NextResponse.json({ error: "Check the marked boxes.", errors }, { status: 400 });
  const customer: Customer = { ...existing, ...input, updatedAt: Date.now() };
  await store.customers.put(customer);
  return NextResponse.json({ ok: true, customer });
}

export async function DELETE(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: "Malformed." }, { status: 400 });
  const store = getStore();
  const policies = await store.policies.list({ customerId: body.id });
  if (policies.length) return NextResponse.json({ error: "This customer has policies. Close those first." }, { status: 409 });
  await store.customers.remove(body.id);
  return NextResponse.json({ ok: true });
}
