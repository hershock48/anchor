import Link from "next/link";
import { site, giving, lines, ph, isPlaceholder } from "@/lib/site";
import { getFacts } from "@/lib/content";
import { pipLevels } from "@/lib/pip";
import GivingCard from "@/components/GivingCard";
import ReviewBand from "@/components/ReviewBand";
import AnchorHero from "@/components/AnchorHero";
import Wave from "@/components/Wave";
import Ticker from "@/components/Ticker";
import StockTicker from "@/components/StockTicker";
import { marketNotes } from "@/lib/ticker";
import { getQuotes } from "@/lib/quotes";

/**
 * The market rail's prices are baked into this page's HTML so the rail is full
 * and the right width on first paint. 300 seconds because that matches the CDN
 * cache on /api/quotes, and the client corrects whatever this bakes within a
 * few hundred milliseconds of arrival, so a stale regeneration is never what a
 * reader ends up looking at. The reasoning, and why the page must NOT be made
 * dynamic instead, is in lib/quotes.ts.
 */
export const revalidate = 300;

export async function generateMetadata() {
  const facts = await getFacts();
  return {
  /**
   * `absolute`, because this page has moved relative to the template. As
   * app/page.tsx it shared the root segment with the layout defining the
   * `%s | name` template, which only applies to CHILD segments, so the name
   * had to be written in (the homepage shipped with no brand in its title at
   * all before the August 2026 rename made somebody read the tab). The (site)
   * route group then made it a child segment, the template started applying,
   * and the tab read "Anchor Insurance | ... | Anchor Insurance" on
   * production for a day. `absolute` opts out of the template either way.
   */
  title: { absolute: `${site.name} | Independent agency in ${facts.contact.city}, Michigan` },
  description:
    "Auto, home and business insurance from an independent Michigan agency. We shop several carriers, and a percentage of what we earn goes back to local causes.",
  };
}

/** The hand-drawn underline. Glazed's own h1 puts one under "crave". */
function Underline() {
  return (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path
        d="M4 10 C 42 3, 88 3, 118 7 C 148 11, 178 8, 196 4"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function Home() {
  const facts = await getFacts();
  const quotes = await getQuotes({ revalidate: 300 });
  const cheapDrop = pipLevels.find((l) => l.id === "500k")!;

  return (
    <>
      {/* ── hero ──────────────────────────────────────────────────────────
          The headline used to read "We shop your insurance. Then we give part
          of it away," which never said whose money it was. Read cold, "it" is
          your premium, which is the opposite of the promise. Naming the
          commission fixes the sentence and makes the giving concrete: it is our
          pay, not your money. */}
      <section className="hero">
        <div className="wrap hero-in">
          <div>
            <p className="kicker">Independent agency &middot; {facts.contact.city}, Michigan</p>
            <h1>
              Your policy, shopped.
              <br />
              Our commission,{" "}
              <em>
                shared
                <Underline />
              </em>
              .
            </h1>
            <p className="lede hero-lede">
              We compare several carriers instead of selling one company&rsquo;s product.
              Then <strong>{giving.share}</strong> goes back to local causes in and around{" "}
              {facts.contact.city}.
            </p>
            <div className="hero-cta">
              {/* onnavy: the default .btn is a navy fill now, which would be
                  invisible on this navy hero. */}
              <Link className="btn onnavy" href="/quote">
                Get a quote
              </Link>
              <Link className="btn onnavy ghost-on-navy" href="/giving">
                How the giving works
              </Link>
            </div>
            <p className="hero-note">
              No obligation. We will tell you if we cannot beat what you already have.
            </p>
          </div>

          <div className="hero-mark">
            <AnchorHero />
          </div>
        </div>
      </section>

      {/* Two rails, different speeds, opposite directions. Markets move fast
          one way, the Michigan facts drift the other way slower. Same speed
          reads as one broken element; same direction reads as a mistake. */}
      <StockTicker seconds={70} initial={quotes} />
      <Ticker
        tone="gold"
        seconds={112}
        reverse
        items={marketNotes.map((n) => (
          <span key={n}>
            <span className="tick-dot" />
            <span>{n}</span>
          </span>
        ))}
      />

      {/* ── the goal, straight after the ticker so it is above the fold on a
             phone rather than buried beside the hero ── */}
      <section className="goalband">
        <div className="wrap goalband-in">
          <GivingCard />
          <div>
            <h2>
              Everybody says they give back.
              <br />
              We <em>built it in<Underline /></em>.
            </h2>
            <p className="lede" style={{ marginTop: 16 }}>
              Almost every independent agency in the country donates to something, and it
              usually amounts to one sentence in a footer. Ours is part of how the agency is
              set up, and every cause we support gets told about properly: the organization,
              the reason, the result.
            </p>
            <p style={{ marginTop: 20 }}>
              <Link className="btn" href="/giving">
                How the giving works
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Wave fill="var(--paper)" bg="var(--sand)" />

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

      <Wave fill="var(--navy)" bg="var(--paper)" flip />

      {/* ── how the giving works ─────────────────────────────────────────── */}
      <section className="band-navy" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <p className="kicker reveal">Our giving</p>
          <h2 className="reveal">What giving back looks like here</h2>

          <ol className="steps">
            <li className="reveal">
              <span className="step-n" aria-hidden="true">
                1
              </span>
              <h3>We set a share aside</h3>
              <p>
                A percentage of what this agency earns goes to local giving. It comes out of
                our commission, so nothing is ever added to your premium.
              </p>
            </li>
            <li className="reveal">
              <span className="step-n" aria-hidden="true">
                2
              </span>
              <h3>We pick close to home</h3>
              <p>
                A school program, a shelter, a food bank, the fund a neighbor set up. In and
                around {facts.contact.city}, where the policies come from.
              </p>
            </li>
            <li className="reveal">
              <span className="step-n" aria-hidden="true">
                3
              </span>
              <h3>We tell you about it</h3>
              <p>
                Each cause goes up on our social pages as it happens: who they are, why we
                picked them, and what came of it.
              </p>
            </li>
          </ol>

          <div className="give-cta reveal">
            <Link className="btn onnavy" href="/giving">
              Read the whole program
            </Link>
            <p>
              A donation is never tied to a particular policy, and no customer can direct one.
              Michigan rules require both, and we would run it that way anyway.
            </p>
          </div>
        </div>
      </section>

      <Wave fill="var(--paper)" bg="var(--navy)" />

      {/* ── the PIP number, big enough to be the picture ─────────────────── */}
      <section className="pip-teaser">
        <div className="wrap pip-in">
          <div className="reveal">
            <p className="kicker">Michigan drivers</p>
            <p className="bigstat">{cheapDrop.savings}%</p>
            <p className="bigstat-note">
              is what you save by dropping from unlimited medical to $500,000. Not thirty
              percent. Three and a half.
            </p>
          </div>
          <div className="reveal">
            <h2>Nobody shows you this number</h2>
            <p className="lede" style={{ marginTop: 14 }}>
              Nearly three in ten Michigan vehicles now carry limited injury coverage, and a lot
              of those drivers gave up unlimited lifetime medical for a rounding error, because
              the form asked and nobody explained.
            </p>
            <p style={{ marginTop: 20 }}>
              <Link className="btn" href="/tools/michigan-pip">
                See all six levels
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── carriers ─────────────────────────────────────────────────────── */}
      <section className="band-sand" style={{ paddingTop: 44, paddingBottom: 44 }}>
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
              <span className="ph">Carrier list to come</span>. This is where the companies we
              place with get named. It stays blank until the appointments are confirmed rather
              than filled with logos we are not entitled to show.
            </p>
          )}
        </div>
      </section>

      {/* ── the review ask, on the same sand ground as the carriers ──────── */}
      <section className="band-sand" style={{ paddingTop: 0, paddingBottom: 52 }}>
        <div className="wrap reveal">
          <ReviewBand />
        </div>
      </section>

      <Wave fill="var(--gold)" bg="var(--sand)" />

      {/* ── close ────────────────────────────────────────────────────────── */}
      <section className="closeband">
        <div className="wrap close-in reveal">
          <div>
            <h2>Send us what you pay now</h2>
            <p className="lede" style={{ marginTop: 14 }}>
              Email the declarations page from your current policy and we will read it and tell
              you plainly whether we can do better. Sometimes the answer is no, and you should
              hear that from somebody willing to say it.
            </p>
          </div>
          <div className="close-actions">
            {/* The closeband is GOLD now: the navy-fill default button reads
                on it, and the white ghost variant does not (white on gold is
                2.63). Plain ghost carries navy text and passes. */}
            <Link className="btn" href="/quote">
              Get a quote
            </Link>
            {!isPlaceholder(facts.contact.phone) ? (
              <a className="btn ghost" href={`tel:${facts.contact.phoneHref}`}>
                Call {facts.contact.phone}
              </a>
            ) : (
              <span className="close-ph">
                Phone: <span className="ph">{ph(facts.contact.phone)}</span>
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
