import Link from "next/link";
import { site, ph, isPlaceholder } from "@/lib/site";
import { getFacts } from "@/lib/content";
import ReviewBand from "@/components/ReviewBand";

export async function generateMetadata() {
  const facts = await getFacts();
  return {
  title: "Contact",
  description: `Reach ${site.name} in ${facts.contact.city}, Michigan. Phone, email and hours.`,
  };
}

export default async function Contact() {
  const facts = await getFacts();
  const phoneReady = !isPlaceholder(facts.contact.phone);
  const emailReady = !isPlaceholder(facts.contact.email);

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Contact</p>
          <h1>Reach a person</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            One of us answers. There is no phone tree and there is no queue, which is one of
            the few genuine advantages of being small.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap contact-grid">
          <div className="card">
            <h2>Phone</h2>
            {phoneReady ? (
              <p className="contact-big"><a href={`tel:${facts.contact.phoneHref}`}>{facts.contact.phone}</a></p>
            ) : (
              <p className="contact-big"><span className="ph">{ph(facts.contact.phone)}</span></p>
            )}
            <p>Fastest way to get a real answer.</p>
          </div>

          <div className="card">
            <h2>Email</h2>
            {emailReady ? (
              <p className="contact-big"><a href={`mailto:${facts.contact.email}`}>{facts.contact.email}</a></p>
            ) : (
              <p className="contact-big"><span className="ph">{ph(facts.contact.email)}</span></p>
            )}
            <p>Send a declarations page and we will read it.</p>
          </div>

          <div className="card">
            <h2>Where we are</h2>
            <p className="contact-addr">
              <span className="ph">{ph(facts.contact.street)}</span>
              <br />
              {facts.contact.city}, {facts.contact.state}{" "}
              <span className="ph">{ph(facts.contact.zip)}</span>
            </p>
            {facts.contact.byAppointmentOnly ? (
              <p>Visits by appointment, so call before you drive over.</p>
            ) : null}
          </div>

          <div className="card">
            <h2>Hours</h2>
            <dl className="hours">
              {facts.hours.map((h) => (
                <div key={h.days}>
                  <dt>{h.days}</dt>
                  <dd>
                    {isPlaceholder(h.open) ? <span className="ph">{ph(h.open)}</span> : h.open}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="wrap" style={{ marginTop: 34 }}>
          <p>
            Want a quote instead of a conversation?{" "}
            <Link href="/quote">The form takes about a minute.</Link>
          </p>
        </div>

        <div className="wrap" style={{ marginTop: 44 }}>
          <ReviewBand />
        </div>
      </section>
    </>
  );
}
