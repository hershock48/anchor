import type { NextConfig } from "next";

const PITCH_HOST = "insuranceforacause.glazedweb.com";
const onPitchHost = [{ type: "host" as const, value: PITCH_HOST }];

const nextConfig: NextConfig = {
  async rewrites() {
    /**
     * THE HOST SPLIT.
     *
     * On the pitch host: the proposal at the root, the logo presentation at
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
         * The pitch host is a duplicate of the client's site and must never be
         * indexed. The .vercel.app host is the same risk and is indexable by
         * default, which is why this is matched on host rather than on path.
         */
        source: "/:path*",
        has: [{ type: "host", value: PITCH_HOST }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<h>.*\\.vercel\\.app)" }],
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
