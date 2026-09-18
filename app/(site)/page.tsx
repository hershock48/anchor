import Link from "next/link";
import { site, giving, lines, ph, isPlaceholder } from "@/lib/site";
import { getFacts } from "@/lib/content";
import { pipLevels } from "@/lib/pip";
import ReviewBand from "@/components/ReviewBand";
import AnchorHero from "@/components/AnchorHero";
import Wave from "@/components/Wave";
import Ticker from "@/components/Ticker";
import { marketNotes } from "@/lib/ticker";

/**
 * Static, and no longer on a timer. The 300 second window existed to refresh
 * the market rail's baked-in share prices; that rail came off on September
 * 16, 2026 and took the site's only remote data source with it, so what is
 * left re-renders when the workroom saves a fact and calls
 * revalidatePath("/", "layout"), which is the only thing on this page that
 * changes between deploys.
 */

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
  alternates: { canonical: "/" },
  // The card leads with the tagline rather than the tab title. A page's
  // openGraph replaces the layout's wholesale, so the image comes along.
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description:
      "Independent auto, home and business insurance in Michigan. A percentage of what we earn goes back to local causes.",
    url: "/",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: `${site.name}. ${site.tagline}. An independent agency in ${facts.contact.city}, Michigan.`,
      },
    ],
  },
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
  const cheapDrop = pipLevels.find((l) => l.id === "500k")!;
  /* Commercial leads the coverage section and the rest follow it, per the
     client. Split here rather than reordering lib/site.ts, because that array
     also drives /coverage, the footer and the sitemap, and the order that
     suits a homepage argument is not automatically the order that suits a
     directory. If she wants commercial first everywhere, move it there. */
  const commercial = lines.find((l) => l.slug === "business");
  const personal = lines.filter((l) => l.slug !== "business");

  return (
    <>
      {/* ── hero ──────────────────────────────────────────────────────────
          The headline used to read "We shop your insurance. Then we give part
          of it away," which never said whose money it was. Read cold, "it" is
          your premium, which is the opposite of the promise. Naming the
          commission fixes the sentence and makes the giving concrete: it is our
          pay, not your money.

          THE ORDER IS THE CLIENT'S, from the September 16, 2026 meeting: the
          policies shopped, then the commission, then the tagline underneath
          them. The tagline is read from lib/site.ts rather than typed here, so
          it cannot drift from the footer and the link cards.

          MANCHESTER IS NOT NAMED IN THE MARKETING COPY, also hers: a town in
          the kicker reads as the only place she writes. The town still appears
          where it is a fact rather than a pitch (the contact page, the
          footer, the structured data), because that is what local search
          reads and removing it there would cost her the map listing. */}
      <section className="hero">
        <div className="wrap hero-in">
          <div>
            <p className="kicker">Independent agency &middot; Michigan</p>
            <h1>
              Your policies, shopped.
              <br />
              Our commission,{" "}
              <em>
                shared
                <Underline />
              </em>
              .
            </h1>
            <p className="hero-tag">{site.tagline}.</p>
            <p className="lede hero-lede">
              We compare several carriers instead of selling one company&rsquo;s product.
              Then <strong>{giving.share}</strong> goes back to causes close to home.
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

      {/* ONE RAIL, NOT TWO. The market-quote rail came off on September 16,
          2026 at the client's word ("remove stock ticker"): live share prices
          on an agency's homepage read as somebody else's business, and it was
          also the one remote data source on the site. The Michigan facts stay,
          because the education is what she likes and what the site is for.
          lib/ticker.ts still holds the width budget for this rail. */}
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

      {/* ── what we offer ─────────────────────────────────────────────────
          Her running order, from the same meeting: scroll into how it works,
          which is the coverage and the person who explains it, THEN what the
          giving looks like, and the product knowledge kept separate from
          both. So coverage now leads the page and the giving follows it,
          where the giving card and a second giving pitch used to sit.

          COMMERCIAL LEADS IT ("really want to focus on commercial"). It is a
          card of its own above the grid rather than another equal tile,
          because a list of six in alphabetical comfort says nothing about
          where she wants the work. The blurb is the line's own, from
          lib/site.ts, so this cannot drift from /coverage/business. */}
      <section>
        <div className="wrap">
          <p className="kicker reveal">What we offer</p>
          <h2 className="reveal">Coverage, and a person who explains it</h2>
          <p className="lede reveal" style={{ marginTop: 12 }}>
            Every line has its own page, because &ldquo;we do auto and home&rdquo; is not an
            answer to a question anybody actually has.
          </p>

          {commercial ? (
            <Link href={`/coverage/${commercial.slug}`} className="cov-feature reveal">
              <div>
                <p className="kicker quiet">Where we put our weight</p>
                <h3>{commercial.name} insurance</h3>
                <p className="cov-feature-lede">{commercial.blurb}</p>
                <span className="cov-more" aria-hidden="true">
                  See commercial coverage
                </span>
              </div>
              <ul className="cov-feature-points">
                {commercial.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Link>
          ) : null}

          <ul className="cov-grid">
            {personal.map((l) => (
              <li key={l.slug} className="reveal">
                <Link href={`/coverage/${l.slug}`} className={`cov-card acc-${l.slug}`}>
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

      <Wave fill="var(--forest)" bg="var(--paper)" flip />

      {/* ── what giving back looks like ───────────────────────────────────
          One giving section, not two. A card and a headline used to make the
          case up at the top of the page and these three steps made it again
          four screens later; the argument is stronger once, after the
          coverage, which is the order the client asked for. */}
      <section className="band-navy band-forest" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <p className="kicker reveal">What giving back looks like</p>
          <h2 className="reveal">
            Everybody says they give back.
            <br />
            We <em>built it in<Underline /></em>.
          </h2>
          <p className="lede reveal" style={{ marginTop: 16, maxWidth: "62ch" }}>
            Almost every independent agency in the country donates to something, and it usually
            amounts to one sentence in a footer. Ours is part of how the agency is set up, and
            every cause gets told about properly: the organization, the reason, the result.
          </p>

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
                A school program, a shelter, a food bank, the fund a neighbor set up, in the
                communities the policies come from.
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

      <Wave fill="var(--paper)" bg="var(--forest)" />

      {/* ── what we explain ──────────────────────────────────────────────
          PRODUCT KNOWLEDGE, KEPT SEPARATE FROM THE PRODUCT LIST, which is the
          client's own distinction: what we offer is one question and what we
          can explain is another, and running them together made the homepage
          read as one long brochure.

          The PIP calculator moved off this page to the page it has always
          had ("likes the PIP, wants it on its own page"). The number stays
          here as the reason to go there, at reading size rather than as the
          200px display figure, which is now the picture on the tool's own
          page where it belongs. */}
      <section>
        <div className="wrap">
          <p className="kicker reveal">What we explain</p>
          <h2 className="reveal">The parts nobody walks you through</h2>
          <p className="lede reveal" style={{ marginTop: 12 }}>
            Coverage is sold in levels and endorsements almost nobody explains, and the choices
            cost real money. These are ours to explain whether or not you ever buy anything
            from us.
          </p>

          <ul className="cov-grid two">
            <li className="reveal">
              <Link href="/tools/michigan-pip" className="cov-card acc-auto">
                <h3>What each Michigan PIP level saves you</h3>
                <p>
                  Dropping from unlimited medical to $500,000 saves about {cheapDrop.savings}%.
                  Not thirty percent. All six levels, with the eligibility rules most sites get
                  wrong.
                </p>
                <span className="cov-more" aria-hidden="true">
                  Open the tool
                </span>
              </Link>
            </li>
            <li className="reveal">
              <Link href="/guides" className="cov-card acc-umbrella">
                <h3>The guides</h3>
                <p>
                  Mini-tort, excess attendant care, storm claims after March 6, and why your
                  rate still depends on where you live.
                </p>
                <span className="cov-more" aria-hidden="true">
                  Read the guides
                </span>
              </Link>
            </li>
          </ul>
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

      {/* ── get a quote ──────────────────────────────────────────────────
          "Add Get a quote on the homepage", from the same meeting. The page
          had two quote BUTTONS, in the header and the hero, and no quote
          section: it closed on a different ask entirely (send us your
          declarations page). That ask is the better second line, so it sits
          under this one rather than replacing it. */}
      <section className="closeband" id="quote">
        <div className="wrap close-in reveal">
          <div>
            <h2>Four fields. Then a person calls you.</h2>
            <p className="lede" style={{ marginTop: 14 }}>
              Name, phone, ZIP, and what you need covered. The rest is a conversation rather
              than a form. Or send the declarations page from your current policy and we will
              tell you plainly whether we can do better; sometimes the answer is no, and you
              should hear that from somebody willing to say it.
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
