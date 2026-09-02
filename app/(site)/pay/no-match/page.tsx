import type { Metadata } from "next";
import { getFacts } from "@/lib/content";
import { isPlaceholder } from "@/lib/site";

/**
 * Where the find-your-bill lookup lands on a miss. Its own static page so
 * /pay never has to read a query string (which would force it dynamic).
 * Deliberately does not say WHICH of the two fields was wrong.
 */
export const metadata: Metadata = {
  title: "We could not find that bill",
  robots: { index: false, follow: false },
};

export default async function PayNoMatch() {
  const facts = await getFacts();
  return (
    <section className="pagehead">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <p className="kicker">Payments</p>
        <h1>We could not match that.</h1>
        <p className="lede" style={{ marginTop: 14 }}>
          The policy number and ZIP together did not find a bill. Check the number against
          your ID card (letters and numbers only, no spaces) and try again, or{" "}
          {!isPlaceholder(facts.contact.phone) ? (
            <a href={`tel:${facts.contact.phoneHref}`}>call {facts.contact.phone}</a>
          ) : (
            <a href="/contact">reach us</a>
          )}{" "}
          and we will find it together.
        </p>
        <p style={{ marginTop: 22 }}>
          <a className="btn" href="/pay">
            Try again
          </a>
        </p>
      </div>
    </section>
  );
}
