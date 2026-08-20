import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** Crawling is allowed on purpose. The pitch host is kept out of the index by
 *  the X-Robots-Tag header in next.config.ts, not by Disallow, because a
 *  Disallow blocks the crawl without preventing the listing. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
