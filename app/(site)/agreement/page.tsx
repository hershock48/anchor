import type { Metadata } from "next";
import { agreement, money } from "@/lib/agreement";
import AgreementAccept from "@/components/AgreementAccept";
import "./agreement.css";

/**
 * The custom-order acceptance page, linked from the proposal's closing step.
 * Ported from devine's /agreement.
 *
 * SHAPE: the general terms are NOT restated here. They are the published
 * Glazed Web Client Agreement v1.0, linked and incorporated by reference,
 * exactly the way the glazedweb menu-order clickwrap works. What this page
 * adds is the part v1.0 leaves blank: Exhibit A with Anchor's scope and
 * numbers, the online payment terms, and the acceptance itself.
 *
 * Numbers come from lib/agreement.ts, never typed here. The proposal at
 * public/pitch/anchor/index.html repeats the two headline numbers in prose
 * and is named there as a surface that cannot read the constant.
 *
 * Inside the (site) group on purpose, so it wears the agency's own header
 * and footer: she is reading her own site's deal, on her own site. Noindex,
 * not in the sitemap, not in any nav; the proposal is the only way in.
 */

export const metadata: Metadata = {
  title: "Agreement",
  description: "The custom-order agreement for Anchor Insurance: scope, pricing, the online payment terms, and acceptance.",
  robots: { index: false, follow: false },
};

export default function AgreementPage() {
  return (
    <div className="agr">
      <p className="kicker">Glazed Web × {agreement.client}</p>
      <h1>The agreement, in plain English.</h1>
      <p className="lede">
        Two documents make the whole deal, and both are on this page or one tap from it. The first
        is the{" "}
        <a href={agreement.termsUrl} target="_blank" rel="noopener noreferrer">
          Glazed Web Client Agreement v1.0
        </a>
        , the same published terms every Glazed Web client gets: you own the site outright when the
        build fee is paid, month to month after launch, thirty days&rsquo; notice, no penalty,
        Michigan law. There is also a{" "}
        <a href={agreement.pdfUrl} target="_blank" rel="noopener noreferrer">
          PDF copy
        </a>{" "}
        to keep. The second is the Exhibit A below, which fills in what gets built for you, what it
        costs, and how the online payments work. Accepting at the bottom accepts both together.
      </p>
      <p className="agr-note">If anything is unclear, ask before accepting: kevin@glazedweb.com or a text.</p>

      <h2>Exhibit A, part 1: what is built</h2>
      <p className="agr-note">
        Custom Order. Prepared for {agreement.clientLegal}, {agreement.clientTown}. The site is built and
        reviewable now at {agreement.demo}; it publishes at {agreement.domain}.
      </p>
      <ol className="agr-scope">
        {agreement.scope.map((s) => (
          <li key={s.slice(0, 40)}>{s}</li>
        ))}
      </ol>
      <p>
        <strong>Not included</strong>, and quoted separately if wanted: {agreement.notIncluded}
      </p>

      <h2>Exhibit A, part 2: what it costs</h2>
      <table className="agr-terms">
        <tbody>
          <tr>
            <td>Build fee</td>
            <td>
              {money(agreement.buildFee)}, one time, as proposed. A deposit of {money(agreement.deposit)} is
              due on acceptance and credited against it; the balance of {money(agreement.buildFee - agreement.deposit)}{" "}
              is due on launch. Invoiced separately; nothing is owed until the invoice arrives.
            </td>
          </tr>
          <tr>
            <td>Monthly service fee</td>
            <td>
              {money(agreement.monthly)} per month from the first of the month after launch. Hosting, SSL,
              security updates, backups, domain renewal, the workroom, and the online payment service.
              There is no separate platform, per-policy, or per-customer charge.
            </td>
          </tr>
          <tr>
            <td>Included edits</td>
            <td>
              Up to {agreement.editAllowance} of minor content edits: hours, a new carrier row, a guide
              correction, copy. Most of the everyday facts you can change yourself in the workroom, which
              does not count against this.
            </td>
          </tr>
          <tr>
            <td>Beyond scope</td>
            <td>
              {money(agreement.hourlyRate)} per hour, always quoted and approved by you in writing before
              any work starts. Nothing lands on a bill unannounced.
            </td>
          </tr>
          <tr>
            <td>Online payment fee</td>
            <td>
              ${(agreement.onlineFeeCents / 100).toFixed(2)} per online card payment, paid by the paying
              customer as its own line, collected by Glazed Web as the payment technology provider. Never
              charged to you. The full terms are in part 3.
            </td>
          </tr>
          <tr>
            <td>Timeline</td>
            <td>{agreement.timeline}</td>
          </tr>
        </tbody>
      </table>

      <h2>Exhibit A, part 3: the online payment service</h2>
      <p>
        The site lets your customers see and pay the installments you enter in the workroom (the book),
        by card, on a checkout page under your name, with optional automatic payment on each due date and
        reminder emails before it. These terms apply to that service and are part of the agreement.
      </p>
      <ol className="agr-scope agr-pay">
        {agreement.payments.map((p) => (
          <li key={p.lead}>
            <strong>{p.lead}</strong> {p.text}
          </li>
        ))}
      </ol>

      <h2>Accept</h2>
      <p>
        Typing your name and checking the box forms the agreement, the same way checking out online forms
        one. You will get a copy of the signed record by email, and so will we. That email records the
        version, the scope, the numbers, your name, and the time.
      </p>
      <AgreementAccept business={agreement.client} />

      <p className="agr-note agr-foot">
        Glazed Web · Kevin Hershock · Marshall, Michigan · kevin@glazedweb.com · {agreement.version}
      </p>
    </div>
  );
}
