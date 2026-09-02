import { NextResponse } from "next/server";
import { isWorkroomAuthed } from "@/lib/workroom/auth";
import { getStore } from "@/lib/workroom/store";
import { checkoutLive, payLinkFor, payRoute } from "@/lib/pay";
import { payLinkSecret } from "@/lib/paylink";

/**
 * One customer, whole: the record, every policy with where its money goes
 * and a fresh pay link, and every payment made through the site.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const store = getStore();
  const customer = await store.customers.get(id);
  if (!customer) return NextResponse.json({ error: "No such customer." }, { status: 404 });
  const [policies, payments] = await Promise.all([store.policies.list({ customerId: id }), store.payments.list({ customerId: id })]);
  return NextResponse.json({
    customer,
    policies: policies
      .sort((a, b) => (a.status === b.status ? a.createdAt - b.createdAt : a.status === "active" ? -1 : 1))
      .map((p) => ({ ...p, route: payRoute(p), payLink: payLinkFor(p, url.origin) })),
    payments: payments.sort((a, b) => b.paidAt - a.paidAt),
    backend: store.backend,
    checkoutLive: checkoutLive(),
    linksOn: payLinkSecret() !== null,
    mailOn: !!process.env.RESEND_API_KEY,
  });
}
