import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";

/**
 * Fonts are downloaded at build time and served from this site's own origin.
 * That is not a rented dependency and there is no runtime request to Google, so
 * nothing here breaks if Google does. A `<link>` to a font CDN would be the
 * thing that is not allowed.
 *
 * Fraunces for display because it has weight without looking like a bank, Inter
 * for the reading, and a mono for labels, license numbers and dollar figures
 * where tabular digits actually matter.
 */
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Independent insurance in ${site.contact.city}, Michigan`,
    template: `%s | ${site.name}`,
  },
  description:
    "An independent Michigan insurance agency that gives a share of every commission to a local cause, and publishes every dollar of it.",
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | Coverage that gives back`,
    description:
      "Independent auto, home and business insurance in Michigan. We give a share of every commission to a local cause and publish the ledger.",
    url: "/",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Reveal />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
