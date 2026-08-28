"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The header mark, with an entrance.
 *
 * The sequence follows the logo's own story: the anchor drops first, then the
 * water flows in across it, left to right.
 *
 *   0.00s  the anchor drops from above and overshoots slightly
 *   0.30s  the three ribbons slide in from the left and settle
 *
 * ONE SHOT, NOT A LOOP. This sits in a sticky header on every page. A looping
 * animation in persistent chrome is the thing people ask you to remove a week
 * later, and it competes with the page for attention forever. It plays once
 * per page load and then it is a logo. The looping water lives in AnchorHero,
 * which appears once, in the hero, where motion is the point.
 *
 * THE UN-ANIMATED STATE IS THE FINISHED STATE. `played` starts false and the
 * animation classes are only added after mount, so with JavaScript off, before
 * hydration, or under reduced motion, the mark is simply drawn and complete.
 * Nothing here can leave an empty header.
 */
export default function HeaderMark({ width = 32 }: { width?: number }) {
  const [play, setPlay] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Next frame, so the initial state is painted before the transition starts.
    const id = requestAnimationFrame(() => setPlay(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const height = Math.round(width * (150 / 120));

  return (
    <svg
      className={play ? "hmark playing" : "hmark"}
      width={width}
      height={height}
      viewBox="0 0 120 150"
      aria-hidden="true"
      focusable="false"
    >
      <g className="hmark-body" fill="none" stroke="var(--navy)">
        <circle cx="60" cy="19.5" r="10" strokeWidth="7.5" />
        <g strokeWidth="10.5" strokeLinecap="round">
          <path d="M60 32 L60 116" />
          <path d="M28 51 L92 51" strokeWidth="9" />
          <path d="M17 86 C21 112 37 127 60 127 C83 127 99 112 103 86" />
        </g>
        <g fill="var(--navy)" stroke="none">
          <circle cx="26" cy="51" r="6.2" />
          <circle cx="94" cy="51" r="6.2" />
          <path d="M8 94 L15 62 L30 87 Q19 82 8 94 Z" />
          <path d="M112 94 L105 62 L90 87 Q101 82 112 94 Z" />
        </g>
      </g>
      <g className="hmark-water" fill="none" strokeLinecap="round">
        <path d="M6 90 C22 76 40 76 57 88 C74 100 92 100 114 84" stroke="var(--gold)" strokeWidth="9" />
        <path d="M10 103 C26 91 44 91 60 101 C76 111 92 111 110 97" stroke="var(--gold-deep)" strokeWidth="6.5" />
        <path d="M22 114 C36 105 52 105 65 111 C77 117 90 117 102 110" stroke="var(--gold)" strokeWidth="4.5" />
      </g>
    </svg>
  );
}
