"use client";

import { useEffect, useRef, useState } from "react";
import { ANCHOR_VIEWBOX, ANCHOR_RATIO, AP, AnchorBody } from "./Logo";

/**
 * The header mark, with an entrance. Geometry is the traced client logo,
 * imported from Logo.tsx so the header can never drift from the real mark.
 *
 *   0.00s  the anchor drops from above and overshoots slightly
 *   0.30s  the two gold ribbons slide in from the left and settle
 *
 * ONE SHOT, NOT A LOOP. This sits in a sticky header on every page. It plays
 * once per page load and then it is a logo. The looping water lives in
 * AnchorHero, in the hero, where motion is the point.
 *
 * THE UN-ANIMATED STATE IS THE FINISHED STATE. The animation classes are only
 * added after mount, so with JavaScript off, before hydration, or under
 * reduced motion, the mark is simply drawn and complete.
 */
export default function HeaderMark({ width = 32 }: { width?: number }) {
  const [play, setPlay] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = requestAnimationFrame(() => setPlay(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const height = Math.round(width * ANCHOR_RATIO);

  return (
    <svg
      className={play ? "hmark playing" : "hmark"}
      width={width}
      height={height}
      viewBox={ANCHOR_VIEWBOX}
      aria-hidden="true"
      focusable="false"
    >
      <g className="hmark-body">
        <AnchorBody ink="var(--navy)" gap="var(--paper)" />
      </g>
      <g className="hmark-water">
        <path fill="var(--gold-light)" d={AP.goldLight} />
        <path fill="var(--gold)" d={AP.goldDark} />
      </g>
    </svg>
  );
}
