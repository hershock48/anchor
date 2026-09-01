import HomeLink from "@/components/HomeLink";
import IntakeDraftClear from "@/components/IntakeDraftClear";

/**
 * Where /api/intake sends the browser after a successful post. Static, tiny,
 * and honest: the copy promises follow-up, not delivery, because delivery
 * depends on INTAKE_TO and RESEND_API_KEY being set and the payload is safe
 * in the log either way.
 */
export const metadata = {
  title: "Got it",
  description: "The intake sheet is in.",
  robots: { index: false, follow: false },
};

export default function IntakeSent() {
  return (
    <section className="pagehead">
      <IntakeDraftClear />
      <div className="wrap">
        <p className="kicker">The intake sheet</p>
        <h1>Got it. Thank you.</h1>
        <p className="lede" style={{ marginTop: 14 }}>
          Blanks and all. Kevin will follow up with you, and anything you skipped
          comes up on the next call rather than as homework. If something changes,
          fill it in again and the newer sheet wins.
        </p>
        <p style={{ marginTop: 22 }}>
          <HomeLink className="btn ghost">Back to the site</HomeLink>
        </p>
      </div>
    </section>
  );
}
