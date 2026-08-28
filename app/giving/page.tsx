import Link from "next/link";
import { giving, site } from "@/lib/site";
import GivingCard from "@/components/GivingCard";

export const metadata = {
  title: "Our giving",
  description:
    "We give a percentage of what we earn back to local causes in and around Manchester, and every cause we support gets its own write-up.",
};

/**
 * REWRITTEN AUGUST 28, 2026, per the client. The first build of this page was
 * a receipts argument: a set percentage, a goal bar, a public vote and a
 * ledger link. The client chose the opposite shape, so this page now explains
 * the program in plain words and points at the write-ups. The old page is in
 * git history before this date.
 */
export default function Giving() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Our giving</p>
          <h1>The giving is built in.</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            {giving.share.charAt(0).toUpperCase() + giving.share.slice(1)} goes back to
            local causes in and around {site.contact.city}. This page says how that works,
            and every cause we support gets its own write-up.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap give-grid">
          <div className="give-goalwrap"><GivingCard /></div>
          <div>
            <h2>Why we do it this way</h2>
            <p>
              Almost every independent agency in the country donates to charity. It is one of
              the more generous corners of American small business, and most of it never gets
              past one line in a footer. We would rather show you the actual causes: who they
              are, why we picked them, and what came of it.
            </p>
            <p>
              We are new, so the list starts short. It will grow the way real things grow,
              one at a time.
            </p>
          </div>
        </div>
      </section>

      <section className="band-navy">
        <div className="wrap">
          <p className="kicker">How it works</p>
          <h2>Three steps, none of them complicated</h2>
          <ol className="steps">
            <li>
              <span className="step-n" aria-hidden="true">1</span>
              <h3>We earn a commission</h3>
              <p>
                An agency is paid by the carrier when a policy is written. That is the money
                the giving comes out of. Nothing is added to your premium.
              </p>
            </li>
            <li>
              <span className="step-n" aria-hidden="true">2</span>
              <h3>A share goes back</h3>
              <p>
                We set aside a percentage of what we earn for local causes, chosen by us,
                close to home, and never from a menu on a quote form.
              </p>
            </li>
            <li>
              <span className="step-n" aria-hidden="true">3</span>
              <h3>Every cause gets a write-up</h3>
              <p>
                Who they are, why we picked them, and what came of it, with a date on it,
                on <Link href="/giving/causes">the causes page</Link>.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section>
        <div className="wrap">
          <h2>The rules we operate under</h2>
          <div className="rules">
            <div className="card">
              <h3>Your policy cannot direct a donation</h3>
              <p>
                Michigan does not allow a policyholder to choose where their own
                policy&rsquo;s donation goes, and it requires a program like this be offered
                the same way to everyone. That is why the giving is never tied to a
                particular policy and there is no pick-a-charity box on the quote form.
              </p>
            </div>
            <div className="card">
              <h3>No purchase necessary</h3>
              <p>{giving.DISCLOSURE}</p>
            </div>
          </div>
          <p className="fineprint">
            {site.legalName} is an insurance agency, not a charity, and donations are made by
            the agency out of its own commission. Nothing you pay is a charitable contribution
            and nothing here is tax deductible to you.
          </p>
        </div>
      </section>
    </>
  );
}
