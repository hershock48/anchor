import { site, ph, isPlaceholder } from "@/lib/site";
import { getFacts } from "@/lib/content";

export const metadata = {
  title: "Privacy",
  description: "What this site collects, where it goes, and how long it is kept.",
};

export default async function Privacy() {
  const facts = await getFacts();
  return (
    <>
      <section className="pagehead">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <p className="kicker">Privacy</p>
          <h1>What we collect and where it goes</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            Short, specific, and written to be read. A privacy page that nobody can follow is
            not a privacy page.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap prose" style={{ maxWidth: 760 }}>
          <h2>The quote form</h2>
          <p>
            The form asks for a name, a phone number, a ZIP code and optionally an email
            address, a street address, who covers you now and when it renews. That is all it
            asks for.
          </p>
          <p>
            <strong>It deliberately does not ask for dates of birth, driver&rsquo;s license
            numbers or vehicle identification numbers.</strong> A rater needs those, but they come up on the phone, with a person.
          </p>

          <h2>Where it goes</h2>
          <p>
            A submission goes to {site.legalName} in two places and stops there: a private
            list only this agency can open, so your request is not lost between calls, and a
            mailbox belonging to the agency. It is not sold, not shared with a lead broker,
            and not handed to any third party other than a carrier we are actually quoting
            you with, at your request.
          </p>
          <p>
            Nobody outside the agency can see that list. It holds what you typed on the form
            and the notes we make while working on your quote, and nothing else about you.
          </p>
          <p className="ph-block">
            <span className="ph">Retention period to confirm</span>. Quote requests we do not
            write get deleted on a schedule; the exact one goes here once the agency sets it.
          </p>

          <h2>Calls and texts</h2>
          <p>
            The form asks you to agree that we may call or text you about your request. That
            consent is for this request only. Replying STOP to a text ends them, and asking us
            on the phone works just as well.
          </p>

          <h2>What this site tracks</h2>
          <p>
            No advertising trackers and no third-party analytics that follow you elsewhere. The
            fonts are served from this site&rsquo;s own domain, not loaded from Google,
            so visiting this page does not tell anyone else you were here.
          </p>

          <h2>The giving program</h2>
          <p>
            The giving pages ask nothing of you. There is no signup and no list, and no
            donation is ever connected to a policy. Michigan rules would not allow a
            policyholder to direct one anyway.
          </p>

          <h2>Questions</h2>
          <p>
            Ask us. {isPlaceholder(facts.contact.email) ? (
              <span className="ph">{ph(facts.contact.email)}</span>
            ) : (
              <a href={`mailto:${facts.contact.email}`}>{facts.contact.email}</a>
            )}
            .
          </p>
        </div>
      </section>
    </>
  );
}
