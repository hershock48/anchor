"use client";

import { useState } from "react";

/**
 * Import the book from a spreadsheet export. One file, one button, and a
 * plain account of what happened: created, updated, and every row that was
 * skipped with the reason. Re-running the same file is safe by design
 * (the route's header says how), so the instruction is "export again next
 * month and import again".
 */

type Result = {
  rows: number;
  created: { customers: number; policies: number };
  updated: { customers: number; policies: number };
  errors: { row: number; message: string }[];
};

const TEMPLATE =
  "name,phone,email,zip,carrier,policy,label,line,amount,cadence,next_due,pay_to\n" +
  "Dana Reyes,734 555 0100,dana@example.com,48158,Progressive,PRG-1234567,the Civic,auto,142.10,monthly,2026-10-03,carrier\n" +
  "Dana Reyes,734 555 0100,dana@example.com,48158,Anchor Insurance,INV-2026-014,the shop policy,business,410.00,quarterly,2026-10-15,agency\n";

export default function BookImport() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult(null);
    setBusy(true);
    try {
      const res = await fetch("/api/workroom/book/import", { method: "POST", body: new FormData(e.currentTarget) });
      const data = (await res.json().catch(() => ({}))) as Partial<Result> & { error?: string };
      if (!res.ok) setError(data.error || "The import did not run.");
      else setResult(data as Result);
    } catch {
      setError("Could not reach the site.");
    }
    setBusy(false);
  }

  return (
    <>
      <p><a className="wr-back" href="/workroom/book">← Back to the book</a></p>
      <div className="wr-head">
        <h1>Import the book</h1>
        <p className="wr-muted">
          Export your customers and policies from your agency system as a CSV and drop it here. One row per policy, the customer&rsquo;s details repeated on each row, which is how every export comes out.
        </p>
      </div>

      <div className="wr-panel">
        <h2 className="wr-h2" style={{ marginTop: 0 }}>The columns</h2>
        <p className="wr-muted">
          A header row with these names, in any order. Required: name, zip, carrier, policy, amount. The rest are optional. <code>cadence</code> is monthly, quarterly, semiannual, annual or once. <code>pay_to</code> is <code>carrier</code> or <code>agency</code>. Dates as 2026-10-03 or 10/3/2026.
        </p>
        <pre className="wr-code" tabIndex={0} aria-label="Example file">{TEMPLATE}</pre>
        <p className="wr-muted">
          Importing the same file twice is safe: existing customers are matched by email (or name and ZIP), existing policies by carrier and policy number, and they are updated rather than duplicated. Autopay and payment history are never touched. Nothing is ever deleted by an import.
        </p>
      </div>

      <form onSubmit={submit} className="wr-panel">
        <div className="wr-field">
          <label htmlFor="imp-file">CSV file</label>
          <input id="imp-file" name="file" type="file" accept=".csv,text/csv" required />
        </div>
        <div className="wr-save-row">
          <button className="wr-btn" type="submit" disabled={busy}>{busy ? "Importing…" : "Import"}</button>
          {error && <span className="wr-error" role="alert">{error}</span>}
        </div>
      </form>

      {result && (
        <div className="wr-panel" role="status">
          <h2 className="wr-h2" style={{ marginTop: 0 }}>Done</h2>
          <dl className="wr-facts">
            <div><dt>Rows read</dt><dd>{result.rows}</dd></div>
            <div><dt>Customers</dt><dd>{result.created.customers} new, {result.updated.customers} updated</dd></div>
            <div><dt>Policies</dt><dd>{result.created.policies} new, {result.updated.policies} updated</dd></div>
            <div><dt>Skipped</dt><dd>{result.errors.length}</dd></div>
          </dl>
          {result.errors.length > 0 && (
            <>
              <p className="wr-muted" style={{ marginTop: 14 }}>Fix these rows in the file and import it again; the rows that worked will just be updated.</p>
              <ul className="wr-errors">
                {result.errors.map((e) => <li key={e.row}>Row {e.row}: {e.message}</li>)}
              </ul>
            </>
          )}
          <p style={{ marginTop: 14 }}><a className="wr-btn" href="/workroom/book">Open the book</a></p>
        </div>
      )}
    </>
  );
}
