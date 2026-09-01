import type { Metadata } from "next";
import { Archivo, Cinzel, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { siteOrigin } from "@/lib/url";

/**
 * THE ROOT LAYOUT IS THE DOCUMENT, AND NOTHING ELSE.
 *
 * The header, footer, skip link, reveal system, structured data and the
 * `<main>` landmark used to live here, which was right while every route was
 * a customer page. The workroom broke that assumption: it is the agency's own
 * tool and must carry none of the marketing chrome. Rendering it inside this
 * layout gave it the customer header AND a second nested `<main id="main">`,
 * which the auditor caught as three separate landmark violations on every
 * workroom screen at both widths.
 *
 * So the customer site now lives in the `(site)` route group with its own
 * layout, and the workroom has its own. Route groups do not appear in URLs,
 * so every path is exactly what it was. What stays here is what genuinely
 * belongs to every document: the html and body elements, the fonts, the
 * stylesheet, and the metadata base that relative URLs resolve against.
 */

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
/**
 * Cinzel is the wordmark face ONLY. The client's logo sets the name in
 * Trajan-style capitals and Cinzel is the free face closest to it. It is
 * deliberately not wired into headings: the moment it becomes a heading font
 * the lockup stops being the brand's voice. Self-hosted at build time like
 * the others.
 */
const brand = Cinzel({
  subsets: ["latin"],
  variable: "--font-brand",
  display: "swap",
  weight: ["600", "700"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: `${site.name} | Independent agency in ${site.contact.city}, Michigan`,
    template: `%s | ${site.name}`,
  },
  description:
    "An independent Michigan insurance agency that gives a percentage of what it earns back to local causes in and around Manchester.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} ${brand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
