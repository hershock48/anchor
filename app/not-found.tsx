import Link from "next/link";
import { lines } from "@/lib/site";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * The 404.
 *
 * Without this file Next serves its own: a bare black-on-white "This page could
 * not be found" with its own inline stylesheet, sitting inside our header and
 * footer and matching neither. Somebody who mistypes a URL, or follows an old
 * link from a card, lands on a page that looks broken and offers nowhere to go.
 */
export default function NotFound() {
  return (
    <section className="pagehead">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <p className="kicker">404</p>
        <h1>That page is not here.</h1>
        <p className="lede" style={{ marginTop: 14 }}>
          Either it moved or the address has a typo in it. Nothing is broken on your end.
          Here is everything worth going to instead.
        </p>

        <ul className="nf-links">
          <li>
            <Link href="/">The homepage</Link>
          </li>
          <li>
            <Link href="/quote">Get a quote</Link>
          </li>
          <li>
            <Link href="/giving">Our giving, and the ledger</Link>
          </li>
          <li>
            <Link href="/tools/michigan-pip">What each Michigan PIP level saves you</Link>
          </li>
          <li>
            <Link href="/contact">Contact a person</Link>
          </li>
        </ul>

        <p className="kicker quiet" style={{ marginTop: 34, display: "block" }}>
          Coverage
        </p>
        <ul className="nf-cov">
          {lines.map((l) => (
            <li key={l.slug}>
              <Link href={`/coverage/${l.slug}`}>{l.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
