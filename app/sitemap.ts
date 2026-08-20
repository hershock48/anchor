import type { MetadataRoute } from "next";
import { site, lines } from "@/lib/site";
import { guides } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const routes = [
    "",
    "/coverage",
    "/giving",
    "/giving/ledger",
    "/tools/michigan-pip",
    "/guides",
    "/about",
    "/contact",
    "/quote",
    "/privacy",
    ...lines.map((l) => `/coverage/${l.slug}`),
    ...guides.map((g) => `/guides/${g.slug}`),
  ];
  return routes.map((r) => ({ url: `${base}${r}`, changeFrequency: "monthly", priority: r === "" ? 1 : 0.7 }));
}
