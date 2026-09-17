/**
 * The facts rail, and since 17 September 2026 the only rail under the hero.
 *
 * A RETRACTION AND ITS ENDING, BOTH RECORDED, because this argument went
 * around twice and should not go around a third time.
 *
 * This file originally opened with two reasons for having no live prices: a
 * practical one (every reliable feed is keyed and billed, and the free ones
 * are unreliable) and a regulatory one (an insurance producer showing moving
 * share prices can read as offering securities). So the rail carried carrier
 * symbols with no prices. Both were then overtaken: a market rail shipped
 * with live prices for carriers, Apple, Nvidia, the S&P and three coins, off
 * keyless Yahoo and CoinGecko endpoints, corrected on the client after first
 * paint. The practical objection was answered by the keyless sources. The
 * regulatory one was never answered, only set aside, because the owners
 * follow markets and asked for it.
 *
 * She asked for it to come off at the 16 September 2026 meeting. The market
 * rail, its data module and its dynamic route are gone as of this commit
 * (recover them with `git show 49a0798^:components/StockTicker.tsx` and the
 * two files beside it). The regulatory question goes with them, unanswered
 * and now moot. If a price rail is ever asked for again, it is hers to raise
 * with her attorney or E&O carrier first, and that conversation is the cost,
 * not the code.
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
