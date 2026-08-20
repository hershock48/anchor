import { NextResponse } from "next/server";

export const runtime = "nodejs";
/**
 * Prices are time-dependent, so this cannot be statically generated.
 *
 * glaze.md: route caching and time do not mix. Regeneration is request
 * triggered, so on a quiet site a revalidate-on-a-timer page ages indefinitely
 * and serves last week's prices with a straight face. This handler is dynamic
 * and carries its own short CDN cache instead, which ages out on the clock
 * rather than on traffic.
 */
export const dynamic = "force-dynamic";

const STOCKS = [
  { symbol: "PGR", name: "Progressive" },
  { symbol: "ALL", name: "Allstate" },
  { symbol: "TRV", name: "Travelers" },
  { symbol: "CB", name: "Chubb" },
  { symbol: "BRK-B", name: "Berkshire" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "Nvidia" },
  { symbol: "SPY", name: "S&P 500" },
];

const COINS = [
  { id: "bitcoin", symbol: "BTC" },
  { id: "ethereum", symbol: "ETH" },
  { id: "solana", symbol: "SOL" },
];

export type Quote = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
};

/** Yahoo's v8 chart endpoint. Keyless and free, so it is not a subscription the
 *  client did not choose. The v7 multi-symbol quote endpoint now returns
 *  Unauthorized, which is why this fetches per symbol. */
async function stock(s: { symbol: string; name: string }): Promise<Quote | null> {
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        s.symbol
      )}?interval=1d&range=1d`,
      { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(6000) }
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

async function coins(): Promise<Quote[]> {
  try {
    const ids = COINS.map((c) => c.id).join(",");
    const r = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(6000) }
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

export async function GET() {
  const [s, c] = await Promise.all([Promise.all(STOCKS.map(stock)), coins()]);
  const quotes = [...s.filter(Boolean as unknown as (q: Quote | null) => q is Quote), ...c];

  // An empty array is a real answer and the client renders the rail without
  // prices rather than inventing any. A degraded rail beats a fabricated one.
  return NextResponse.json(
    { quotes, asOf: new Date().toISOString() },
    {
      headers: {
        // Five minutes at the edge, then a stale copy while it refreshes, so a
        // quiet site still ages out on the clock rather than on traffic.
        "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
