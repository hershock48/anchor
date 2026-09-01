"use client";

import { useEffect, useState } from "react";
import { when, money } from "./format";

/**
 * Payments, read from Stripe.
 *
 * This screen shows and never touches. Refunds live in the Stripe dashboard
 * behind Stripe's own login, because the workroom gate is a passcode and
 * lib/workroom/auth.ts says what that means.
 *
 * The unconfigured state is its own message rather than an empty table: an
 * empty table on a payments screen reads as "nobody has ever paid you", which
 * is a different and much worse sentence than "this is not switched on yet".
 */

type Payment = {
  id: string;
  created: number;
  amountCents: number;
  mode: string;
  email: string;
  payer: string;
  policy: string;
  payTo: string;
};
type Autopay = {
  id: string;
  created: number;
  currentPeriodEnd: number;
  monthlyCents: number;
  payer: string;
  policy: string;
  payTo: string;
};

export default function PaymentsView() {
  const [state, setState] = useState<
    { kind: "loading" } | { kind: "off" } | { kind: "error"; message: string } | { kind: "ok"; payments: Payment[]; autopays: Autopay[] }
  >({ kind: "loading" });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/workroom/payments");
        const data = (await res.json().catch(() => ({}))) as {
          configured?: boolean;
          payments?: Payment[];
          autopays?: Autopay[];
          error?: string;
        };
        if (data.configured === false) return setState({ kind: "off" });
        if (!res.ok) return setState({ kind: "error", message: data.error || "Could not load payments." });
        setState({ kind: "ok", payments: data.payments ?? [], autopays: data.autopays ?? [] });
      } catch {
        setState({ kind: "error", message: "Could not reach the site." });
      }
    })();
  }, []);

  return (
    <>
      <div className="wr-head">
        <h1>Payments</h1>
        <p className="wr-muted">What came in, and what is set to repeat.</p>
      </div>

      {state.kind === "loading" && <p className="wr-muted">Loading…</p>}

      {state.kind === "off" && (
        <div className="wr-empty">
          <h2>Card payments are not switched on yet.</h2>
          <p>
            The payment page is built and waiting. It turns on once your Stripe account is
            connected and the switch is flipped, and every payment then appears here with the
            name, policy number and carrier it was paid for.
          </p>
        </div>
      )}

      {state.kind === "error" && (
        <p className="wr-error" role="alert">
          {state.message} Stripe&rsquo;s own dashboard still has everything; this screen is only a
          window onto it.
        </p>
      )}

      {state.kind === "ok" && (
        <>
          <h2 className="wr-h2">Monthly autopays</h2>
          {state.autopays.length === 0 ? (
            <p className="wr-muted">Nobody is on autopay yet.</p>
          ) : (
            <ul className="wr-list">
              {state.autopays.map((a) => (
                <li key={a.id}>
                  <div className="wr-row wr-row-static">
                    <span className="wr-row-main">
                      <span className="wr-row-name">{a.payer || "No name recorded"}</span>
                      <span className="wr-row-sub">
                        {[a.policy && `policy ${a.policy}`, a.payTo && a.payTo !== "agency" ? a.payTo : ""]
                          .filter(Boolean)
                          .join(" · ") || "Agency invoice"}
                      </span>
                    </span>
                    <span className="wr-row-when">
                      next {a.currentPeriodEnd ? when(a.currentPeriodEnd * 1000) : "—"}
                    </span>
                    <span className="wr-amount">{money(a.monthlyCents)}/mo</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h2 className="wr-h2">Recent payments</h2>
          {state.payments.length === 0 ? (
            <p className="wr-muted">No payments yet.</p>
          ) : (
            <ul className="wr-list">
              {state.payments.map((p) => (
                <li key={p.id}>
                  <div className="wr-row wr-row-static">
                    <span className="wr-row-main">
                      <span className="wr-row-name">{p.payer || p.email || "No name recorded"}</span>
                      <span className="wr-row-sub">
                        {[
                          p.policy && `policy ${p.policy}`,
                          p.payTo && p.payTo !== "agency" ? p.payTo : "agency invoice",
                          p.mode === "subscription" ? "autopay start" : "",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <span className="wr-row-when">{when(p.created * 1000)}</span>
                    <span className="wr-amount">{money(p.amountCents)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="wr-muted wr-fine">
            Amounts include the online payment fee where one was charged. Refunds and card details
            live in your Stripe dashboard.
          </p>
        </>
      )}
    </>
  );
}
