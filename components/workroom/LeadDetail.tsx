"use client";

import { useEffect, useState } from "react";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/workroom/leads";
import { when, telHref } from "./format";

/**
 * One lead, and the two things she does to it: move its status and write down
 * what happened on the call.
 *
 * The customer's own words and the agency's notes are kept visibly apart. They
 * arrive from different people and only one of them is editable, and a single
 * merged notes box is how "she said the roof is new" turns into something the
 * customer appears to have claimed.
 */
export default function LeadDetail({ id }: { id: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/workroom/leads?id=${encodeURIComponent(id)}`);
        const data = (await res.json().catch(() => ({}))) as { lead?: Lead; error?: string };
        if (!res.ok || !data.lead) {
          setError(data.error || "Could not load this lead.");
          return;
        }
        setLead(data.lead);
        setNotes(data.lead.workNotes || "");
      } catch {
        setError("Could not reach the site.");
      }
    })();
  }, [id]);

  async function save(patch: { status?: LeadStatus; workNotes?: string }) {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const res = await fetch("/api/workroom/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = (await res.json().catch(() => ({}))) as { lead?: Lead; error?: string };
      if (!res.ok || !data.lead) {
        setError(data.error || "That did not save.");
      } else {
        setLead(data.lead);
        setSaved("Saved.");
      }
    } catch {
      setError("That did not save. Your typing is still on screen.");
    }
    setBusy(false);
  }

  if (error && !lead) {
    return (
      <>
        <p className="wr-error" role="alert">{error}</p>
        <p><a className="wr-back" href="/workroom">Back to the queue</a></p>
      </>
    );
  }
  if (!lead) return <p className="wr-muted">Loading…</p>;

  const facts: [string, React.ReactNode][] = [
    ["Phone", lead.phone ? <a href={`tel:${telHref(lead.phone)}`}>{lead.phone}</a> : "Not given"],
    ["Email", lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "Not given"],
    ["Coverage", lead.line || "Not given"],
    ["ZIP", lead.zip || "Not given"],
    ["Address", lead.address || "Not given"],
    ["Current carrier", lead.currentCarrier || "Not given"],
    ["Renewal", lead.renewal || "Not given"],
    ["Contact consent", lead.consent ? "Given" : "Not ticked"],
    ["Came in", when(lead.createdAt)],
  ];

  return (
    <>
      <p><a className="wr-back" href="/workroom">← Back to the queue</a></p>

      <div className="wr-head">
        <h1>{lead.name || "No name given"}</h1>
        <p className="wr-muted">
          <span className={`wr-chip wr-chip-${lead.status}`}>{lead.status}</span>
        </p>
      </div>

      {lead.phone && (
        <p>
          <a className="wr-btn" href={`tel:${telHref(lead.phone)}`}>Call {lead.phone}</a>
        </p>
      )}

      <h2 className="wr-h2">Where they are</h2>
      <div className="wr-status-row">
        {LEAD_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy || s === lead.status}
            className={`wr-status-btn${s === lead.status ? " on" : ""}`}
            onClick={() => save({ status: s })}
          >
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <h2 className="wr-h2">What they told us</h2>
      <dl className="wr-facts">
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {(lead.about || lead.notes) && (
        <div className="wr-quote">
          {lead.about && <p>{lead.about}</p>}
          {lead.notes && <p>{lead.notes}</p>}
        </div>
      )}

      <h2 className="wr-h2">Your notes</h2>
      <textarea
        className="wr-notes"
        rows={6}
        value={notes}
        maxLength={4000}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What happened on the call, what to quote, when to follow up."
      />
      <div className="wr-save-row">
        <button className="wr-btn" type="button" disabled={busy} onClick={() => save({ workNotes: notes })}>
          {busy ? "Saving…" : "Save notes"}
        </button>
        {saved && <span className="wr-saved" role="status">{saved}</span>}
        {error && <span className="wr-error" role="alert">{error}</span>}
      </div>
    </>
  );
}
