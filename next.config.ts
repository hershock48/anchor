import type { NextConfig } from "next";

const PITCH_HOST = "insuranceforacause.glazedweb.com";

/**
 * The pitch has to work on the *.vercel.app preview URL as well as the custom
 * domain.
 *
 * Scoping these to the custom domain alone means /logo and /demo return 404 on
 * the preview host, which is the URL you actually open first, before DNS is
 * pointed and before the domain is even bought. That is a 404 on the two links
 * the proposal leans on hardest, and you find it by clicking them in front of
 * somebody.
 *
 * Both hosts are noindex below, so serving the pitch on the preview host costs
 * nothing.
 */
const PITCH_HOSTS = "(insuranceforacause\\.glazedweb\\.com|[a-z0-9-]+\\.vercel\\.app)";
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
        { source: "/", destination: "/pitch/insuranceforacause/index.html", has: onPitchHost },
        { source: "/logo", destination: "/pitch/insuranceforacause/logo.html", has: onPitchHost },
        { source: "/demo", destination: "/", has: onPitchHost },
        { source: "/demo/:path*", destination: "/:path*", has: onPitchHost },
      ],
      afterFiles: [],
      fallback: [],
    };
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
