import { site, ph, isPlaceholder, payments } from "@/lib/site";
import { getFacts } from "@/lib/content";
import { payLinkSecret } from "@/lib/paylink";
import { checkoutLive } from "@/lib/pay";

/**
 * Pay your bill.
 *
 * THE CUSTOMER NEVER TYPES AN AMOUNT AND NEVER HAS A PASSWORD. Most people
 * arrive from a link we sent, which opens their bill already filled in
 * (/pay/p/<token>). Someone who arrives cold finds it with the two things
 * they already know, the policy number and the ZIP, and lands on the same
 * screen. The amount and the due date come from the agency's book in the
 * workroom, which is the only place on this site that knows them.
 *
 * REPLACED THE TYPE-IT-FROM-YOUR-BILL FORM on September 2, 2026. That form
 * was honest for a site that could not know a balance; it also made the
 * customer do the carrier's bookkeeping, and it could take $1 against a $400
 * installment. Git history before this date has it.
 *
 * Carrier routing stays: each appointed carrier gets a row, because a policy
 * the agency may not collect for is paid at the carrier, whatever the book
 * says. The per-carrier switch in site.ts decides which.
 *
 * Static on purpose: no searchParams here. The lookup route redirects to a
 * static no-match page rather than back here with a flag, because reading
 * searchParams would force this page dynamic and break the router's
 * prefetch (the quote page found that one).
 */
export const metadata = {
  title: "Pay your bill",
  description:
    "Find your bill with your policy number and ZIP, or use the link we sent you. No account, no password.",
};

export default async function Pay() {
  const facts = await getFacts();
  const havePhone = !isPlaceholder(facts.contact.phone);
  const carriers = site.carriers;
  const linksOn = payLinkSecret() !== null;
  const cardsOn = checkoutLive();

  const callUs = havePhone ? (
    <a href={`tel:${facts.contact.phoneHref}`}>call {facts.contact.phone}</a>
  ) : (
    <span className="ph">{ph(facts.contact.phone)}</span>
  );

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Payments</p>
          <h1>Pay your bill.</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            If we sent you a link, use that: it opens your bill already filled in. Otherwise
            find it here with two things from your paperwork. No account, no password.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap qf-grid">
          {linksOn ? (
            <form className="qf" method="post" action="/api/pay/find">
              <div className="qf-hp" aria-hidden="true">
                <label htmlFor="find-company">Leave this field empty</label>
                <input id="find-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <fieldset>
                <legend>Find your bill</legend>
                <p className="qf-optnote">
                  Your policy number is on your ID card and on every bill. The ZIP is the one on
                  the policy.
                </p>
                <div className="qf-two">
                  <div className="qf-row">
                    <label htmlFor="find-policy">Policy number</label>
                    <input id="find-policy" name="policy" type="text" maxLength={60} required autoComplete="off" />
                  </div>
                  <div className="qf-row">
                    <label htmlFor="find-zip">ZIP code</label>
                    <input id="find-zip" name="zip" type="text" inputMode="numeric" maxLength={10} required autoComplete="postal-code" />
                  </div>
                </div>
                <div className="qf-actions">
                  <button className="btn" type="submit">Find my bill</button>
                  <p className="qf-note">
                    {cardsOn
                      ? "You will see what is due and pay it on the next page. The card form is Stripe's; we never see your card number."
                      : "You will see what is due and where to pay it on the next page."}
                  </p>
                </div>
              </fieldset>
            </form>
          ) : (
            <div className="card">
              <h2>Online bill lookup is not switched on yet</h2>
              <p>
                It is built and waiting on setup. Until then, the name on your bill is the place
                to pay, and we are happy to walk you to it: {callUs}.
              </p>
            </div>
          )}

          <aside className="side">
            <h2>Rather just talk?</h2>
            <p>
              Anything you are unsure about, or anything over $
              {Math.round(payments.maxOnlineCents / 100).toLocaleString()}, do it with a person:{" "}
              {callUs}.
            </p>
            {payments.convenienceFeeCents > 0 && cardsOn && (
              <p className="side-fine">
                Online card payments carry a flat{" "}
                {(payments.convenienceFeeCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}{" "}
                payment fee, itemized at checkout. Check and phone payments have none.
              </p>
            )}
          </aside>
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
                  Every carrier we place policies with has its own payment site and billing
                  line, and as our appointments are confirmed each one will be listed right
                  here. Until then, the name on your bill is the place to pay, and we are happy
                  to walk you to it: {callUs}.
                </p>
              </div>
            </div>
          ) : (
            <div className="rules" style={{ marginTop: 18 }}>
              {carriers.map((c) => (
                <div className="card" key={c.name}>
                  <h3>{c.name}</h3>
                  <p>
                    {c.payableHere && cardsOn ? (
                      <>Find your bill above and pay it right here. One page, done.</>
                    ) : c.payUrl ? (
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
          <p className="fineprint">
            A payment is not proof of coverage, and a lapsing policy does not wait for the
            mail. If you are close to a cancellation date, call us after you pay so we can
            confirm it landed.
          </p>
        </div>
      </section>
    </>
  );
}
