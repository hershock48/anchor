import type { NextConfig } from "next";

/**
 * ANY glazedweb.com subdomain is a pitch host, and so is any vercel.app preview.
 *
 * This started as the single literal host `insuranceforacause.glazedweb.com`,
 * which was the wrong shape twice over. The subdomain actually created was
 * `anchor.glazedweb.com`, named for the repo rather than the DBA, so nothing
 * matched and the pitch host served the client's homepage instead of the
 * proposal. And scoping to the custom domain alone meant /logo and /demo were
 * 404 on the preview URL, which is the host you open before DNS is pointed.
 *
 * Matching the pattern rather than the name removes both failures and the whole
 * class they belong to. A glazedweb.com subdomain is never the client's own
 * domain, so there is no case where this matches something it should not.
 *
 * Everything it matches is noindex below.
 */
const PITCH_HOSTS = "([a-z0-9-]+\\.glazedweb\\.com|[a-z0-9-]+\\.vercel\\.app)";
const onPitchHost = [{ type: "host" as const, value: PITCH_HOSTS }];

const nextConfig: NextConfig = {
  async rewrites() {
    /**
     * THE HOST SPLIT.
     *
     * On a pitch host: the proposal at the root, the logo presentation at
     * /logo, and the whole real site under /demo. On the client's own domain:
     * the site at the root and no proposal anywhere.
     *
     * THESE MUST BE IN `beforeFiles`. A plain `rewrites()` array is
     * `afterFiles`, which only runs once Next has failed to find a page, and
     * app/page.tsx already answers "/", so the root rewrite would silently
     * never fire and the pitch host would serve the client's homepage.
     *
     * Host scoping rather than `basePath: "/demo"`, because basePath is global
     * to a build and would bury the real site under /demo the day the domain
     * goes live.
     *
     * One known wart: links are root-relative, so the /demo prefix drops off
     * after the first click. Nothing 404s.
     */
    return {
      beforeFiles: [
        { source: "/", destination: "/pitch/anchor/index.html", has: onPitchHost },
        { source: "/logo", destination: "/pitch/anchor/logo.html", has: onPitchHost },
        { source: "/demo", destination: "/", has: onPitchHost },
        { source: "/demo/:path*", destination: "/:path*", has: onPitchHost },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  async redirects() {
    /**
     * /giving/causes existed from August 28 to September 1, 2026, when the
     * client simplified the program again: specifics live on her social
     * accounts, so the write-up page is gone. The proposal deep-linked it
     * and it sat in the sitemap, so it redirects rather than 404s.
     * `permanent: true` is a 308, which preserves method; see the /api trap
     * in glaze.md for why not 301.
     */
    return [{ source: "/giving/causes", destination: "/giving", permanent: true }];
  },

  async headers() {
    return [
      {
        /**
         * Same host set as the rewrites, so the two cannot drift apart. The
         * preview host is indexable by default and is the same
         * duplicate-content risk as the pitch domain.
         */
        source: "/:path*",
        has: [{ type: "host", value: PITCH_HOSTS }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
