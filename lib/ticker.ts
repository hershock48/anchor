/**
 * The two ticker rails.
 *
 * TWO DECISIONS WORTH KNOWING ABOUT, because both were judgment calls.
 *
 * 1. NO LIVE PRICES, YET. A moving price needs a market data feed. Every
 *    reliable one is keyed and most are billed, which breaks the rule that
 *    nothing in a client site costs them a subscription they did not choose.
 *    The free keyless sources are unreliable enough that the rail would be
 *    blank as often as not, and a blank rail is worse than no rail.
 *
 * 2. THE REGULATORY ONE, WHICH MATTERS MORE. An insurance producer showing
 *    live stock quotes can read as offering securities. She is licensed to
 *    sell insurance, not investments, and a ticker of moving share prices is
 *    exactly the sort of thing that invites the question. Carrier symbols
 *    without prices say "these are the companies we shop for you," which is
 *    true, useful, and not a claim about anything she is not licensed for.
 *
 * If she wants live prices anyway, that is her call to make with her attorney,
 * and `symbols` is the seam: give it a fetched price and the rail renders it.
 * Server-side fetch, cached, with an "as of" stamp.
 *
 * SYMBOLS ARE REAL. These are the actual NYSE tickers for the carriers an
 * independent Michigan agency typically places with. They are facts, not
 * placeholders. But an appointment is a different thing from a listed company,
 * so nothing here claims she is appointed with any of them: `site.carriers` is
 * still the empty array that governs what the site says about appointments.
 */

export type Sym = { symbol: string; name: string; price?: string; change?: string };

export const symbols: Sym[] = [
  { symbol: "PGR", name: "Progressive" },
  { symbol: "ALL", name: "Allstate" },
  { symbol: "TRV", name: "Travelers" },
  { symbol: "CB", name: "Chubb" },
  { symbol: "HIG", name: "The Hartford" },
  { symbol: "CINF", name: "Cincinnati Financial" },
  { symbol: "KMPR", name: "Kemper" },
  { symbol: "ERIE", name: "Erie Indemnity" },
];

/**
 * The second rail. Facts rather than headlines, because a headline goes stale
 * and a fact about Michigan coverage does not. Everything here is checkable and
 * every figure appears somewhere else on the site with its source named.
 */
export const marketNotes: string[] = [
  // TICKER LENGTH, NOT SENTENCE LENGTH.
  //
  // These were full sentences averaging 574px each, which made the animated
  // track 11,488px wide. Mobile GPUs commonly cap a composited layer at 4096px
  // and older ones at 2048, and above that iOS Safari can refuse to composite
  // the animation at all. The rail then sits still, which is exactly what
  // "the tickers do not work on mobile" looks like.
  //
  // They also read better short. A ticker item that takes two seconds to pass
  // is a headline; one that takes eight is a paragraph going by sideways.
  // Every fact here still appears in full, with its source, on the page it
  // belongs to.
  "Unlimited lifetime medical: Michigan only",
  "$500k PIP saves just 3.6%",
  "3 in 10 MI vehicles now limited",
  "Attendant care: about $14 a year",
  "Only 5% of drivers carry it",
  "Mini-tort caps at $3,000",
  "ZIP banned as a rating factor, 2020",
  // Seven, not eight. At eight the mobile layer measured 4,254px, just over the
  // 4096px cap. Adding one back puts it over again.
];
