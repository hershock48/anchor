"use client";

import { useEffect, useState } from "react";
import { customerErrors, dueLabel, money, type BookRow, type CustomerInput } from "@/lib/workroom/book";

/**
 * The book: everyone she bills, and what is due next.
 *
 * A list first, like the leads queue, because Tuesday morning's question is
 * "who is due this week", not "show me a dashboard". Search is one box that
 * matches names, phones, emails and policy numbers. Adding a customer is
 * four fields; the policies come on their own screen.
 */

const EMPTY: CustomerInput = { name: "", phone: "", email: "", zip: "", notes: "" };

export default function Book() {
  const [rows, setRows] = useState<BookRow[] | null>(null);
  const [backend, setBackend] = useState<"postgres" | "memory">("postgres");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<CustomerInput>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInput, string>>>({});
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/workroom/book", { headers: { Accept: "application/json" } });
      const data = (await res.json().catch(() => ({}))) as { customers?: BookRow[]; backend?: "postgres" | "memory"; error?: string };
      if (!res.ok) {
        setError(data.error || "Could not load the book.");
        setRows([]);
        return;
      }
      setRows(data.customers ?? []);
      if (data.backend) setBackend(data.backend);
    } catch {
      setError("Could not reach the site.");
      setRows([]);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const found = customerErrors(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/workroom/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; customer?: { id: string }; errors?: typeof errors; error?: string };
      if (res.ok && data.customer) {
        window.location.href = `/workroom/book/${data.customer.id}`;
        return;
      }
      if (data.errors) setErrors(data.errors);
      else setError(data.error || "That did not save.");
    } catch {
      setError("That did not save. Your typing is still on screen.");
    }
    setBusy(false);
  }

  const needle = q.trim().toLowerCase();
  const shown = (rows ?? []).filter((r) => {
    if (!needle) return true;
    return [r.name, r.phone, r.email, r.zip, ...r.policies.map((p) => `${p.carrier} ${p.policyNumber} ${p.label}`)]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
  const today = new Date().toISOString().slice(0, 10);

  const field = (key: keyof CustomerInput, label: string, help = "", mode: "text" | "tel" | "email" | "numeric" = "text") => (
    <div className="wr-field">
      <label htmlFor={`bk-${key}`}>{label}</label>
      <input
        id={`bk-${key}`}
        type="text"
        inputMode={mode}
        value={form[key]}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] || help ? `bk-${key}-help` : undefined}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
      {errors[key] ? (
        <p className="wr-field-error" id={`bk-${key}-help`} role="alert">{errors[key]}</p>
      ) : (
        help && <p className="wr-help" id={`bk-${key}-help`}>{help}</p>
      )}
    </div>
  );

  return (
    <>
      <div className="wr-head">
        <h1>Book</h1>
        <p className="wr-muted">Everyone you bill, and what is due next. Open a customer to see their policies, send them their bill, or copy a pay link.</p>
      </div>

      {backend === "memory" && (
        <p className="wr-warn" role="status">
          <strong>No database is connected yet</strong>, so the book is held only in memory and can be forgotten by the next restart. Connect a database in Vercel (Storage, then Neon) and this warning goes away.
        </p>
      )}

      <div className="wr-toolbar">
        <label className="wr-search">
          <span className="wr-sr">Search the book</span>
          <input type="search" placeholder="Name, phone, email or policy number" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button type="button" className="wr-btn" onClick={() => setAdding((v) => !v)} aria-expanded={adding}>
          {adding ? "Never mind" : "Add a customer"}
        </button>
        <a className="wr-link" href="/workroom/book/import">Import from a spreadsheet</a>
      </div>

      {adding && (
        <form className="wr-panel" onSubmit={add} noValidate>
          <h2 className="wr-h2" style={{ marginTop: 0 }}>New customer</h2>
          <div className="wr-form">
            {field("name", "Name")}
            {field("phone", "Phone", "", "tel")}
            {field("email", "Email", "Where their bill and receipts go.", "email")}
            {field("zip", "ZIP", "With the policy number, this is how they find their bill without a login.", "numeric")}
          </div>
          <div className="wr-save-row">
            <button className="wr-btn" type="submit" disabled={busy}>{busy ? "Saving…" : "Save and add policies"}</button>
            {error && <span className="wr-error" role="alert">{error}</span>}
          </div>
        </form>
      )}

      {!adding && error && <p className="wr-error" role="alert">{error}</p>}

      {rows === null ? (
        <p className="wr-muted">Loading…</p>
      ) : shown.length === 0 ? (
        <div className="wr-empty">
          <h2>{rows.length === 0 ? "The book is empty." : "Nobody matches that."}</h2>
          <p>
            {rows.length === 0
              ? "Add a customer above, or import the whole book from your agency system's export."
              : "Try a shorter search, or a different spelling."}
          </p>
        </div>
      ) : (
        <ul className="wr-list">
          {shown.map((r) => (
            <li key={r.id}>
              <a className="wr-row" href={`/workroom/book/${r.id}`}>
                <span className="wr-row-main">
                  <span className="wr-row-name">{r.name}</span>
                  <span className="wr-row-sub">
                    {[r.phone, r.email].filter(Boolean).join(" · ") || "No contact details yet"}
                    {r.policies.length > 0 && (
                      <>
                        {" · "}
                        {r.policies.filter((p) => p.status === "active").map((p) => p.label || `${p.carrier} ${p.policyNumber}`).join(", ")}
                      </>
                    )}
                  </span>
                </span>
                {r.autopay && <span className="wr-chip wr-chip-called">Autopay</span>}
                {r.nextDue ? (
                  <span className="wr-row-when">
                    {r.nextDue < today ? "Overdue " : "Due "}
                    {dueLabel(r.nextDue, today)}
                    {" · "}
                    {money(r.policies.filter((p) => p.status === "active" && p.nextDue === r.nextDue).reduce((s, p) => s + p.amountCents, 0))}
                  </span>
                ) : (
                  <span className="wr-row-when">{r.policies.length ? "Nothing due" : "No policies yet"}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
