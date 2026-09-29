"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
 * "NEVER IN FRONT OF ANYTHING" WAS NOT TRUE ON A PHONE, and a render on 29
 * September 2026 showed it: on the homepage's first screen the pill sat on
 * top of the hero's second button, covering the end of its label and part of
 * its tap target, a few pixels under a coral button that says the same two
 * words. So it steps aside. While one of the page's OWN quote buttons is on
 * screen (the hero's, or the closing band's) the pill is marked away, and it
 * comes back the moment they scroll out of view, which is exactly when the
 * reasoning above says it is needed.
 *
 * The stepping aside is phone-only and lives in the stylesheet: this
 * component sets the class at every width, and globals.css acts on it only
 * below 700px. On desktop the tab rides the margin and covers nothing.
 *
 * ON THE HOMEPAGE IT STARTS AWAY, before any script runs, because the hero's
 * button is in the first screen and a pill that paints and then hides is a
 * flash on every visit. The cost is stated rather than hidden: with
 * JavaScript off, a phone never shows the pill on the homepage. That page has
 * a quote button in its hero and another in its closing band, so the ask is
 * still there, and every other page starts with the pill showing.
 *
 * Hidden on the quote page itself, where it would point at the page you are
 * already reading, and hidden on the two pages that ARE the conversion (the
 * received pages), where it would be asking twice for something just done.
 */

const HIDE_ON = ["/quote", "/intake"];

/** The page's own quote buttons. While one is on screen the pill is surplus. */
const OWN_ASKS = ".hero-cta, .close-actions";

export default function QuoteTab() {
  const pathname = usePathname() || "/";
  const hidden = HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const [away, setAway] = useState(pathname === "/");

  useEffect(() => {
    if (hidden) return;
    const asks = Array.from(document.querySelectorAll(OWN_ASKS));
    if (asks.length === 0 || typeof IntersectionObserver === "undefined") {
      setAway(false);
      return;
    }
    const onScreen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) onScreen.add(e.target);
          else onScreen.delete(e.target);
        }
        setAway(onScreen.size > 0);
      },
      { threshold: 0.15 }
    );
    asks.forEach((a) => io.observe(a));
    return () => io.disconnect();
  }, [pathname, hidden]);

  if (hidden) return null;

  return (
    <Link className={away ? "qtab is-away" : "qtab"} href="/quote">
      <span>Get a quote</span>
    </Link>
  );
}
