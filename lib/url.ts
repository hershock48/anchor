import { site } from "./site";

/**
 * What relative URLs resolve to.
 *
 * `metadataBase` decides what every canonical, every sitemap entry and every
 * `og:image` actually points at. link-cards.md is blunt about this: point it at
 * the client's real domain, because pointing it at a preview host advertises a
 * duplicate of the site as the original, and that is the one SEO fault that
 * actively works against a client rather than merely missing an opportunity.
 *
 * The problem here is that her real domain IS NOT BOUGHT. Hardcoding it makes
 * every card and canonical resolve to a host that answers nothing, which is how
 * you text somebody a link and get a bare row of text. Hardcoding the Vercel
 * host instead commits the fault above the day the domain does go live.
 *
 * So it resolves in this order, and switches by itself:
 *
 *   1. The real domain, but ONLY once `site.urlConfirmed` is true. Flip that
 *      flag the day the domain is bought and pointed. Nothing else changes.
 *   2. Otherwise the deployment's own host, so cards and canonicals resolve to
 *      something real while this is still a concept build being texted around.
 *
 * Every pitch and preview host sends `X-Robots-Tag: noindex, nofollow`, so
 * case 2 cannot be indexed and cannot compete with her for her own name.
 */
export function siteOrigin(): string {
  if (site.urlConfirmed) return site.url.replace(/\/$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
