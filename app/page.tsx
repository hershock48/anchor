import Link from "next/link";
import { site, giving, lines, ph, isPlaceholder } from "@/lib/site";
import { pipLevels } from "@/lib/pip";
import GoalBar from "@/components/GoalBar";

export const metadata = {
  title: `Independent insurance in ${site.contact.city}, Michigan`,
  description:
    "Auto, home and business insurance from an independent Michigan agency. We give a share of every commission to a local cause and publish every dollar of it.",
};

export default function Home() {
  const cheapDrop = pipLevels.find((l) => l.id === "500k")!;

  return (
    <>
      {/* ── hero ───────────────────────────────────────────────────────────
          One offer, left aligned, one primary action. The tagline is not the
          headline: it lives in the logo lockup, where it is on every page
          already, which frees this line to say what actually happens. */}
      <section className="hero">
        <div className="wrap hero-in">
          <div>
            <p className="kicker">Independent agency &middot; {site.contact.city}, Michigan</p>
            <h1>
              We shop your insurance.
              <br />
              Then we give part of it away.
            </h1>
            <p className="lede hero-lede">
              An independent agency, so we compare several carriers instead of selling one
              company&rsquo;s product. And{" "}
              <strong>
                <span className="ph">{ph(giving.rate)}</span> of every commission we earn
              </strong>{" "}
              goes to a local cause, picked by a public vote and published to the dollar.
            </p>
            <div className="hero-cta">
              <Link className="btn" href="/quote">
                Get a quote
              </Link>
              <Link className="btn ghost" href="/giving/ledger">
                See where the money went
              </Link>
            </div>
            <p className="hero-note">
              No obligation, and no purchase necessary for the giving. We will tell you if we
              cannot beat what you have.
            </p>
          </div>

          <div className="hero-goal">
            <GoalBar />
          </div>
        </div>
      </section>

      {/* ── coverage ─────────────────────────────────────────────────────── */}
      <section>
        <div className="wrap">
          <p className="kicker reveal">What we write</p>
          <h2 className="reveal">Coverage, and a person who explains it</h2>
          <p className="lede reveal" style={{ marginTop: 12 }}>
            Every line has its own page, because &ldquo;we do auto and home&rdquo; is not an
            answer to a question anybody actually has.
          </p>

          <ul className="cov-grid">
            {lines.map((l) => (
              <li key={l.slug} className="reveal">
                <Link href={`/coverage/${l.slug}`} className="cov-card">
                  <h3>{l.name}</h3>
                  <p>{l.short}</p>
                  <span className="cov-more" aria-hidden="true">
                    Read more
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── the giving, explained in three steps ─────────────────────────── */}
      <section className="band-navy">
        <div className="wrap">
          <p className="kicker reveal">How the giving works</p>
          <h2 className="reveal">Three steps, and you can check every one</h2>

          <ol className="steps">
            <li className="reveal">
              <span className="step-n" aria-hidden="true">
                1
              </span>
              <h3>Anyone nominates a cause</h3>
              <p>
                A school program, a shelter, a food bank, a fire department fund. Nominations
                are open to the whole community, not just to customers.
              </p>
            </li>
            <li className="reveal">
              <span className="step-n" aria-hidden="true">
                2
              </span>
              <h3>The public votes</h3>
              <p>
                We shortlist and everyone votes. Not customers only, and not us alone. Michigan
                rules say a policyholder cannot direct where their own policy&rsquo;s money
                goes, and an open vote is how this stays clean and still belongs to the town.
              </p>
            </li>
            <li className="reveal">
              <span className="step-n" aria-hidden="true">
                3
              </span>
              <h3>We write the check and publish it</h3>
              <p>
                Date, organization, amount, and a photo of the handoff, in a ledger that adds
                itself up and carries the date it was last updated.
              </p>
            </li>
          </ol>

          <div className="give-cta reveal">
            <Link className="btn onnavy" href="/giving">
              How the program works
            </Link>
            <p>{giving.EXCLUSION_NOTE}</p>
          </div>
        </div>
      </section>

      {/* ── the PIP hook ─────────────────────────────────────────────────
          This is the strongest single fact on the site and it is not about us.
          It earns the visit whether or not anybody buys anything. */}
      <section className="pip-teaser">
        <div className="wrap pip-in">
          <div className="reveal">
            <p className="kicker">Michigan drivers</p>
            <h2>
              Dropping from unlimited medical to $500,000 saves about{" "}
              <em>{cheapDrop.savings}%</em>
            </h2>
            <p className="lede" style={{ marginTop: 14 }}>
              Not thirty percent. Three and a half, on the injury portion of your premium.
              Nearly three in ten Michigan vehicles now carry limited coverage, and a lot of
              those drivers gave up unlimited lifetime medical for a rounding error, because
              nobody sat down and showed them the number.
            </p>
            <p style={{ marginTop: 18 }}>
              <Link className="btn" href="/tools/michigan-pip">
                See all six levels
              </Link>
            </p>
          </div>
          <ul className="pip-mini reveal" aria-label="Average savings by coverage level">
            {pipLevels.slice(0, 4).map((l) => (
              <li key={l.id}>
                <span className="pm-label">{l.label}</span>
                <span className="pm-val">{l.savings === 0 ? "baseline" : `saves ${l.savings}%`}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── carriers ─────────────────────────────────────────────────────
          Empty on purpose. A logo wall is the biggest trust element on an
          insurance site, and inventing one is worse than not having one. */}
      <section className="band-sand">
        <div className="wrap">
          <p className="kicker quiet reveal">Who we place with</p>
          {site.carriers.length > 0 ? (
            <ul className="carrier-wall reveal">
              {site.carriers.map((c) => (
                <li key={c.name}>{c.name}</li>
              ))}
            </ul>
          ) : (
            <p className="lede reveal" style={{ marginTop: 10 }}>
              <span className="ph">Carrier list to come</span>. We are an independent agency, so
              this is where the companies we place with will be named. It stays blank until the
              appointments are confirmed rather than filled with logos we are not entitled to
              show.
            </p>
          )}
        </div>
      </section>

      {/* ── close ────────────────────────────────────────────────────────── */}
      <section>
        <div className="wrap close-in reveal">
          <div>
            <h2>Tell us what you have now</h2>
            <p className="lede" style={{ marginTop: 12 }}>
              Send the declarations page from your current policy and we will tell you plainly
              whether we can do better. Sometimes the answer is no, and you should hear that
              from somebody willing to say it.
            </p>
          </div>
          <div className="close-actions">
            <Link className="btn" href="/quote">
              Get a quote
            </Link>
            {!isPlaceholder(site.contact.phone) ? (
              <a className="btn ghost" href={`tel:${site.contact.phoneHref}`}>
                Call {site.contact.phone}
              </a>
            ) : (
              <span className="close-ph">
                Phone: <span className="ph">{ph(site.contact.phone)}</span>
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
