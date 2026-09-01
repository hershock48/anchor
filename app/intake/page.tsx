import { site } from "@/lib/site";

/**
 * The intake sheet, as a page.
 *
 * Every question here is a fact only the client has, and every one of them is
 * currently a PLACEHOLDER in lib/site.ts or an unchecked box in the README.
 * The proposal links here from its closing ask so she can fill it in the
 * moment she decides, instead of round-tripping a Word document.
 *
 * DELIBERATELY ZERO CLIENT JAVASCRIPT. This is a plain form POST to
 * /api/intake, so the no-JS rule from glaze.md is satisfied by construction
 * rather than by testing. Native `required` validation works without JS too.
 *
 * Everything except her name is optional, and the copy says so. The intake
 * standard's whole point is that a client who answers eight of twelve has
 * unblocked eight things; a form that demands completeness gets abandoned
 * instead of half-filled.
 *
 * This page is not in the nav, not in the sitemap, and carries robots noindex
 * of its own, because the pitch host's noindex header stops protecting it the
 * day the real domain goes live.
 */
export const metadata = {
  title: "Intake sheet",
  description: "The facts only you have. Fill in what you know, skip the rest.",
  robots: { index: false, follow: false },
};

function Row({
  name,
  label,
  hint,
  required,
  area,
  rows,
  type,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  area?: boolean;
  rows?: number;
  type?: string;
}) {
  return (
    <div className="qf-row">
      <label htmlFor={`in-${name}`}>
        {label}
        {!required && <span className="qf-opt"> (optional)</span>}
      </label>
      {hint && <p className="qf-optnote" style={{ margin: "0 0 8px" }}>{hint}</p>}
      {area ? (
        <textarea id={`in-${name}`} name={name} rows={rows || 3} maxLength={2000} />
      ) : (
        <input
          id={`in-${name}`}
          name={name}
          type={type || "text"}
          maxLength={300}
          required={required}
        />
      )}
    </div>
  );
}

export default function Intake() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">The intake sheet</p>
          <h1>The facts only you have.</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            Fill in what you know and skip anything you are not sure of. Blanks are
            fine. Every answer unlocks a piece of the site, and nothing goes live as
            a guess.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap qf-grid">
          <form className="qf" method="post" action="/api/intake">
            {/* Honeypot, same mechanism as the quote form. Off-screen and labelled. */}
            <div className="qf-hp" aria-hidden="true">
              <label htmlFor="in-company">Leave this field empty</label>
              <input id="in-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <fieldset>
              <legend>The basics</legend>
              <Row name="name" label="Your full name" hint="As it should appear on the site." required />
              <Row name="title" label="Your title" hint="We have &ldquo;Agent and owner&rdquo; penciled in." />
              <Row name="amanda_role" label="Amanda&rsquo;s role" hint="So we introduce her correctly." />
              <div className="qf-two">
                <Row name="phone" label="Office phone" type="tel" />
                <Row name="email" label="Email for the site" hint="And who reads that inbox." />
              </div>
              <Row name="address" label="Street address and ZIP" area rows={2} />
              <Row name="walkin" label="Walk-in or by appointment?" hint="This changes how the contact page reads." />
              <Row
                name="hours"
                label="Hours"
                hint="Weekdays, Saturday, and any seasonal exception or one day that is different."
                area
              />
              <Row name="founding_year" label="Founding year" hint="Only if you want one shown." />
            </fieldset>

            <fieldset>
              <legend>Licensing and carriers</legend>
              <div className="qf-two">
                <Row name="license_number" label="Michigan producer license number" />
                <Row name="npn" label="NPN" />
              </div>
              <Row
                name="carriers"
                label="Carriers you are appointed with"
                hint="We only show confirmed appointments. Some carriers have rules about using their logo, so we check each one before it appears."
                area
              />
            </fieldset>

            <fieldset>
              <legend>Online</legend>
              <Row name="facebook" label="Facebook page" />
              <Row name="socials" label="Instagram or other accounts" hint="Anywhere you post that the site should link to." />
              <Row name="gbp" label="Google Business Profile" hint="Do you have one? If so, the link." />
              <Row
                name="review_link"
                label="Google review link"
                hint="The write-a-review link from your Business Profile dashboard. We can help you pull this one."
              />
              <Row
                name="domain"
                label="Website address"
                hint="We have anchorinsurancemi.com penciled in, not purchased. Tell us what you want and we will handle the rest. It is registered in your name."
              />
            </fieldset>

            <fieldset>
              <legend>The giving page</legend>
              <p className="qf-optnote">
                The site says a percentage of what you earn goes back, with no dollar
                amounts. If the specifics are going to live on your social accounts,
                the giving page can stay simple and point people there.
              </p>
              <Row
                name="giving_where"
                label="Where will giving updates live?"
                hint="Facebook, Instagram, a newsletter, wherever you will actually post them."
              />
              <Row name="giving_page" label="Anything the giving page itself should say?" area />
              <Row
                name="attorney"
                label="Attorney or E&amp;O review"
                hint="Michigan has rules on advertising donated commission. Has your attorney or E&amp;O carrier looked at the program, and if not, would you like us to send them a one-page summary?"
              />
            </fieldset>

            <fieldset>
              <legend>Your story and photos</legend>
              <Row
                name="call_time"
                label="A time to talk"
                hint="The About page comes from a recorded phone conversation, about an hour, in your own words. What day and time works?"
              />
              <Row
                name="photos"
                label="Photos we can use"
                hint="You, the office, Manchester. If someone else took a photo, we need their OK in writing. Files can go by email or text; here, just tell us what you have."
                area
                rows={2}
              />
              <Row
                name="logo_file"
                label="The original logo file"
                hint="The file your designer sent you, if you have it. The copy we are working from looks great on screen, and the original would let us use it in print too."
              />
            </fieldset>

            <fieldset>
              <legend>Nuts and bolts</legend>
              <Row
                name="quote_inbox"
                label="Where should quote requests go?"
                hint="An email inbox you own and check. Quote forms on the site will be delivered there."
              />
              <Row
                name="retention"
                label="How long do you keep quote information?"
                hint="This goes in the privacy policy, in plain language."
              />
            </fieldset>

            <div className="qf-actions">
              <button className="btn" type="submit">Send it to Kevin</button>
              <p className="qf-note">Goes straight to his inbox. Nothing here is published anywhere.</p>
            </div>
          </form>

          <aside className="side">
            <h2>Rather do this out loud?</h2>
            <p>
              Every question on this sheet can be answered on a call instead, and
              blanks come up naturally.{" "}
              <a href="mailto:kevin@glazedweb.com?subject=Anchor%20Insurance%20intake">Email Kevin</a>{" "}
              and he will set one up.
            </p>
            <h2 style={{ marginTop: 26 }}>What happens when you hit send</h2>
            <ol className="sidesteps">
              <li>The sheet lands in Kevin&rsquo;s inbox, blanks and all.</li>
              <li>Whatever is blank comes up on the next call, not as homework.</li>
              <li>The answers go straight into the site, each in exactly one place.</li>
            </ol>
            <p className="side-fine">
              Nothing you write here binds coverage, publishes anywhere, or commits
              {" "}{site.name} to anything. It just fills in the site.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
