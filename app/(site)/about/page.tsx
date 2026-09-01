import Link from "next/link";
import { site, giving, ph, isPlaceholder } from "@/lib/site";
import { getFacts } from "@/lib/content";

export async function generateMetadata() {
  const facts = await getFacts();
  return {
  title: "About",
  description: `${site.legalName}, an independent insurance agency in ${facts.contact.city}, Michigan.`,
  };
}

export default async function About() {
  const facts = await getFacts();
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
              {giving.share.charAt(0).toUpperCase() + giving.share.slice(1)} goes back to
              local causes in and around {facts.contact.city}. We pick them close to home,
              and we post each one as it happens on our social pages: who they are, why we
              picked them, what came of it.
            </p>
            <p>
              We are new, so the record starts short, and we would rather it grow honestly
              than look padded. <Link href="/giving">How the giving works.</Link>
            </p>
          </div>

          <aside className="side">
            <h2>The agency</h2>
            <dl className="factlist">
              {/* There was a "Doing business as" row here when the site ran
                  under the Insurance for a Cause name. The client folded
                  everything under Anchor Insurance on August 28, 2026, and
                  "Anchor Insurance" is a short form, not a registered DBA, so
                  claiming it as one would be a false fact on the about page. */}
              <dt>Legal name</dt>
              <dd>{site.legalName}</dd>
              <dt>Owner</dt>
              <dd><span className="ph">{ph(facts.owner.name)}</span></dd>
              <dt>Licensed in</dt>
              <dd>{facts.license.states.join(", ")}</dd>
              <dt>Producer license</dt>
              <dd><span className="ph">{ph(facts.license.producerNumber)}</span></dd>
              <dt>NPN</dt>
              <dd><span className="ph">{ph(facts.license.npn)}</span></dd>
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
