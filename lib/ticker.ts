/**
 * The facts rail, the second of the two tickers under the hero.
 *
 * A RETRACTION, RECORDED. This file used to open with two decisions: no live
 * prices (every reliable feed is keyed and billed, and the free ones are
 * unreliable), and a regulatory one, that an insurance producer showing
 * moving share prices can read as offering securities, so the rail would
 * carry carrier symbols without prices. Both were overtaken. The market rail
 * that actually ships is `components/StockTicker.tsx` fed by `lib/quotes.ts`:
 * live prices for carriers, Apple, Nvidia, the S&P and three coins, from
 * keyless Yahoo and CoinGecko endpoints, corrected on the client after first
 * paint. The subscription objection was answered by the keyless sources. The
 * regulatory one was not answered here, it was set aside: the owners follow
 * markets and asked for it, and whether a live price ticker on a producer's
 * site needs a word from her attorney or E&O carrier is hers to raise. The
 * dead `symbols` list that was this file's "seam" for live prices is gone;
 * `lib/quotes.ts` is where a symbol is added or removed now, and it says
 * what that costs in track width.
 */

/**
 * Facts rather than headlines, because a headline goes stale and a fact about
 * Michigan coverage does not. Everything here is checkable and every figure
 * appears somewhere else on the site with its source named.
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
