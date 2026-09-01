import IntakeForm from "@/components/IntakeForm";
import { site } from "@/lib/site";

/**
 * The intake sheet, as a page.
 *
 * Every question here is a fact only the client has, and every one of them is
 * currently a PLACEHOLDER in lib/site.ts or an unchecked box in the README.
 * The proposal links here from its closing ask so she can fill it in the
 * moment she decides, instead of round-tripping a Word document.
 *
 * The form itself lives in components/IntakeForm.tsx, a client component the
 * way QuoteForm is: a plain POST to /api/intake underneath, so scripts off
 * still submits, with JavaScript layered on for the two things that protect
 * her time (a device-local draft, and a send that fails in place instead of
 * navigating to a browser error page). The reasoning is at the top of that
 * file.
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

export default function Intake() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">The intake sheet</p>
          <h1>The facts only you have.</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            Fill in what you know and skip anything you are not sure of. Blanks are
            fine. Send it half-finished if you like; you can always come back and
            send it again, and the newer sheet wins. Every answer unlocks a piece
            of the site, and nothing goes live as a guess.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap qf-grid">
          <IntakeForm />

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
