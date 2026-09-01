import { site, ph, isPlaceholder, payments } from "@/lib/site";

/**
 * Pay your bill.
 *
 * TWO LAYERS, one live and one parked, and the split is the whole design.
 *
 * Layer one, live: carrier routing. Nearly every personal-lines premium is
 * billed BY THE CARRIER, and the agency agreement usually says the agent does
 * not collect it. So the honest payment page for those policies is a signpost:
 * one row per appointed carrier, pointing at that carrier's own payment portal
 * and billing phone, fed from `site.carriers`. With the list empty it renders
 * an honest call-us state instead of a fake wall.
 *
 * Layer two, parked: a Stripe checkout for AGENCY-BILLED invoices, rendered
 * only when `payments.agencyBillCheckout` is true. The flip conditions are
 * documented on that flag in lib/site.ts and in the README; until they are
 * met the section says pay by phone, and promises nothing.
 *
 * No accounts and no stored balances, on purpose. The customer's bill tells
 * them the amount; this page is the till, never the ledger.
 */
export const metadata = {
  title: "Pay your bill",
  description:
    "Most premiums are paid straight to your carrier. Start with the name on your bill, and call us if you are not sure.",
};

const havePhone = () => !isPlaceholder(site.contact.phone);

export default function Pay() {
  const carriers = site.carriers;

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Payments</p>
          <h1>Pay your bill.</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            Most policies are billed by the carrier, so the fastest way to pay is
            straight to them. Start with the name at the top of your bill. Not sure?
            Call us and we will point you at the right place in a minute.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2>Billed by your carrier</h2>
          {carriers.length === 0 ? (
            <div className="rules" style={{ marginTop: 18 }}>
              <div className="card">
                <h3>Your bill names your carrier</h3>
                <p>
                  Every carrier we place policies with has its own payment site and
                  billing line, and as our appointments are confirmed each one will be
                  listed right here. Until then, the name on your bill is the place to
                  pay, and we are happy to walk you to it:{" "}
                  {havePhone() ? (
                    <a href={`tel:${site.contact.phoneHref}`}>call {site.contact.phone}</a>
                  ) : (
                    <span className="ph">{ph(site.contact.phone)}</span>
                  )}
                  .
                </p>
              </div>
            </div>
          ) : (
            <div className="rules" style={{ marginTop: 18 }}>
              {carriers.map((c) => (
                <div className="card" key={c.name}>
                  <h3>{c.name}</h3>
                  <p>
                    {c.payUrl ? (
                      <>
                        <a href={c.payUrl}>Pay at {c.name}</a>
                        {c.billingPhone ? <>, or call billing at {c.billingPhone}.</> : "."}
                      </>
                    ) : c.billingPhone ? (
                      <>Call billing at {c.billingPhone}.</>
                    ) : (
                      <>Pay through the site or phone number printed on your bill.</>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2>Billed by us</h2>
          {payments.agencyBillCheckout ? (
            <div className="wrap qf-grid" style={{ padding: 0, marginTop: 18 }}>
              <form className="qf" method="post" action="/api/pay">
                {/* Honeypot, same mechanism as the other forms. */}
                <div className="qf-hp" aria-hidden="true">
                  <label htmlFor="pay-company">Leave this field empty</label>
                  <input id="pay-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                <fieldset>
                  <legend>Pay an agency invoice</legend>
                  <p className="qf-optnote">
                    For policies we bill directly. Copy the amount and policy number
                    from your invoice; the card form itself is Stripe&rsquo;s, and we
                    never see your card number.
                  </p>
                  <div className="qf-two">
                    <div className="qf-row">
                      <label htmlFor="pay-name">Name on the policy</label>
                      <input id="pay-name" name="name" type="text" maxLength={200} required />
                    </div>
                    <div className="qf-row">
                      <label htmlFor="pay-policy">Policy number</label>
                      <input id="pay-policy" name="policy" type="text" maxLength={100} required />
                    </div>
                  </div>
                  <div className="qf-two">
                    <div className="qf-row">
                      <label htmlFor="pay-amount">Amount from your invoice</label>
                      <input
                        id="pay-amount"
                        name="amount"
                        type="text"
                        inputMode="decimal"
                        maxLength={12}
                        required
                        placeholder="0.00"
                      />
                    </div>
                    <div className="qf-row">
                      <label htmlFor="pay-email">
                        Email for the receipt<span className="qf-opt"> (optional)</span>
                      </label>
                      <input id="pay-email" name="email" type="text" maxLength={200} />
                    </div>
                  </div>
                  <div className="qf-actions">
                    <button className="btn" type="submit">Continue to payment</button>
                    <p className="qf-note">
                      You will finish on Stripe&rsquo;s secure checkout. No card details
                      touch this site.
                    </p>
                  </div>
                </fieldset>
              </form>
              <aside className="side">
                <h2>Large or unusual payment?</h2>
                <p>
                  Anything over ${Math.round(payments.maxOnlineCents / 100).toLocaleString()}
                  {" "}or anything you are unsure about, do it with a person:{" "}
                  {havePhone() ? (
                    <a href={`tel:${site.contact.phoneHref}`}>call {site.contact.phone}</a>
                  ) : (
                    <span className="ph">{ph(site.contact.phone)}</span>
                  )}
                  .
                </p>
              </aside>
            </div>
          ) : (
            <div className="rules" style={{ marginTop: 18 }}>
              <div className="card">
                <h3>Agency invoices are paid with a person</h3>
                <p>
                  A small number of policies, usually business coverage, are billed by
                  the agency rather than a carrier. Those are paid by check or by card
                  over the phone:{" "}
                  {havePhone() ? (
                    <a href={`tel:${site.contact.phoneHref}`}>call {site.contact.phone}</a>
                  ) : (
                    <span className="ph">{ph(site.contact.phone)}</span>
                  )}{" "}
                  and it takes two minutes.
                </p>
              </div>
            </div>
          )}
          <p className="fineprint">
            A payment is not proof of coverage, and a lapsing policy does not wait for
            the mail. If you are close to a cancellation date, call us after you pay so
            we can confirm it landed.
          </p>
        </div>
      </section>
    </>
  );
}
