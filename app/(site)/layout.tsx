import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import { site } from "@/lib/site";
import { getFacts } from "@/lib/content";

/**
 * The CUSTOMER site's shell: everything a visitor should see wrapped around
 * every visitor-facing page.
 *
 * This was the root layout until the workroom arrived. `(site)` is a route
 * group, so it adds nothing to any URL: /about is still /about. What it buys
 * is that the agency's own tool at /workroom does not inherit a shopfront
 * header, a footer full of customer links, a reveal system it has no use for,
 * or a `<main>` landmark it then nested a second one inside.
 *
 * The search and sharing metadata lives here rather than in the root for the
 * same reason: a canonical URL and an og:image belong to the public site, and
 * the workroom is noindex and has no card.
 */
export async function generateMetadata(): Promise<Metadata> {
  const facts = await getFacts();
  return {
  /**
   * NO CANONICAL HERE. This layout carried `alternates: { canonical: "/" }`
   * until September 16, 2026, and because a layout's metadata is inherited
   * by every page under it, every route on the site (about, each coverage
   * page, each guide) declared the HOMEPAGE as its canonical URL, which
   * tells a search engine that the whole site is one duplicated page. The
   * same field as `openGraph.url` did the same to link shares. Each
   * indexable page now sets its own `alternates.canonical`; the noindex
   * pages (intake, the bill, the thank-you pages) set none. A new page
   * needs its own line or it inherits nothing.
   *
   * NEXT DOES NOT DEEP-MERGE `openGraph`. A page that defines its own block
   * replaces this one wholesale, image included, and that route silently loses
   * its card. Pages set `title`, `description` and `alternates` at the top
   * level, which merge fine, and og:title and og:description fall back to
   * those. If you ever add an `openGraph` block to a page, set the image on
   * it too (the homepage does, because it wants the tagline as its card title).
   */
  openGraph: {
    type: "website",
    siteName: site.name,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: `${site.name}. ${site.tagline}. An independent agency in ${facts.contact.city}, Michigan.`,
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const facts = await getFacts();
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <LocalBusinessSchema />
      <Reveal />
      {/* Header is a client component (it reads the pathname), so it takes
          the one editable fact it shows as props instead of calling the seam. */}
      <Header phone={facts.contact.phone} phoneHref={facts.contact.phoneHref} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
