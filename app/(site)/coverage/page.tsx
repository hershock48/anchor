import Link from "next/link";
import { lines } from "@/lib/site";

export const metadata = {
  title: "Coverage",
  description:
    "Auto, home, renters, umbrella, life and business insurance from an independent Michigan agency.",
};

export default function CoverageIndex() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Coverage</p>
          <h1>What we write</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            Independent, so each of these gets shopped across several carriers instead of quoted from one. Pick the one you came for.
          </p>
        </div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <ul className="cov-grid">
            {lines.map((l) => (
              <li key={l.slug} className="reveal">
                <Link href={`/coverage/${l.slug}`} className="cov-card">
                  <h2>{l.name}</h2>
                  <p>{l.short}</p>
                  <span className="cov-more" aria-hidden="true">Read more</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
