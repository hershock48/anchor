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
  { symbol: "AFG", name: "American Financial" },
  { symbol: "KMPR", name: "Kemper" },
  { symbol: "SAFT", name: "Safety Insurance" },
  { symbol: "ERIE", name: "Erie Indemnity" },
  { symbol: "MCY", name: "Mercury General" },
  { symbol: "HMN", name: "Horace Mann" },
];

/**
 * The second rail. Facts rather than headlines, because a headline goes stale
 * and a fact about Michigan coverage does not. Everything here is checkable and
 * every figure appears somewhere else on the site with its source named.
 */
export const marketNotes: string[] = [
  "Michigan is the only state that still offers unlimited lifetime medical on an auto policy",
  "Dropping to $500,000 saves about 3.6% of the injury portion",
  "Nearly 3 in 10 Michigan vehicles now carry limited injury coverage",
  "Excess attendant care runs about $14 a year",
  "Only about 5% of Michigan drivers carry it",
  "Mini-tort caps at $3,000, and only if you are 50% at fault or less",
  "ZIP code was banned as a rating factor in 2020",
  "Carriers moved to census tract territories instead",
  "The strongest Michigan tornado since 1977 hit on March 6",
  "Wind and hail deductibles are often a percentage, not a dollar figure",
];
