import { site, isPlaceholder } from "@/lib/site";

/**
 * The navy giving card.
 *
 * It replaced GoalBar on August 28, 2026, when the client dropped the set
 * percentage, the goal and the ledger: with no number to fill a progress bar,
 * the card states the program in a sentence. Its link pointed at the causes
 * write-up page until September 1, 2026, when the client simplified again:
 * causes are posted on her social accounts, so the link is Facebook, gated on
 * the placeholder like the review ask, and the card stands without a link
 * until the real URL lands. GoalBar, the ledger and the causes page all live
 * in git history if the program ever grows them back.
 */
export default function GivingCard() {
  return (
    <div className="givecard">
      <p className="kicker">Our giving</p>
      {/* "Share" here, "percentage" in the hero: the same phrase three times
          on the homepage would be a tic. */}
      <h2 className="givecard-line">
        A share of what we earn goes back to {site.contact.city}.
      </h2>
      {/* No "who they are, why we picked them" here: the pages this card sits
          on already say that once, and twice on a page is the limit. */}
      <p className="givecard-sub">
        Our money, not a charge on your policy. The causes we pick are close to home,
        and we post each one as it happens.
      </p>
      {!isPlaceholder(site.social.facebook) && (
        <a className="givecard-link" href={site.social.facebook}>
          Follow along on Facebook
        </a>
      )}
    </div>
  );
}
