import Link from "next/link";
import { Mark } from "./Logo";
import GlazedPlate from "./GlazedPlate";
import { site, giving, lines, ph, isPlaceholder } from "@/lib/site";

export default function Footer() {
  const phoneReady = !isPlaceholder(site.contact.phone);
  const emailReady = !isPlaceholder(site.contact.email);

  return (
    <footer className="site-foot">
      <div className="wrap foot-in">
        <div className="foot-brand">
          <Mark width={44} ink="#ffffff" accent="#f0a093" />
          <p className="foot-name">{site.name}</p>
          <p className="foot-tag">{site.tagline}</p>
          <p className="foot-legal">
            The full name on the license is {site.legalName}. An independent agency, which means we shop several carriers for you instead of selling one company&rsquo;s product.
          </p>
        </div>

        <nav className="foot-col" aria-label="Coverage">
          <h2>Coverage</h2>
          <ul>
            {lines.map((l) => (
              <li key={l.slug}>
                <Link href={`/coverage/${l.slug}`}>{l.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="foot-col" aria-label="More">
          <h2>More</h2>
          <ul>
            <li><Link href="/giving">Our giving</Link></li>
            <li><Link href="/giving/ledger">Where the money went</Link></li>
            <li><Link href="/tools/michigan-pip">Michigan PIP tool</Link></li>
            <li><Link href="/guides">Guides</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
          </ul>
        </nav>

        <div className="foot-col">
          <h2>Reach us</h2>
          <ul>
            <li>
              {phoneReady ? (
                <a href={`tel:${site.contact.phoneHref}`}>{site.contact.phone}</a>
              ) : (
                <span className="ph">{ph(site.contact.phone)}</span>
              )}
            </li>
            <li>
              {emailReady ? (
                <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              ) : (
                <span className="ph">{ph(site.contact.email)}</span>
              )}
            </li>
            <li className="foot-addr">
              <span className="ph">{ph(site.contact.street)}</span>
              <br />
              {site.contact.city}, {site.contact.state} <span className="ph">{ph(site.contact.zip)}</span>
            </li>
          </ul>
          <p className="foot-lic">
            Michigan producer license <span className="ph">{ph(site.license.producerNumber)}</span>
            <br />
            NPN <span className="ph">{ph(site.license.npn)}</span>
            <br />
            Licensed in {site.license.states.join(", ")}.
          </p>
        </div>
      </div>

      <div className="wrap foot-give">
        <p>{giving.EXCLUSION_NOTE}</p>
        <p className="foot-disc">{giving.DISCLOSURE}</p>
      </div>

      <div className="wrap foot-bottom">
        {/* No year. `new Date()` in a statically generated page freezes at
            build time, so a "dynamic" copyright year is a lie that gets more
            wrong every January. A notice without one is never stale. */}
        <p>&copy; {site.legalName}. All rights reserved.</p>
        <p>
          Nothing on this site is a contract, a quote, or a binder. Coverage exists only
          when a carrier issues a policy.
        </p>
      </div>

      <GlazedPlate line="Baked by" />
    </footer>
  );
}
