import type { Metadata } from "next";
import { site, payments, isPlaceholder } from "@/lib/site";
import { getFacts } from "@/lib/content";
import { readPayLink } from "@/lib/paylink";
import { getStore } from "@/lib/workroom/store";
import { AGENCY, cadenceOf, dueLabel, money } from "@/lib/workroom/book";
import { checkoutMode, payRoute, today } from "@/lib/pay";

/**
 * The customer's bill, prefilled. This is the page the pay link opens and
 * the page the find-your-bill lookup lands on.
 *
 * One bill, one amount, one decision: pay it once, or from now on. The
 * amount is the book's, never typed. If the policy is billed by a carrier
 * the agency may not collect for, the same page says so and points at the
 * carrier, in the same voice, so the customer never has to work out which
 * of two names to pay.
 *
 * Dynamic by nature (it reads a token), noindex, not in the sitemap, and
 * never linked from the customer site. The token is the whole address.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your bill",
  robots: { index: false, follow: false },
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <section className="pagehead">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <p className="kicker">Your bill</p>
        {children}
      </div>
    </section>
  );
}

export default async function PayLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ problem?: string }>;
}) {
  const { token } = await params;
  const { problem } = await searchParams;
  const facts = await getFacts();
  const havePhone = !isPlaceholder(facts.contact.phone);
  const callUs = havePhone ? (
    <a href={`tel:${facts.contact.phoneHref}`}>call {facts.contact.phone}</a>
  ) : (
    <a href="/contact">reach us</a>
  );

  const read = readPayLink(token);
  const store = getStore();
  const policy = read ? await store.policies.get(read.policyId) : null;
  const customer = policy ? await store.customers.get(policy.customerId) : null;

  if (!policy || !customer) {
    return (
      <Frame>
        <h1>That link has expired.</h1>
        <p className="lede" style={{ marginTop: 14 }}>
          Nothing is wrong with your policy. Pay links stop working after a while so an old
          email cannot open a bill forever. <a href="/pay">Find your bill</a> with your policy
          number and ZIP, or {callUs}.
        </p>
      </Frame>
    );
  }

  const first = customer.name.trim().split(/\s+/)[0] || "there";
  const route = payRoute(policy);
  const cadence = cadenceOf(policy.cadence);
  const canAutopay = !!cadence?.stripe;
  const due = policy.nextDue ? dueLabel(policy.nextDue, today()) : null;
  const fee = payments.convenienceFeeCents;
  const mode = checkoutMode();

  return (
    <>
      <Frame>
        <h1>Hi {first}.</h1>
        <p className="lede" style={{ marginTop: 14 }}>
          {policy.nextDue && route.kind !== "nothing" ? (
            <>
              Your <strong>{money(policy.amountCents)}</strong> payment for{" "}
              {policy.label || `policy ${policy.policyNumber}`} is due <strong>{due}</strong>.
            </>
          ) : (
            <>Nothing is due on {policy.label || `policy ${policy.policyNumber}`} right now.</>
          )}
        </p>
      </Frame>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 720 }}>
          <div className="card">
            <dl className="factlist">
              <dt>Policy</dt>
              <dd>{policy.policyNumber}</dd>
              <dt>Carrier</dt>
              <dd>{policy.carrier}</dd>
              {policy.label && (
                <>
                  <dt>Covers</dt>
                  <dd>{policy.label}</dd>
                </>
              )}
              <dt>Installment</dt>
              <dd>
                {money(policy.amountCents)}
                {cadence && cadence.months > 0 ? `, ${cadence.label.toLowerCase()}` : ""}
              </dd>
              {due && (
                <>
                  <dt>Due</dt>
                  <dd>{due}</dd>
                </>
              )}
            </dl>
          </div>

          {policy.autopay ? (
            <div className="card" style={{ marginTop: 16 }}>
              <h2>Autopay is on.</h2>
              <p>
                This installment charges automatically on the due date, and you get a receipt
                by email each time. Nothing to do. To change the card or stop autopay,{" "}
                {callUs}; it takes a minute.
              </p>
            </div>
          ) : route.kind === "here" && mode !== "off" ? (
            <form className="qf" method="post" action="/api/pay/checkout" style={{ marginTop: 16 }}>
              <input type="hidden" name="token" value={token} />
              <fieldset>
                <legend>Pay {money(policy.amountCents)}</legend>
                {mode === "test" && (
                  <p className="qf-optnote" role="status">
                    <strong>Test mode.</strong> This checkout is connected to a test account; no real
                    card is charged. Use a Stripe test card such as 4242 4242 4242 4242.
                  </p>
                )}
                {problem === "stripe" && (
                  <p className="qf-optnote" role="alert" style={{ color: "#8c2b21", fontWeight: 600 }}>
                    The payment page did not open. Nothing was charged. Try again, or {callUs}.
                  </p>
                )}
                {canAutopay ? (
                  <fieldset className="qf-row">
                    <legend style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 600, letterSpacing: 0, marginBottom: 6 }}>
                      How would you like to pay it?
                    </legend>
                    <div className="qf-consent">
                      <input type="radio" id="pay-once" name="mode" value="once" defaultChecked />
                      <label htmlFor="pay-once">Just this one.</label>
                    </div>
                    <div className="qf-consent">
                      <input type="radio" id="pay-auto" name="mode" value="autopay" />
                      <label htmlFor="pay-auto">
                        This one and every one after it, automatically on the due date. You get
                        a receipt each time, and one call or email stops it.
                      </label>
                    </div>
                  </fieldset>
                ) : (
                  <input type="hidden" name="mode" value="once" />
                )}
                {fee > 0 && (
                  <p className="qf-optnote">
                    Online card payments carry a flat {money(fee)} payment fee, itemized at
                    checkout. Paying by check or phone carries none.
                  </p>
                )}
                <div className="qf-actions">
                  <button className="btn" type="submit">Continue to payment</button>
                  <p className="qf-note">
                    The card form is Stripe&rsquo;s secure checkout, under our name. We never
                    see your card number.
                  </p>
                </div>
              </fieldset>
            </form>
          ) : route.kind === "here" ? (
            <div className="card" style={{ marginTop: 16 }}>
              <h2>Pay it with a person</h2>
              <p>
                Online card payments are not switched on yet. Please {callUs} and we will take
                it over the phone in two minutes, or mail a check to the address on your bill.
              </p>
            </div>
          ) : route.kind === "portal" ? (
            <div className="card" style={{ marginTop: 16 }}>
              <h2>This one is paid at {route.carrier}</h2>
              <p>
                {route.carrier} bills this policy directly, so the payment goes to them. Same
                policy, same coverage, same us if anything goes wrong.
              </p>
              <p style={{ marginTop: 12 }}>
                {route.url ? (
                  <a className="btn" href={route.url}>
                    Pay at {route.carrier}
                  </a>
                ) : (
                  <>Use the site or phone number printed on your {route.carrier} bill.</>
                )}
                {route.phone && <> Or call their billing line at {route.phone}.</>}
              </p>
            </div>
          ) : (
            <div className="card" style={{ marginTop: 16 }}>
              <h2>Nothing to pay right now</h2>
              <p>If you think that is wrong, {callUs} and we will look it up together.</p>
            </div>
          )}

          <p className="fineprint">
            A payment is not proof of coverage, and a lapsing policy does not wait for the
            mail. Not your policy? Close this page and let us know. {site.legalName}.
          </p>
        </div>
      </section>
    </>
  );
}
