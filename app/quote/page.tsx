import QuoteForm from "@/components/QuoteForm";
import { site, ph, isPlaceholder } from "@/lib/site";

export const metadata = {
  title: "Get a quote",
  description:
    "Four fields and we will call you back. An independent Michigan agency shopping several carriers for you.",
};

/**
 * Static on purpose. Reading `searchParams` here forced a dynamic render, and
 * the router's prefetch of a dynamic route 307'd and then failed in the
 * console on every page that links here. The `?line=` hint is read inside
 * QuoteForm instead, which is already a client component, so the page is
 * static and the prefetch is clean.
 */
export default function Quote() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Get a quote</p>
          <h1>Four fields. Then a person calls you.</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            We are independent, so this gets shopped across several carriers rather than run
            through one company&rsquo;s rater. If we cannot beat what you have, we will say so.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap qf-grid">
          <QuoteForm />
          <aside className="side">
            <h2>Rather just talk?</h2>
            {!isPlaceholder(site.contact.phone) ? (
              <p><a className="btn ghost" href={`tel:${site.contact.phoneHref}`}>Call {site.contact.phone}</a></p>
            ) : (
              <p>Phone: <span className="ph">{ph(site.contact.phone)}</span></p>
            )}
            <h2 style={{ marginTop: 26 }}>What happens next</h2>
            <ol className="sidesteps">
              <li>We call you back, same business day where we can.</li>
              <li>We ask the details a rater needs. That part is a conversation, not a form.</li>
              <li>You get options with the differences explained, not just prices.</li>
            </ol>
            <p className="side-fine">
              Submitting this does not bind coverage and does not change the policy you have
              now.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
