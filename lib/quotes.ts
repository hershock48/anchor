/**
 * The market rail's data, in one place.
 *
 * This used to live inside `app/api/quotes/route.ts` and be reachable only over
 * HTTP, which meant the homepage could not have prices in its own HTML. The
 * rail shipped as bare symbols and filled itself in about 400ms later, and on a
 * phone that is not a subtle detail: the track went from 1,067px to 3,554px
 * with two and a bit items on screen, so the entire visible rail changed under
 * the reader at once. It read as broken, because it looked like something
 * loading rather than something running.
 *
 * Now the page renders the prices and the client refreshes them. Same numbers,
 * same widths, so the refresh is invisible.
 *
 * ON THE CACHING TRAP IN glaze.md. The rule there is that route caching and
 * time do not mix: regeneration is request triggered, so a revalidate-on-a-
 * timer page on a quiet site ages indefinitely and serves last week's prices
 * with a straight face. That is exactly right, and it is why the homepage's
 * 300s revalidate is not the whole answer here. The straight face is the part
 * this avoids: `StockTicker` re-fetches on mount through the dynamic route
 * below, so whatever the server baked is corrected within a few hundred
 * milliseconds of arrival. The server copy exists to get the SHAPE right on the
 * first paint, not to be the source of truth for a price.
 *
 * NEVER make the homepage itself dynamic to solve this. It would put a
 * third-party price API, with a six second timeout, in front of first byte on
 * the most important page on the site.
 */

/** Eight plus three coins is eleven items. Keep it there: every item added
 *  widens the animated layer, and past about 4096px mobile GPUs stop
 *  compositing it and the rail freezes. */
const STOCKS = [
  { symbol: "PGR", name: "Progressive" },
  { symbol: "ALL", name: "Allstate" },
  { symbol: "TRV", name: "Travelers" },
  { symbol: "CB", name: "Chubb" },
  { symbol: "BRK-B", name: "Berkshire" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "NVDA", name: "Nvidia" },
  { symbol: "SPY", name: "S&P 500" },
];

const COINS = [
  { id: "bitcoin", symbol: "BTC" },
  { id: "ethereum", symbol: "ETH" },
  { id: "solana", symbol: "SOL" },
];

/** The symbols, in rail order, for the state where we have no prices. */
export const QUOTE_SYMBOLS: string[] = [
  ...STOCKS.map((s) => s.symbol),
  ...COINS.map((c) => c.symbol),
];

export type Quote = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
};

/** How the caller wants the upstreams cached. The route wants none of it; the
 *  page wants Next's data cache so a regeneration is cheap. */
type Freshness = { revalidate: number } | "no-store";

function cacheOpts(f: Freshness): RequestInit {
  return f === "no-store"
    ? { cache: "no-store" }
    : ({ next: { revalidate: f.revalidate } } as RequestInit);
}

/** Yahoo's v8 chart endpoint. Keyless and free, so it is not a subscription the
 *  client did not choose. The v7 multi-symbol quote endpoint now returns
 *  Unauthorized, which is why this fetches per symbol. */
async function stock(s: { symbol: string; name: string }, f: Freshness): Promise<Quote | null> {
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        s.symbol
      )}?interval=1d&range=1d`,
      {
        headers: { "user-agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(6000),
        ...cacheOpts(f),
      }
    );
    if (!r.ok) return null;
    const j = await r.json();
    const m = j?.chart?.result?.[0]?.meta;
    const price = m?.regularMarketPrice;
    const prev = m?.chartPreviousClose ?? m?.previousClose;
    if (typeof price !== "number" || typeof prev !== "number" || prev === 0) return null;
    return { symbol: s.symbol, name: s.name, price, changePct: ((price - prev) / prev) * 100 };
  } catch {
    return null;
  }
}

async function coins(f: Freshness): Promise<Quote[]> {
  try {
    const ids = COINS.map((c) => c.id).join(",");
    const r = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(6000), ...cacheOpts(f) }
    );
    if (!r.ok) return [];
    const j = await r.json();
    return COINS.flatMap((c) => {
      const d = j?.[c.id];
      if (!d || typeof d.usd !== "number") return [];
      return [
        {
          symbol: c.symbol,
          name: c.id[0].toUpperCase() + c.id.slice(1),
          price: d.usd,
          changePct: typeof d.usd_24h_change === "number" ? d.usd_24h_change : 0,
        },
      ];
    });
  } catch {
    return [];
  }
}

/**
 * An empty array is a real answer, and every caller renders the rail without
 * prices rather than inventing any. A degraded rail beats a fabricated one.
 * It never throws: an upstream being down is not a reason for a page to be.
 */
export async function getQuotes(f: Freshness = "no-store"): Promise<Quote[]> {
  const [s, c] = await Promise.all([
    Promise.all(STOCKS.map((x) => stock(x, f))),
    coins(f),
  ]);
  return [...s.filter((q): q is Quote => q !== null), ...c];
}
