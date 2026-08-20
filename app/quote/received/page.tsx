import Link from "next/link";

export const metadata = { title: "Request received", robots: { index: false } };

export default function Received() {
  return (
    <section className="pagehead">
      <div className="wrap" style={{ maxWidth: 680 }}>
        <p className="kicker">Get a quote</p>
        <h1>Got it.</h1>
        <p className="lede" style={{ marginTop: 14 }}>
          Your request is in. We will call you back at the number you gave us, usually the same
          business day and always within one.
        </p>
        <p style={{ marginTop: 16 }}>
          Nothing is bound and nothing has changed about your current coverage. You are insured
          by whatever policy you had five minutes ago until a carrier issues a new one in
          writing.
        </p>
        <p style={{ marginTop: 24 }}>
          <Link className="btn" href="/">Back to the site</Link>
        </p>
      </div>
    </section>
  );
}
