"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Lockup } from "./Logo";
import { useHomeHref } from "./HomeLink";
import { site, isPlaceholder } from "@/lib/site";

const nav = [
  { href: "/coverage", label: "Coverage" },
  { href: "/giving", label: "Our giving" },
  { href: "/tools/michigan-pip", label: "PIP tool" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * The phone arrives as props: this is a client component and cannot read the
 * workroom's edits through lib/content.ts, so the site layout resolves the
 * effective value and hands it down.
 */
export default function Header({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  const pathname = usePathname();
  const home = useHomeHref();
  /**
   * THE MOBILE MENU IS A <details>, WITH NO JAVASCRIPT AT ALL.
   *
   * This took two wrong turns worth recording. First it was React state with
   * `hidden` rendered on the server, which left exactly one reachable header
   * link at 390px with JavaScript off. Fixing that by rendering the list
   * expanded and collapsing it on hydration fixed the links and introduced
   * something worse: the header shipped ~365px taller than it ends up, so
   * hydration collapsed it and threw the whole page upward. That measured
   * **CLS 0.3947** against a 0.1 bar, and only on a throttled connection,
   * which is exactly the profile a real phone has and a desktop test does not.
   *
   * A native disclosure has neither problem. It is collapsed in the server's
   * HTML, so nothing moves when React arrives, and it opens without any
   * JavaScript, so every link is reachable. It is also keyboard operable and
   * announced correctly for free.
   *
   * Do not replace this with a button and state to get a nicer animation.
   * The animation is not worth either failure.
   */

  const phoneReady = !isPlaceholder(phone);

  return (
    <header className="site-head">
      <div className="wrap head-in">
        <Link href={home} className="head-brand" aria-label={`${site.name} home`}>
          <Lockup markWidth={32} />
        </Link>

        <nav className="head-nav" aria-label="Main">
          <ul>
            {nav.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active ? "page" : undefined}>
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="head-cta">
          {phoneReady ? (
            <a className="head-phone" href={`tel:${phoneHref}`}>
              {phone}
            </a>
          ) : null}
          {/* The two things a customer comes to do, side by side: pay, and get
              a quote. "Pay a bill" was a text-nav item for a day (September 2,
              2026) and read as one more page; as the second button it reads as
              an action, which is what the carriers' own sites do. */}
          <Link className="btn ghost" href="/pay">
            Pay a bill
          </Link>
          <Link className="btn" href="/quote">
            Get a quote
          </Link>
        </div>

      </div>

      <details className="mnav">
        <summary className="mnav-toggle" aria-label="Menu">
          <span className="mnav-word">Menu</span>
          <span aria-hidden="true" className="bars">
            <i /><i /><i />
          </span>
        </summary>
        <ul>
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href}>{n.label}</Link>
            </li>
          ))}
          <li>
            <Link href="/pay">Pay a bill</Link>
          </li>
          <li>
            <Link href="/quote">Get a quote</Link>
          </li>
          {phoneReady ? (
            <li>
              <a href={`tel:${phoneHref}`}>{phone}</a>
            </li>
          ) : null}
        </ul>
      </details>

    </header>
  );
}
