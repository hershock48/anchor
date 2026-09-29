"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The edge tab: one persistent ask, pinned to the right of every customer
 * page. Kevin brought the pattern back from a roofing site the client's
 * husband liked (17 September 2026), where a gold tab rides the edge on
 * every page and on every width.
 *
 * WHY IT EARNS ITS PLACE HERE rather than being a third copy of a button we
 * already have twice: below 950px the header's "Get a quote" button is
 * inside the collapsed menu, so on a phone, which is where most of this
 * site is read, there is no visible ask once the hero scrolls away. This is
 * that ask. On desktop it sits alongside the header button the way the
 * roofing site does.
 *
 * IT IS NOT A POPUP. Nothing appears over the page, nothing animates in on a
 * timer, and there is nothing to dismiss; it is a link that happens to be
 * fixed. The version on the site Kevin was shown had a floating bubble AND a
 * tab AND a nav item, and the bubble covered the header's own button at
 * desktop width. One tab, always the same words.
 *
 * IT IS THE SAME SHAPE ON A PHONE AS ON A DESKTOP, since 29 September 2026,
 * at Kevin's word: "adjust that so the mobile matches the website." For
 * twelve days the phone had a different one, a pill in the bottom corner,
 * chosen because a spine on a narrow screen overlaps the text column. That
 * pill turned out to sit on top of the hero's second button, which needed an
 * observer to make it step aside, which needed a comment to explain the
 * observer. The spine needs none of it: it rides the right edge, clear of
 * every button on the site, and it is slimmer on a phone so it takes 8px of
 * the text column's margin rather than 22. The observer and the step-aside
 * are gone with the pill they served; git has them before this commit.
 *
 * Hidden on the quote page itself, where it would point at the page you are
 * already reading, and hidden on the two pages that ARE the conversion (the
 * received pages), where it would be asking twice for something just done.
 */

const HIDE_ON = ["/quote", "/intake"];

export default function QuoteTab() {
  const pathname = usePathname() || "/";
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;

  return (
    <Link className="qtab" href="/quote">
      <span>Get a quote</span>
    </Link>
  );
}
