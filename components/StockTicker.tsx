"use client";

import { useEffect, useState } from "react";
import { QUOTE_SYMBOLS, type Quote } from "@/lib/quotes";

/**
 * The market rail.
 *
 * The owners follow markets, so this is a piece of personalization rather than
 * decoration, which is also why it carries real numbers or none at all.
 *
 * SEEDED BY THE SERVER, CORRECTED BY THE CLIENT. `initial` comes from the page,
 * which bakes prices into the HTML, so the rail is full and the right width on
 * first paint. Then this refetches on mount and swaps in current prices. The
 * two states have the same shape, so the swap is invisible.
 *
 * It used to render bare symbols and fill in about 400ms later. On a phone that
 * took the track from 1,067px to 3,554px with two and a bit items on screen, so
 * the whole visible rail changed at once. It read as loading, not as running.
 *
 * DEGRADES TO SYMBOLS, NEVER TO INVENTED NUMBERS. With JavaScript off, with
 * both upstreams down at render and at fetch, the rail shows the symbols with
 * no prices. It never shows a number it does not have.
 *
 * NOT COLOR ALONE. Direction is carried by an arrow and a signed number as well
 * as by color, because color alone fails WCAG and also fails anybody looking at
 * this in bright sun.
 */

function fmt(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

export default function StockTicker({
  seconds = 70,
  initial = [],
}: {
  seconds?: number;
  /** Server-rendered prices. Empty is fine and renders bare symbols. */
  initial?: Quote[];
}) {
  const [quotes, setQuotes] = useState<Quote[]>(initial);

  useEffect(() => {
    let alive = true;
    fetch("/api/quotes")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.quotes?.length) setQuotes(d.quotes);
      })
      .catch(() => {
        /* Rail keeps whatever the server gave it. Nothing is invented. */
      });
    return () => {
      alive = false;
    };
  }, []);

  const items =
    quotes.length > 0
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
      : QUOTE_SYMBOLS.map((s) => (
          <span className="q" key={s}>
            <span className="q-sym">{s}</span>
          </span>
        ));

  const run = [...items, ...items];

  return (
    <div className="tick tick-navy" aria-hidden="true">
      <div className="tick-track" style={{ ["--tick-dur" as string]: `${seconds}s` }}>
        {run.map((item, i) => (
          <span className="tick-item" key={i}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
