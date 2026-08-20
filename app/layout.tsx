import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";
import { siteOrigin } from "@/lib/url";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";

/**
 * Fonts are downloaded at build time and served from this site's own origin.
 * That is not a rented dependency and there is no runtime request to Google, so
 * nothing breaks here if Google does. A `<link>` to a font CDN would be the
 * thing that is not allowed.
 *
 * Archivo for display, at 700 to 900 with tight negative tracking. The first
 * version used Fraunces, a soft wonky serif, which read as a wedding invitation
 * rather than as an agency somebody trusts with their house, and left the whole
 * page quiet. The house pattern across these builds is a strong display face
 * plus Inter: Oswald at Copper, Anton and Archivo at Beans, and on Glazed's own
 * site the system stack pushed to 800 with tight tracking. This is that.
 *
 * Mono for labels, license numbers and dollar figures, where tabular digits
 * genuinely matter.
 */
const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800", "900"],
});
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  /* Canonical. Without one, the same page reachable at /demo/x on the pitch
     host and at /x on hers competes with itself. */
  alternates: { canonical: "/" },
  title: {
    default: `${site.name} | Independent insurance in ${site.contact.city}, Michigan`,
    template: `%s | ${site.name}`,
  },
  description:
    "An independent Michigan insurance agency that gives a share of every commission to a local cause, and publishes every dollar of it.",
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
    title: `${site.name} | Coverage that gives back`,
    description:
      "Independent auto, home and business insurance in Michigan. We give a share of every commission to a local cause and publish the ledger.",
    url: "/",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: `${site.name}. Coverage that gives back. An independent agency in ${site.contact.city}, Michigan.`,
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <LocalBusinessSchema />
        <Reveal />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
