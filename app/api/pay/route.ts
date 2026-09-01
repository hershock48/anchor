import { NextResponse } from "next/server";
import { payments } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Agency-billed invoice payments, over Stripe hosted checkout.
 *
 * DEFENSE IN DEPTH WITH THE PAGE: /pay only renders the card form when
 * `payments.agencyBillCheckout` is true, and this handler refuses
 * independently when it is false, so a stale form or a hand-crafted POST
 * cannot take money the client is not cleared to take. The flip conditions
 * (agency-billed confirmation, trust account, attorney/E&O nod, env keys)
 * are documented on that flag in lib/site.ts.
 *
 * THE AGENCY IS TOLD BEFORE THE CUSTOMER IS SENT TO PAY. Lifted from
 * louies' checkout, where the lesson was earned: with no webhook, a session
 * created and paid is otherwise a charge nobody has a record of. Emailing
 * first means the worst case is a notice about a payment nobody completed,
 * which is a phone call; the other way round, the worst case is premium
 * sitting unapplied while a policy lapses. The Stripe session also carries
 * name and policy in metadata, so the dashboard tells the same story.
 *
 * No card data ever touches this server: the form posts name, policy and
 * amount, and the card is entered on Stripe's own page. Raw REST, no SDK,
 * same as louies; one fewer dependency to patch.
 */

function clean(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim().slice(0, 400) : "";
}

/** "$1,234.56" -> 123456. Null when it does not read as money. */
function toCents(raw: string): number | null {
  const s = raw.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const cents = Math.round(parseFloat(s) * 100);
  return Number.isSafeInteger(cents) ? cents : null;
}

async function notify(fields: { name: string; policy: string; cents: number; email: string }) {
  const to = process.env.PAY_NOTIFY_TO;
  const key = process.env.RESEND_API_KEY;
  if (!to || !key) {
    console.warn("[pay] PAY_NOTIFY_TO or RESEND_API_KEY is not set; payment attempt not emailed.");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Anchor payments <anchor@glazedweb.com>",
        to: [to],
        subject: `Payment attempt: ${fields.name}, policy ${fields.policy}, $${(fields.cents / 100).toFixed(2)}`,
        text:
          `A customer just started an agency-invoice payment on the site.\n\n` +
          `Name: ${fields.name}\nPolicy: ${fields.policy}\n` +
          `Invoice amount: $${(fields.cents / 100).toFixed(2)}\n` +
          (payments.convenienceFeeCents > 0
            ? `Online payment fee: $${(payments.convenienceFeeCents / 100).toFixed(2)} (separate line item)\n`
            : "") +
          `Receipt email: ${fields.email || "(none given)"}\n\n` +
          `This is sent BEFORE Stripe, so match it against the Stripe dashboard. ` +
          `No charge exists unless Stripe shows one.`,
      }),
    });
    if (!res.ok) console.error("[pay] notify failed", res.status, await res.text());
  } catch (err) {
    console.error("[pay] notify failed", err);
  }
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const back = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);

  // Honeypot: accept silently, do nothing.
  if (clean(form.get("company"))) return back("/pay");

  if (!payments.agencyBillCheckout) {
    console.warn("[pay] POST received while agencyBillCheckout is off; refused.");
    return back("/pay");
  }

  const name = clean(form.get("name"));
  const policy = clean(form.get("policy"));
  const email = clean(form.get("email"));
  const cents = toCents(clean(form.get("amount")));

  if (!name || !policy || cents === null || cents < 100 || cents > payments.maxOnlineCents) {
    console.warn("[pay] rejected submission", JSON.stringify({ name: !!name, policy: !!policy, cents }));
    return back("/pay");
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // The flag is on but the key is not: a wiring fault, not a customer fault.
    console.error("[pay] agencyBillCheckout is on but STRIPE_SECRET_KEY is not set.");
    return back("/pay");
  }

  console.log(
    "[pay] payment attempt",
    JSON.stringify({ receivedAt: new Date().toISOString(), name, policy, cents })
  );
  await notify({ name, policy, cents, email });

  const origin = new URL(req.url).origin;
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", `${origin}/pay/received`);
  body.set("cancel_url", `${origin}/pay`);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", String(cents));
  body.set("line_items[0][price_data][product_data][name]", `Premium payment, policy ${policy}`);
  // The online-channel fee is its OWN line item, so the Stripe receipt shows
  // premium and fee separately and the fee is never inside premium. The
  // disclosure lives on the form, before the customer gets here.
  if (payments.convenienceFeeCents > 0) {
    body.set("line_items[1][quantity]", "1");
    body.set("line_items[1][price_data][currency]", "usd");
    body.set("line_items[1][price_data][unit_amount]", String(payments.convenienceFeeCents));
    body.set(
      "line_items[1][price_data][product_data][name]",
      "Online payment fee, Glazed Web (payment technology provider)"
    );
  }
  body.set("metadata[payer_name]", name);
  body.set("metadata[policy]", policy);
  if (email.includes("@")) body.set("customer_email", email);

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const session = (await res.json()) as { url?: string; error?: { message?: string } };
    if (res.ok && session.url) return NextResponse.redirect(session.url, 303);
    console.error("[pay] stripe refused the session:", session.error?.message ?? res.status);
  } catch (err) {
    console.error("[pay] stripe unreachable", err);
  }

  // Stripe said no or was unreachable: back to the page, nothing charged,
  // and the notify email above already tells the agency someone was trying.
  return back("/pay");
}
