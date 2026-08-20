import Link from "next/link";
import { giving, ph, isPlaceholder } from "@/lib/site";

export const metadata = {
  title: "Where the money went",
  description:
    "Every donation this agency has made, with the date, the organization, the amount and the proof.",
};

export default function Ledger() {
  const rows = giving.ledger;
  const total = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Our giving</p>
          <h1>Where the money went</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            Every check, with the date, the organization and the amount. This page adds itself
            up. If it ever stops being current, the date at the bottom will say so rather than
            quietly not saying anything.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          {rows.length === 0 ? (
            /* The honest empty state. Not a $0 counter, and not a fake row. */
            <div className="ledger-empty">
              <h2>Nothing here yet, and we are not going to pretend otherwise.</h2>
              <p>
                We opened <span className="ph">{ph("opening month")}</span>. The first
                donation goes here the day it is written, and this page will be short for a
                while. That is what a real one looks like at the start.
              </p>
              <p>
                In the meantime you can see what we are raising for now, and nominate the next
                one.
              </p>
              <p className="ledger-empty-cta">
                <Link className="btn" href="/giving">How the giving works</Link>
              </p>
            </div>
          ) : (
            <>
              <div className="tablewrap" tabIndex={0} role="region" aria-label="Donation ledger, scrolls sideways">
              <table className="ledger">
                <caption className="vh">Donations made by this agency</caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Organization</th>
                    <th scope="col">Period</th>
                    <th scope="col" className="num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={`${r.date}-${i}`}>
                      <td className="mono">{r.date}</td>
                      <th scope="row">
                        {r.orgUrl ? <a href={r.orgUrl}>{r.org}</a> : r.org}
                        <span className="ledger-city">{r.city}</span>
                      </th>
                      <td>{r.period}</td>
                      <td className="num mono">${r.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colSpan={3}>Total given</th>
                    <td className="num mono">${total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
              </div>
              <p className="pip-source">
                As of <span className="ph">{ph("last updated")}</span>.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
