"use client";

import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

/**
 * THE WORKROOM'S HEADER. One place, every page.
 *
 * Deliberately NOT the site's header. The customer chrome is a shopfront:
 * logo, nav, a quote button. This is a tool bar, small and dense, and it never
 * scrolls away because the queue is long and the tabs should not be a
 * scroll-to-top errand. Lifted from devine's Chrome, whose header records both
 * lessons: one nav rather than three hand-written ones, and a boundary slash
 * in the active test so /workroom/leads/<id> lights the Leads tab without
 * /workroom/pay lighting /workroom/payments.
 */

const TABS = [
  { href: "/workroom", label: "Leads" },
  { href: "/workroom/payments", label: "Payments" },
  { href: "/workroom/facts", label: "Site facts" },
];

export default function WorkroomChrome() {
  const path = usePathname() || "/workroom";

  const isActive = (href: string) =>
    href === "/workroom" ? path === href || path.startsWith("/workroom/leads") : path === href || path.startsWith(href + "/");

  async function lock() {
    await fetch("/api/workroom/logout", { method: "POST" });
    window.location.href = "/workroom";
  }

  return (
    <header className="wr-chrome">
      <div className="wr-chrome-in">
        {/* The mark is the way home, and home is the queue. */}
        <a className="wr-brand" href="/workroom">
          <span className="wr-shop">{site.name}</span>
          <span className="wr-word">Workroom</span>
        </a>

        <nav className="wr-tabs" aria-label="Workroom">
          {TABS.map((t) => (
            <a key={t.href} href={t.href} aria-current={isActive(t.href) ? "page" : undefined}>
              {t.label}
            </a>
          ))}
        </nav>

        <div className="wr-right">
          {/* New tab, so the queue is never lost behind a marketing page. */}
          <a href="/" target="_blank" rel="noreferrer">
            The site <span aria-hidden="true">↗</span>
          </a>
          <button type="button" onClick={lock}>Lock</button>
        </div>
      </div>
    </header>
  );
}
