import { NextResponse } from "next/server";
import { isWorkroomAuthed } from "@/lib/workroom/auth";
import { getStore, newId } from "@/lib/workroom/store";
import { parseCsv } from "@/lib/workroom/csv";
import { payments } from "@/lib/site";
import {
  AGENCY,
  cadenceOf,
  customerErrors,
  normalizePolicyNumber,
  normalizeZip,
  policyErrors,
  toCents,
  type Cadence,
  type Customer,
  type Policy,
} from "@/lib/workroom/book";

/**
 * Import the book from a spreadsheet: one row per policy, the customer's
 * details repeated on each of their rows, which is how every agency
 * management system exports.
 *
 * ADDITIVE AND IDEMPOTENT. A customer is matched by email, or by name and
 * ZIP when there is no email; a policy by carrier and policy number. Matched
 * rows are UPDATED (amount, due date, label), new ones created, nothing is
 * ever deleted, and autopay and payment history on an existing policy are
 * untouched. So re-importing next month's export is the way to keep the
 * book current, and a bad file can be fixed and re-run.
 *
 * Columns (header row, any order, case and punctuation ignored):
 *   name, phone, email, zip, carrier, policy, label, line, amount, cadence,
 *   next_due, pay_to
 * Required per row: name, zip, carrier, policy, amount. cadence defaults to
 * monthly, pay_to to the carrier (write "agency" for an agency invoice).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALIASES: Record<string, string> = {
  name: "name", customer: "name", insured: "name",
  phone: "phone", telephone: "phone", mobile: "phone", cell: "phone",
  email: "email", emailaddress: "email",
  zip: "zip", zipcode: "zip", postal: "zip", postalcode: "zip",
  carrier: "carrier", company: "carrier", insurer: "carrier",
  policy: "policy", policynumber: "policy", policyno: "policy", policynum: "policy",
  label: "label", covers: "label", description: "label", vehicle: "label", nickname: "label",
  line: "line", lob: "line", lineofbusiness: "line", type: "line",
  amount: "amount", installment: "amount", premium: "amount", payment: "amount",
  cadence: "cadence", billing: "cadence", frequency: "cadence", term: "cadence",
  nextdue: "next_due", due: "next_due", duedate: "next_due", nextduedate: "next_due",
  payto: "pay_to", collect: "pay_to", billedby: "pay_to",
};

function cadenceFrom(s: string): Cadence {
  const v = s.trim().toLowerCase();
  if (!v || /month/.test(v)) return "monthly";
  if (/quarter|3 ?mo/.test(v)) return "quarterly";
  if (/semi|6 ?mo|half/.test(v)) return "semiannual";
  if (/annual|year|12 ?mo/.test(v)) return "annual";
  if (/once|single|one/.test(v)) return "once";
  return cadenceOf(v) ? (v as Cadence) : "monthly";
}

function dateFrom(s: string): string {
  const v = s.trim();
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); // US m/d/y
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  return v;
}

export async function POST(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  let text = "";
  const ctype = req.headers.get("content-type") ?? "";
  if (ctype.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (file && typeof file !== "string") text = await file.text();
    else if (typeof form?.get("csv") === "string") text = String(form.get("csv"));
  } else {
    const body = (await req.json().catch(() => null)) as { csv?: string } | null;
    text = body?.csv ?? "";
  }
  if (!text.trim()) return NextResponse.json({ error: "Nothing to import." }, { status: 400 });
  if (text.length > 2_000_000) return NextResponse.json({ error: "That file is too large." }, { status: 413 });

  const rows = parseCsv(text);
  if (rows.length < 2) return NextResponse.json({ error: "Need a header row and at least one policy row." }, { status: 400 });
  const header = rows[0].map((h) => ALIASES[h.toLowerCase().replace(/[^a-z]/g, "")] ?? "");
  const need = ["name", "zip", "carrier", "policy", "amount"].filter((k) => !header.includes(k));
  if (need.length) return NextResponse.json({ error: `Missing column(s): ${need.join(", ")}.` }, { status: 400 });

  const store = getStore();
  const [customers, policies] = await Promise.all([store.customers.list(), store.policies.list()]);
  const byEmail = new Map(customers.filter((c) => c.email).map((c) => [c.email.toLowerCase(), c]));
  const byNameZip = new Map(customers.map((c) => [`${c.name.toLowerCase()}|${c.zip}`, c]));
  const byPolicy = new Map(policies.map((p) => [`${p.carrier.toLowerCase()}|${p.policyNumberKey}`, p]));
  const out = { created: { customers: 0, policies: 0 }, updated: { customers: 0, policies: 0 }, errors: [] as { row: number; message: string }[] };

  for (let r = 1; r < rows.length; r++) {
    const get = (k: string) => (rows[r][header.indexOf(k)] ?? "").trim();
    const cIn = { name: get("name"), phone: get("phone"), email: get("email").toLowerCase(), zip: normalizeZip(get("zip")), notes: "" };
    const cErr = customerErrors(cIn);
    if (Object.keys(cErr).length) {
      out.errors.push({ row: r + 1, message: Object.values(cErr).join(" ") });
      continue;
    }
    const carrier = get("carrier");
    const pIn = {
      carrier,
      policyNumber: get("policy"),
      label: get("label"),
      line: get("line").toLowerCase(),
      amount: get("amount"),
      cadence: cadenceFrom(get("cadence")),
      nextDue: dateFrom(get("next_due")),
      payTo: /^agency|anchor|us$/i.test(get("pay_to").trim()) ? AGENCY : carrier,
    };
    const pErr = policyErrors(pIn, payments.maxOnlineCents);
    if (Object.keys(pErr).length) {
      out.errors.push({ row: r + 1, message: Object.values(pErr).join(" ") });
      continue;
    }

    const now = Date.now();
    let customer = (cIn.email && byEmail.get(cIn.email)) || byNameZip.get(`${cIn.name.toLowerCase()}|${cIn.zip}`) || null;
    if (customer) {
      const next: Customer = { ...customer, name: cIn.name, phone: cIn.phone || customer.phone, email: cIn.email || customer.email, zip: cIn.zip, updatedAt: now };
      if (JSON.stringify(next) !== JSON.stringify({ ...customer, updatedAt: now })) {
        await store.customers.put(next);
        out.updated.customers++;
      }
      customer = next;
    } else {
      customer = { id: newId("cus"), createdAt: now, updatedAt: now, ...cIn };
      await store.customers.put(customer);
      out.created.customers++;
    }
    if (customer.email) byEmail.set(customer.email, customer);
    byNameZip.set(`${customer.name.toLowerCase()}|${customer.zip}`, customer);

    const key = `${carrier.toLowerCase()}|${normalizePolicyNumber(pIn.policyNumber)}`;
    const existing = byPolicy.get(key);
    const fields = {
      carrier, policyNumber: pIn.policyNumber, policyNumberKey: normalizePolicyNumber(pIn.policyNumber),
      label: pIn.label, line: pIn.line, amountCents: toCents(pIn.amount)!, cadence: pIn.cadence,
      nextDue: pIn.nextDue || null, payTo: pIn.payTo,
    };
    if (existing) {
      const next: Policy = { ...existing, ...fields, customerId: customer.id, updatedAt: now };
      await store.policies.put(next);
      byPolicy.set(key, next);
      out.updated.policies++;
    } else {
      const policy: Policy = { id: newId("pol"), customerId: customer.id, createdAt: now, updatedAt: now, status: "active", autopay: null, reminded: {}, ...fields };
      await store.policies.put(policy);
      byPolicy.set(key, policy);
      out.created.policies++;
    }
  }
  return NextResponse.json({ ok: true, ...out, rows: rows.length - 1 });
}
