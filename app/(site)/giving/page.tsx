import { giving, site, isPlaceholder } from "@/lib/site";
import { getFacts } from "@/lib/content";
import GivingCard from "@/components/GivingCard";

export async function generateMetadata() {
  const facts = await getFacts();
  return {
  title: "Our giving",
  description: `We give a percentage of what we earn back to local causes in and around ${facts.contact.city}, and we post each one as it happens.`,
  };
}

/**
 * REWRITTEN TWICE, per the client both times. August 28, 2026: the receipts
 * argument (set percentage, goal bar, public vote, ledger) became plain words
 * plus per-cause write-ups. September 1, 2026: the write-ups went too. The
 * site is the landing page; the causes themselves go up on her social
 * accounts as they happen, and this page says the promise and points there.
 * Both old pages are in git history before their dates.
 *
 * The Facebook pointer is gated on the placeholder the same way the review
 * ask is: until the real URL lands (lib/site.ts or the workroom), the copy stands without a
 * link rather than linking to nothing.
 */
export default async function Giving() {
  const facts = await getFacts();
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Our giving</p>
          <h1>The giving is built in.</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            {giving.share.charAt(0).toUpperCase() + giving.share.slice(1)} goes back to
            local causes in and around {facts.contact.city}. This page says how that works.
            The causes themselves go up on our social pages as we support them.
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
              past one line in a footer. We would rather show you the actual causes, and we
              show them where you already are: posted as they happen, with who they are and
              why we picked them.
            </p>
            <p>
              We are new, so the record starts short. It will grow the way real things grow,
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
              <h3>We post it where you already are</h3>
              <p>
                Each cause goes up on our social pages as it happens: who they are, why we
                picked them, and what came of it.
                {!isPlaceholder(facts.social.facebook) && (
                  <>
                    {" "}
                    <a href={facts.social.facebook}>Follow along on Facebook.</a>
                  </>
                )}
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
