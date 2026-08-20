import Link from "next/link";
import { giving, site, ph, isPlaceholder } from "@/lib/site";
import GoalBar from "@/components/GoalBar";

export const metadata = {
  title: "Our giving",
  description:
    "We give a share of every commission to a local Michigan cause, chosen by public vote, and publish every dollar with a date on it.",
};

export default function Giving() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Our giving</p>
          <h1>Everybody says they give back. We publish the receipts.</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            <span className="ph">{ph(giving.rate)}</span> of the {giving.base} goes to a local
            cause, {giving.cadence}. The cause is chosen by a public vote. Every check we write
            shows up in the ledger with a date, an amount and a photo.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap give-grid">
          <div className="give-goalwrap"><GoalBar /></div>
          <div>
            <h2>Why it is a number and not a sentence</h2>
            <p>
              Almost every independent agency in the country donates to charity. It is one of
              the more generous corners of American small business. Almost none of them publish
              an amount, so a customer reads &ldquo;we support our community&rdquo; and has no
              way to tell whether that means two hundred dollars or twenty thousand.
            </p>
            <p>
              We would rather be checkable. The number will start small, because we are new.
              A small number with a date on it is worth more than a big feeling.
            </p>
            <p>
              <Link className="btn" href="/giving/ledger">See the ledger</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="band-navy">
        <div className="wrap">
          <p className="kicker">How a cause gets picked</p>
          <h2>Nominated by anyone, chosen by everyone</h2>
          <ol className="steps">
            <li>
              <span className="step-n" aria-hidden="true">1</span>
              <h3>Nominate</h3>
              <p>
                Any local organization. A school program, a shelter, a food pantry, a
                department fund. You do not have to be a customer and you never will.
              </p>
            </li>
            <li>
              <span className="step-n" aria-hidden="true">2</span>
              <h3>Vote</h3>
              <p>
                We shortlist the nominations and open a public vote. One per person. The
                shortlist and the running count are both on the site while it is open.
              </p>
            </li>
            <li>
              <span className="step-n" aria-hidden="true">3</span>
              <h3>Publish</h3>
              <p>
                We write the check, take a photo, and add the row. The ledger totals itself
                and shows the date it was last updated, so a program that goes quiet cannot
                hide it.
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
              <h3>You cannot buy a donation to your own cause</h3>
              <p>
                Michigan does not allow a policyholder to direct where their own policy&rsquo;s
                donation goes, and it requires the program be offered the same way to everyone.
                That is why the cause is chosen by an open vote instead of a menu on the quote
                form. It is a better system anyway.
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
