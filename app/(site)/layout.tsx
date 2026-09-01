import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import { site } from "@/lib/site";

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
export const metadata: Metadata = {
  /* Canonical. Without one, the same page reachable at /demo/x on the pitch
     host and at /x on hers competes with itself. */
  alternates: { canonical: "/" },
  /**
   * NEXT DOES NOT DEEP-MERGE `openGraph`. A page that defines its own block
   * replaces this one wholesale, image included, and that route silently loses
   * its card. Every page in this app sets only `title` and `description` at the
   * top level, which merge fine. If you ever add an `openGraph` block to a
   * page, set the image on it too.
   */
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description:
      "Independent auto, home and business insurance in Michigan. A percentage of what we earn goes back to local causes.",
    url: "/",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: `${site.name}. ${site.tagline}. An independent agency in ${site.contact.city}, Michigan.`,
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <LocalBusinessSchema />
      <Reveal />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
