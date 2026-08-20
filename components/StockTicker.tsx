"use client";

import { useEffect, useState } from "react";
import type { Quote } from "@/app/api/quotes/route";

/**
 * The market rail.
 *
 * The owners follow markets, so this is a piece of personalization rather than
 * decoration, which is also why it carries real numbers or none at all.
 *
 * FETCHED ON THE CLIENT, ON PURPOSE. Prices are time-dependent and the homepage
 * is static. Rendering them on the server would either force the whole page
 * dynamic or, worse, let a revalidate-on-a-timer page serve last week's prices
 * on a quiet site, which is the caching trap in glaze.md. The page stays static
 * and the rail fills itself in.
 *
 * DEGRADES TO SYMBOLS, NEVER TO INVENTED NUMBERS. With JavaScript off, before
 * the fetch lands, or if both upstreams are down, the rail shows the symbols
 * with no prices. It never shows a number it does not have.
 *
 * NOT COLOR ALONE. Direction is carried by an arrow and a signed number as well
 * as by color, because color alone fails WCAG and also fails anybody looking at
 * this in bright sun.
 */

const FALLBACK = [
  "PGR", "ALL", "TRV", "CB", "BRK-B", "AAPL", "MSFT", "NVDA", "SPY", "BTC", "ETH", "SOL",
];

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

export default function StockTicker({ seconds = 70 }: { seconds?: number }) {
  const [quotes, setQuotes] = useState<Quote[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/quotes")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.quotes?.length) setQuotes(d.quotes);
      })
      .catch(() => {
        /* Rail stays on symbols. Nothing is invented. */
      });
    return () => {
      alive = false;
    };
  }, []);

  const items = quotes
    ? quotes.map((q) => {
        const up = q.changePct >= 0;
        return (
          <span className="q" key={q.symbol}>
            <span className="q-sym">{q.symbol}</span>
            <span className="q-px">{fmt(q.price)}</span>
            <span className={up ? "q-chg up" : "q-chg down"}>
              <span aria-hidden="true">{up ? "▲" : "▼"}</span>
              {up ? "+" : ""}
              {q.changePct.toFixed(2)}%
            </span>
          </span>
        );
      })
    : FALLBACK.map((s) => (
        <span className="q" key={s}>
          <span className="q-sym">{s}</span>
        </span>
      ));

  const run = [...items, ...items];

  return (
    <div className="tick tick-navy" aria-hidden="true">
      <div className="tick-track" style={{ animationDuration: `${seconds}s` }}>
        {run.map((item, i) => (
          <span className="tick-item" key={i}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
