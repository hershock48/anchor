"use client";

import { useEffect, useState } from "react";
import { LEAD_STATUSES, type Lead } from "@/lib/workroom/leads";
import { ago, telHref } from "./format";

/**
 * The leads queue: the workroom's front door.
 *
 * The counter opens this to work, so the front door is the list of people
 * waiting on a call, not a summary of numbers (devine put its dashboard here
 * for a few hours before Kevin put the board back the same day; same
 * reasoning).
 *
 * The default filter is deliberately NOT "all". It is the open work: new and
 * called. A queue that opens showing every lead she ever won is a queue she
 * scrolls past, and the whole point is that Tuesday morning has a short list.
 */

const FILTERS = [
  { key: "open", label: "Open" },
  ...LEAD_STATUSES.map((s) => ({ key: s, label: s[0].toUpperCase() + s.slice(1) })),
  { key: "all", label: "All" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default function LeadsQueue() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [backend, setBackend] = useState<"postgres" | "memory">("postgres");
  const [filter, setFilter] = useState<FilterKey>("open");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/workroom/leads", { headers: { Accept: "application/json" } });
        const data = (await res.json().catch(() => ({}))) as {
          leads?: Lead[];
          backend?: "postgres" | "memory";
          error?: string;
        };
        if (!res.ok) {
          setError(data.error || "Could not load the queue.");
          setLeads([]);
          return;
        }
        setLeads(data.leads ?? []);
        if (data.backend) setBackend(data.backend);
      } catch {
        setError("Could not reach the site.");
        setLeads([]);
      }
    })();
  }, []);

  const shown = (leads ?? []).filter((l) =>
    filter === "all" ? true : filter === "open" ? l.status === "new" || l.status === "called" : l.status === filter
  );

  const counts = (key: FilterKey) =>
    (leads ?? []).filter((l) =>
      key === "all" ? true : key === "open" ? l.status === "new" || l.status === "called" : l.status === key
    ).length;

  return (
    <>
      <div className="wr-head">
        <h1>Leads</h1>
        <p className="wr-muted">Everyone who asked for a quote, newest first.</p>
      </div>

      {backend === "memory" && (
        <p className="wr-warn" role="status">
          <strong>No database is connected yet</strong>, so leads are held only in memory and this
          list can miss ones that landed a minute ago. Every request is still written to the site
          log in full, so nothing is lost. Connect a database in Vercel (Storage, then Neon) and
          this warning goes away.
        </p>
      )}

      <div className="wr-filters" role="tablist" aria-label="Filter leads">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            className={filter === f.key ? "on" : ""}
            onClick={() => setFilter(f.key)}
          >
            {f.label} <span className="wr-count">{counts(f.key)}</span>
          </button>
        ))}
      </div>

      {error && (
        <p className="wr-error" role="alert">
          {error}
        </p>
      )}

      {leads === null ? (
        <p className="wr-muted">Loading…</p>
      ) : shown.length === 0 ? (
        <div className="wr-empty">
          <h2>{(leads ?? []).length === 0 ? "No leads yet." : "Nothing in this pile."}</h2>
          <p>
            {(leads ?? []).length === 0
              ? "Every quote request from the site lands here the moment it is sent."
              : "Try another filter."}
          </p>
        </div>
      ) : (
        <ul className="wr-list">
          {shown.map((l) => (
            <li key={l.id}>
              <a className="wr-row" href={`/workroom/leads/${l.id}`}>
                <span className="wr-row-main">
                  <span className="wr-row-name">{l.name || "No name given"}</span>
                  <span className="wr-row-sub">
                    {[l.line, l.zip].filter(Boolean).join(" · ") || "No coverage line given"}
                  </span>
                </span>
                <span className="wr-row-when">{ago(l.createdAt)}</span>
                <span className={`wr-chip wr-chip-${l.status}`}>{l.status}</span>
              </a>
              {/* The call is the job, so it is one tap from the list and not
                  only from the detail page. */}
              {l.phone && (
                <a className="wr-row-call" href={`tel:${telHref(l.phone)}`}>
                  Call {l.phone}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
