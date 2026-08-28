import Link from "next/link";
import { site } from "@/lib/site";

/**
 * The navy giving card.
 *
 * It replaced GoalBar on August 28, 2026, when the client dropped the set
 * percentage, the goal and the ledger: with no number to fill a progress bar,
 * the card states the program in a sentence and points at the write-ups.
 * GoalBar and the ledger live in git history before that date if the program
 * ever grows numbers again.
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
        and each one gets its own write-up.
      </p>
      <Link className="givecard-link" href="/giving/causes">
        See who we support
      </Link>
    </div>
  );
}
