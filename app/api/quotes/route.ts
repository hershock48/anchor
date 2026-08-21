import { NextResponse } from "next/server";
import { getQuotes } from "@/lib/quotes";

export const runtime = "nodejs";
/**
 * Prices are time-dependent, so this cannot be statically generated.
 *
 * glaze.md: route caching and time do not mix. Regeneration is request
 * triggered, so on a quiet site a revalidate-on-a-timer page ages indefinitely
 * and serves last week's prices with a straight face. This handler is dynamic
 * and carries its own short CDN cache instead, which ages out on the clock
 * rather than on traffic.
 *
 * This is the correcting half of the pair. The homepage bakes prices into its
 * HTML so the rail has the right shape on first paint; `StockTicker` then calls
 * this on mount, and this is the one that is actually current. See lib/quotes.ts.
 */
export const dynamic = "force-dynamic";

export type { Quote } from "@/lib/quotes";

export async function GET() {
  const quotes = await getQuotes("no-store");

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
