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
 * desktop width. One tab, always the same words, never in front of anything.
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
