import Link from "next/link";
import { site, giving, ph, isPlaceholder } from "@/lib/site";

export const metadata = {
  title: "About",
  description: `${site.name} is the trade name of ${site.legalName}, an independent insurance agency in ${site.contact.city}, Michigan.`,
};

export default function About() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">About</p>
          <h1>Why we built the agency this way</h1>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap prose-2">
          <div>
            {/* THIS IS THE ONE PAGE THAT CANNOT BE WRITTEN WITHOUT HER.
                It is placeholder prose on purpose and it is on the README
                checklist. The real version comes out of a recorded hour with
                the owner, in her own words. Anything invented here would be
                the single most damaging thing on the site, because the whole
                brand rests on being believable. */}
            <p className="ph-block">
              <span className="ph">Her story goes here</span>, written from a recorded
              conversation in her own words. Why she started an agency. Why the
              giving is built into it instead of bolted on. What she did before this. Who she
              is in this town.
            </p>

            <h2>What independent means</h2>
            <p>
              We are not a captive agent for one insurance company. We hold appointments with
              several carriers and we compare them for you, which means the recommendation can
              actually change based on your situation instead of always landing on the same product.
            </p>
            <p>
              It also means that when a carrier stops being competitive, we can move you
              instead of defending them.
            </p>

            <h2>The giving is the point, not the marketing</h2>
            <p>
              <span className="ph">{ph(giving.rate)}</span> of the {giving.base} goes to a
              local cause every {giving.cadence.replace("ly", "")}. The cause is nominated by
              the community and chosen by a public vote. Every check is published with a date
              and an amount.
            </p>
            <p>
              We are going to be honest about the size of it. We are new, the early numbers are
              going to be small, and we would still rather publish a small real number than a
              large vague feeling. <Link href="/giving/ledger">The ledger is here.</Link>
            </p>
          </div>

          <aside className="side">
            <h2>The agency</h2>
            <dl className="factlist">
              <dt>Legal name</dt>
              <dd>{site.legalName}</dd>
              <dt>Doing business as</dt>
              <dd>{site.name}</dd>
              <dt>Owner</dt>
              <dd><span className="ph">{ph(site.owner.name)}</span></dd>
              <dt>Licensed in</dt>
              <dd>{site.license.states.join(", ")}</dd>
              <dt>Producer license</dt>
              <dd><span className="ph">{ph(site.license.producerNumber)}</span></dd>
              <dt>NPN</dt>
              <dd><span className="ph">{ph(site.license.npn)}</span></dd>
            </dl>
            <p className="side-fine">
              You can check any Michigan producer&rsquo;s license and complaint history through
              the Department of Insurance and Financial Services. We would rather you did.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
