import { ph, isPlaceholder } from "@/lib/site";
import { getFacts } from "@/lib/content";

/**
 * The Google review ask. Added August 28, 2026, at the client's request, and
 * it earns its place: the proposal's own research says nearly half of people
 * will not use a business with fewer than twenty reviews, and this site can
 * ask for them better than a follow-up email can.
 *
 * Until the Google Business Profile exists the button renders as a marked
 * blank rather than a dead link, gated the same way as every other
 * placeholder on the site. The link itself lives in lib/site.ts, or in the workroom's facts screen once she pastes it there.
 */
export default async function ReviewBand() {
  const facts = await getFacts();
  const ready = !isPlaceholder(facts.social.googleReview);

  return (
    <div className="reviewband">
      <div>
        <h2>Had a good experience with us?</h2>
        <p>
          A Google review is the most useful thing a happy customer can do for a new
          agency. It takes about a minute, and we read every one.
        </p>
      </div>
      {ready ? (
        <a className="btn" href={facts.social.googleReview} rel="noopener">
          Review us on Google
        </a>
      ) : (
        <p className="review-ph">
          Review link: <span className="ph">{ph(facts.social.googleReview)}</span>
        </p>
      )}
    </div>
  );
}
