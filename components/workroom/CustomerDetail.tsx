"use client";

import { useEffect, useState } from "react";
import { site, lines } from "@/lib/site";
import {
  AGENCY,
  CADENCES,
  cadenceOf,
  customerErrors,
  dueLabel,
  money,
  policyErrors,
  type Customer,
  type CustomerInput,
  type Payment,
  type Policy,
  type PolicyInput,
} from "@/lib/workroom/book";
import { when } from "./format";

/**
 * One customer: their details, every policy with what it costs and when,
 * the pay link for each, and what they have paid through the site.
 *
 * The three buttons on a policy are the whole product from her side:
 * "Email them the bill" sends the same note the nightly job sends, "Copy
 * pay link" is for a text or a phone call, and "Stop autopay" is the one
 * thing here that reaches into Stripe (it can only stop money, never start
 * or refund it).
 *
 * "Who collects it" is a two-way choice, us or the carrier, because that is
 * the question she actually knows the answer to. Whether the site may TAKE
 * a carrier's premium is decided by that carrier's flag in site.ts, from the
 * agency agreement; the policy card says which way it routes so she is never
 * surprised by what her customer sees.
 */

type Route = { kind: "here" } | { kind: "portal"; carrier: string; url?: string; phone?: string } | { kind: "nothing" };
type PolicyView = Policy & { route: Route; payLink: string | null };
type Loaded = {
  customer: Customer;
  policies: PolicyView[];
  payments: Payment[];
  backend: "postgres" | "memory";
  checkoutLive: boolean;
  linksOn: boolean;
  mailOn: boolean;
};

const EMPTY_POLICY: PolicyInput = { carrier: "", policyNumber: "", label: "", line: "", amount: "", cadence: "monthly", nextDue: "", payTo: "" };

export default function CustomerDetail({ id }: { id: string }) {
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const [cust, setCust] = useState<CustomerInput | null>(null);
  const [custErrors, setCustErrors] = useState<Partial<Record<keyof CustomerInput, string>>>({});
  const [custBusy, setCustBusy] = useState(false);

  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [pform, setPform] = useState<PolicyInput>(EMPTY_POLICY);
  const [collect, setCollect] = useState<"agency" | "carrier">("carrier");
  const [pErrors, setPErrors] = useState<Partial<Record<keyof PolicyInput, string>>>({});
  const [pBusy, setPBusy] = useState(false);
  const [acting, setActing] = useState("");

  async function load() {
    try {
      const res = await fetch(`/api/workroom/book/customer?id=${encodeURIComponent(id)}`, { headers: { Accept: "application/json" } });
      const d = (await res.json().catch(() => ({}))) as Partial<Loaded> & { error?: string };
      if (!res.ok || !d.customer) {
        setError(d.error || "Could not load this customer.");
        return;
      }
      setData(d as Loaded);
      const c = d.customer;
      setCust({ name: c.name, phone: c.phone, email: c.email, zip: c.zip, notes: c.notes });
    } catch {
      setError("Could not reach the site.");
    }
  }
  useEffect(() => {
    load();
  }, [id]);

  async function call(path: string, method: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
    try {
      const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      return { ok: res.ok, data: d };
    } catch {
      return { ok: false, data: { error: "Could not reach the site." } };
    }
  }

  async function saveCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!cust) return;
    const found = customerErrors(cust);
    setCustErrors(found);
    if (Object.keys(found).length) return;
    setCustBusy(true);
    setNote("");
    const r = await call("/api/workroom/book", "PUT", { id, customer: cust });
    if (r.ok) {
      setNote("Saved.");
      await load();
    } else if (r.data.errors) setCustErrors(r.data.errors as typeof custErrors);
    else setError(String(r.data.error ?? "That did not save."));
    setCustBusy(false);
  }

  function startEdit(p: Policy | null) {
    setPErrors({});
    if (!p) {
      setPform(EMPTY_POLICY);
      setCollect("carrier");
      setEditing("new");
    } else {
      setPform({
        carrier: p.carrier, policyNumber: p.policyNumber, label: p.label, line: p.line,
        amount: (p.amountCents / 100).toFixed(2), cadence: p.cadence, nextDue: p.nextDue ?? "", payTo: p.payTo,
      });
      setCollect(p.payTo === AGENCY ? "agency" : "carrier");
      setEditing(p.id);
    }
  }

  async function savePolicy(e: React.FormEvent) {
    e.preventDefault();
    const input: PolicyInput = { ...pform, payTo: collect === "agency" ? AGENCY : pform.carrier };
    const found = policyErrors(input, Number.MAX_SAFE_INTEGER);
    setPErrors(found);
    if (Object.keys(found).length) return;
    setPBusy(true);
    setNote("");
    const r =
      editing === "new"
        ? await call("/api/workroom/book/policies", "POST", { customerId: id, policy: input })
        : await call("/api/workroom/book/policies", "PUT", { id: editing, policy: input });
    if (r.ok) {
      setEditing(null);
      setNote(editing === "new" ? "Policy added." : "Policy saved.");
      await load();
    } else if (r.data.errors) setPErrors(r.data.errors as typeof pErrors);
    else setError(String(r.data.error ?? "That did not save."));
    setPBusy(false);
  }

  async function act(label: string, fn: () => Promise<{ ok: boolean; data: Record<string, unknown> }>, done: string) {
    setActing(label);
    setNote("");
    setError("");
    const r = await fn();
    if (r.ok) {
      setNote(done);
      await load();
    } else setError(String(r.data.error ?? "That did not work."));
    setActing("");
  }

  async function copyLink(link: string, pid: string) {
    try {
      await navigator.clipboard.writeText(link);
      setNote("Pay link copied. Paste it into a text or an email.");
    } catch {
      // No clipboard (older phone browsers): show it so she can long-press it.
      setNote(`Copy this: ${link}`);
    }
    setActing(pid + ":copied");
    setTimeout(() => setActing(""), 1500);
  }

  if (error && !data) {
    return (
      <>
        <p className="wr-error" role="alert">{error}</p>
        <p><a className="wr-back" href="/workroom/book">Back to the book</a></p>
      </>
    );
  }
  if (!data || !cust) return <p className="wr-muted">Loading…</p>;

  const today = new Date().toISOString().slice(0, 10);
  const carrierNames = site.carriers.map((c) => c.name);

  const cfield = (key: keyof CustomerInput, label: string, mode: "text" | "tel" | "email" | "numeric" = "text") => (
    <div className="wr-field">
      <label htmlFor={`cd-${key}`}>{label}</label>
      <input
        id={`cd-${key}`}
        type="text"
        inputMode={mode}
        value={cust[key]}
        aria-invalid={custErrors[key] ? true : undefined}
        onChange={(e) => setCust({ ...cust, [key]: e.target.value })}
      />
      {custErrors[key] && <p className="wr-field-error" role="alert">{custErrors[key]}</p>}
    </div>
  );

  const policyForm = (
    <form className="wr-panel" onSubmit={savePolicy} noValidate>
      <h2 className="wr-h2" style={{ marginTop: 0 }}>{editing === "new" ? "New policy" : "Edit policy"}</h2>
      <div className="wr-form">
        <div className="wr-field">
          <label htmlFor="pf-carrier">Carrier</label>
          <input id="pf-carrier" type="text" list="pf-carriers" value={pform.carrier} aria-invalid={pErrors.carrier ? true : undefined} onChange={(e) => setPform({ ...pform, carrier: e.target.value })} />
          <datalist id="pf-carriers">{carrierNames.map((n) => <option key={n} value={n} />)}</datalist>
          {pErrors.carrier && <p className="wr-field-error" role="alert">{pErrors.carrier}</p>}
        </div>
        <div className="wr-field">
          <label htmlFor="pf-number">Policy number</label>
          <input id="pf-number" type="text" value={pform.policyNumber} aria-invalid={pErrors.policyNumber ? true : undefined} onChange={(e) => setPform({ ...pform, policyNumber: e.target.value })} />
          {pErrors.policyNumber ? <p className="wr-field-error" role="alert">{pErrors.policyNumber}</p> : <p className="wr-help">Exactly as it appears on the bill. The customer types this to find their bill.</p>}
        </div>
        <div className="wr-field">
          <label htmlFor="pf-label">What it covers</label>
          <input id="pf-label" type="text" value={pform.label} placeholder="the Civic, the house" onChange={(e) => setPform({ ...pform, label: e.target.value })} />
          <p className="wr-help">How the customer knows it. This is what the messages say.</p>
        </div>
        <div className="wr-field">
          <label htmlFor="pf-line">Line</label>
          <select id="pf-line" value={pform.line} onChange={(e) => setPform({ ...pform, line: e.target.value })}>
            <option value="">Not set</option>
            {lines.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
          </select>
        </div>
        <div className="wr-field">
          <label htmlFor="pf-amount">Installment amount</label>
          <input id="pf-amount" type="text" inputMode="decimal" value={pform.amount} placeholder="142.10" aria-invalid={pErrors.amount ? true : undefined} onChange={(e) => setPform({ ...pform, amount: e.target.value })} />
          {pErrors.amount ? <p className="wr-field-error" role="alert">{pErrors.amount}</p> : <p className="wr-help">What one payment is. Not the annual premium.</p>}
        </div>
        <div className="wr-field">
          <label htmlFor="pf-cadence">Billed</label>
          <select id="pf-cadence" value={pform.cadence} onChange={(e) => setPform({ ...pform, cadence: e.target.value as PolicyInput["cadence"] })}>
            {CADENCES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div className="wr-field">
          <label htmlFor="pf-due">Next due</label>
          <input id="pf-due" type="date" value={pform.nextDue} aria-invalid={pErrors.nextDue ? true : undefined} onChange={(e) => setPform({ ...pform, nextDue: e.target.value })} />
          {pErrors.nextDue ? <p className="wr-field-error" role="alert">{pErrors.nextDue}</p> : <p className="wr-help">Leave empty if nothing is due. It rolls forward by itself after each payment.</p>}
        </div>
        <fieldset className="wr-field wr-fieldset">
          <legend>Who collects it?</legend>
          <label className="wr-radio"><input type="radio" name="collect" checked={collect === "carrier"} onChange={() => setCollect("carrier")} /> The carrier bills it</label>
          <label className="wr-radio"><input type="radio" name="collect" checked={collect === "agency"} onChange={() => setCollect("agency")} /> We invoice it (agency bill)</label>
          <p className="wr-help">A carrier-billed policy pays here only when that carrier&rsquo;s agreement lets us collect; otherwise the customer is sent to the carrier&rsquo;s own page, in our words.</p>
        </fieldset>
      </div>
      <div className="wr-save-row">
        <button className="wr-btn" type="submit" disabled={pBusy}>{pBusy ? "Saving…" : editing === "new" ? "Add policy" : "Save policy"}</button>
        <button type="button" className="wr-link" onClick={() => setEditing(null)}>Cancel</button>
      </div>
    </form>
  );

  return (
    <>
      <p><a className="wr-back" href="/workroom/book">← Back to the book</a></p>
      <div className="wr-head">
        <h1>{data.customer.name}</h1>
        <p className="wr-muted">
          {[data.customer.phone, data.customer.email].filter(Boolean).join(" · ") || "No contact details yet"}
        </p>
      </div>

      {(note || error) && (
        <p className={error ? "wr-error" : "wr-saved"} role={error ? "alert" : "status"}>{error || note}</p>
      )}
      {!data.linksOn && (
        <p className="wr-warn" role="status"><strong>Pay links are not switched on for this deployment</strong> (PAY_LINK_SECRET is not set), so customers cannot open or find their bill yet.</p>
      )}

      <h2 className="wr-h2">Policies</h2>
      {data.policies.length === 0 && editing !== "new" && (
        <div className="wr-empty"><h2>No policies yet.</h2><p>Add the first one and the pay link appears with it.</p></div>
      )}
      <ul className="wr-list">
        {data.policies.map((p) => (
          <li key={p.id}>
            {editing === p.id ? (
              policyForm
            ) : (
              <div className="wr-pol">
                <div className="wr-pol-head">
                  <div>
                    <span className="wr-row-name">{p.label || `${p.carrier} ${p.policyNumber}`}</span>
                    <span className="wr-row-sub">{p.carrier} · {p.policyNumber}{p.line ? ` · ${lines.find((l) => l.slug === p.line)?.name ?? p.line}` : ""}</span>
                  </div>
                  <div className="wr-pol-chips">
                    {p.status === "closed" && <span className="wr-chip wr-chip-lost">Closed</span>}
                    {p.autopay && <span className="wr-chip wr-chip-called">Autopay</span>}
                    {p.status === "active" && p.nextDue && p.nextDue < today && <span className="wr-chip wr-chip-new">Overdue</span>}
                  </div>
                </div>
                <dl className="wr-facts" style={{ marginTop: 12 }}>
                  <div><dt>Installment</dt><dd>{money(p.amountCents)}{cadenceOf(p.cadence)?.months ? `, ${cadenceOf(p.cadence)!.label.toLowerCase()}` : ""}</dd></div>
                  <div><dt>Next due</dt><dd>{p.nextDue ? dueLabel(p.nextDue, today) : "Nothing due"}</dd></div>
                  <div>
                    <dt>Paid</dt>
                    <dd>
                      {p.route.kind === "here" ? "Here, on the site" : p.route.kind === "portal" ? `At ${p.route.carrier}${p.route.url ? "" : " (no portal link on file)"}` : "Nothing to pay"}
                      {p.payTo === AGENCY ? " · agency bill" : ""}
                    </dd>
                  </div>
                  {p.autopay && <div><dt>Autopay since</dt><dd>{when(p.autopay.since)}</dd></div>}
                </dl>
                {p.status === "active" && (
                  <div className="wr-actions">
                    {p.payLink && (
                      <button type="button" className="wr-status-btn" onClick={() => copyLink(p.payLink!, p.id)}>
                        {acting === p.id + ":copied" ? "Copied" : "Copy pay link"}
                      </button>
                    )}
                    {p.nextDue && !p.autopay && (
                      <button
                        type="button"
                        className="wr-status-btn"
                        disabled={!!acting || !data.customer.email || !data.mailOn}
                        title={!data.customer.email ? "Add an email address first" : !data.mailOn ? "Mail is not switched on for this deployment" : ""}
                        onClick={() => act(p.id, () => call("/api/workroom/book/remind", "POST", { policyId: p.id }), `Bill emailed to ${data.customer.email}.`)}
                      >
                        {acting === p.id ? "Sending…" : "Email them the bill"}
                      </button>
                    )}
                    {p.autopay && (
                      <button
                        type="button"
                        className="wr-status-btn"
                        disabled={!!acting}
                        onClick={() => {
                          if (window.confirm(`Stop autopay for ${p.label || p.policyNumber}? Future installments will need a payment each time.`)) {
                            act(p.id, () => call("/api/workroom/book/autopay", "DELETE", { policyId: p.id }), "Autopay stopped.");
                          }
                        }}
                      >
                        Stop autopay
                      </button>
                    )}
                    <button type="button" className="wr-link" onClick={() => startEdit(p)}>Edit</button>
                    {!p.autopay && (
                      <button
                        type="button"
                        className="wr-link"
                        onClick={() => {
                          if (window.confirm("Close this policy? It stays in the record; the customer can no longer find or pay it.")) {
                            act(p.id, () => call("/api/workroom/book/policies", "PUT", { id: p.id, status: "closed" }), "Policy closed.");
                          }
                        }}
                      >
                        Close
                      </button>
                    )}
                  </div>
                )}
                {p.status === "closed" && (
                  <div className="wr-actions">
                    <button type="button" className="wr-link" onClick={() => act(p.id, () => call("/api/workroom/book/policies", "PUT", { id: p.id, status: "active" }), "Policy reopened.")}>Reopen</button>
                    <button
                      type="button"
                      className="wr-link"
                      onClick={() => {
                        if (window.confirm("Delete this policy for good, including its payment records here? Stripe keeps the charges. Only do this for an entry that should never have existed.")) {
                          act(p.id, () => call("/api/workroom/book/policies", "DELETE", { id: p.id, purge: true }), "Policy deleted.");
                        }
                      }}
                    >
                      Delete for good
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
        {editing === "new" && <li>{policyForm}</li>}
      </ul>
      {editing === null && (
        <p style={{ marginTop: 14 }}>
          <button type="button" className="wr-btn" onClick={() => startEdit(null)}>Add a policy</button>
        </p>
      )}

      <h2 className="wr-h2">Payments through the site</h2>
      {data.payments.length === 0 ? (
        <p className="wr-muted">None yet.</p>
      ) : (
        <ul className="wr-list">
          {data.payments.map((pay) => {
            const pol = data.policies.find((p) => p.id === pay.policyId);
            return (
              <li key={pay.id}>
                <div className="wr-row">
                  <span className="wr-row-main">
                    <span className="wr-row-name">{money(pay.totalCents)}</span>
                    <span className="wr-row-sub">
                      {pol ? pol.label || `${pol.carrier} ${pol.policyNumber}` : pay.policyId}
                      {pay.forDue ? ` · for ${dueLabel(pay.forDue, today)}` : ""}
                      {pay.feeCents ? ` · ${money(pay.premiumCents)} premium + ${money(pay.feeCents)} fee` : ""}
                    </span>
                  </span>
                  <span className={`wr-chip ${pay.kind === "autopay" ? "wr-chip-called" : "wr-chip-quoted"}`}>{pay.kind}</span>
                  <span className="wr-row-when">{when(pay.paidAt)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="wr-h2">Details</h2>
      <form onSubmit={saveCustomer} noValidate>
        <div className="wr-form">
          {cfield("name", "Name")}
          {cfield("phone", "Phone", "tel")}
          {cfield("email", "Email", "email")}
          {cfield("zip", "ZIP", "numeric")}
          <div className="wr-field">
            <label htmlFor="cd-notes">Your notes</label>
            <textarea id="cd-notes" className="wr-notes" rows={4} value={cust.notes} maxLength={4000} onChange={(e) => setCust({ ...cust, notes: e.target.value })} />
          </div>
        </div>
        <div className="wr-save-row">
          <button className="wr-btn" type="submit" disabled={custBusy}>{custBusy ? "Saving…" : "Save details"}</button>
        </div>
      </form>
    </>
  );
}
