"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * A link to the site's home that knows where "home" actually is.
 *
 * On the client's own domain the site root is `/`. On a pitch host it is not:
 * `/` is the PROPOSAL, the site lives under `/demo`, and a logo pointing at `/`
 * throws the client out of their own site and back into the sales document
 * they were reading five minutes ago. In front of a prospect that is the worst
 * link on the page.
 *
 * proposal.md notes the known wart that the `/demo` prefix drops off after the
 * first click, and that nothing 404s. That is true, and it is why every OTHER
 * link is fine: `/coverage` on the pitch host is not rewritten and Next serves
 * it normally. `/` is the single exception, because it is the one path that
 * means something different on that host.
 *
 * Detected from the hostname on the client, because the rewrite is server-side
 * and `usePathname()` reports `/`, not `/demo`. The server renders `/` and the
 * effect corrects it after mount. That is a one-frame window on an href, with
 * no layout consequence.
 *
 * THE HOST PATTERN MUST MATCH `PITCH_HOSTS` IN next.config.ts. If one changes
 * and the other does not, the logo silently goes back to being wrong.
 */
const PITCH_HOST = /(^|\.)glazedweb\.com$|\.vercel\.app$/;

export function useHomeHref(): string {
  const [href, setHref] = useState("/");
  useEffect(() => {
    if (PITCH_HOST.test(window.location.hostname)) setHref("/demo");
  }, []);
  return href;
}

export default function HomeLink({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "children">) {
  return (
    <Link href={useHomeHref()} className={className} {...rest}>
      {children}
    </Link>
  );
}
