"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Lockup } from "./Logo";
import { site, ph, isPlaceholder } from "@/lib/site";

const nav = [
  { href: "/coverage", label: "Coverage" },
  { href: "/giving", label: "Our giving" },
  { href: "/tools/michigan-pip", label: "PIP tool" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on navigation. A menu left open across a route change covers the
  // page the visitor just asked for.
  useEffect(() => setOpen(false), [pathname]);

  const phoneReady = !isPlaceholder(site.contact.phone);

  return (
    <header className="site-head">
      <div className="wrap head-in">
        <Link href="/" className="head-brand" aria-label={`${site.name} home`}>
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
            <a className="head-phone" href={`tel:${site.contact.phoneHref}`}>
              {site.contact.phone}
            </a>
          ) : null}
          <Link className="btn" href="/quote">
            Get a quote
          </Link>
        </div>

        <button
          className="head-burger"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="vh">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" className={open ? "bars x" : "bars"}>
            <i /><i /><i />
          </span>
        </button>
      </div>

      <div id="mobile-nav" className={open ? "mnav open" : "mnav"} hidden={!open}>
        <ul>
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href}>{n.label}</Link>
            </li>
          ))}
          <li>
            <Link href="/quote">Get a quote</Link>
          </li>
          {phoneReady ? (
            <li>
              <a href={`tel:${site.contact.phoneHref}`}>{site.contact.phone}</a>
            </li>
          ) : null}
        </ul>
      </div>
    </header>
  );
}
