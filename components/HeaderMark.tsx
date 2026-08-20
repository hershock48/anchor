"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The header mark, with an entrance.
 *
 * The idea Kevin described: the anchor falls, and the string it falls on
 * resolves into the heart. So the sequence is rope first, then weight, then
 * the heart forming at the top where the rope was.
 *
 *   0.00s  the rope draws downward, top to bottom
 *   0.28s  the anchor drops from above and overshoots slightly
 *   0.52s  the heart scales up from the point the rope ends
 *
 * ONE SHOT, NOT A LOOP. This sits in a sticky header on every page. A looping
 * animation in persistent chrome is the thing people ask you to remove a week
 * later, and it competes with the page for attention forever. It plays once per
 * page load and then it is a logo.
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
      {/* The rope. Drawn with a dash offset so it appears to fall downward. */}
      <path
        className="hmark-rope"
        d="M60 2 L60 40"
        stroke="var(--navy-3)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        className="hmark-heart"
        d="M60 45 C60 45 38.5 32.5 38.5 19.5 C38.5 11.6 44.6 5.4 52.3 5.4
           C56.3 5.4 59 7.5 60 10.2 C61 7.5 63.7 5.4 67.7 5.4
           C75.4 5.4 81.5 11.6 81.5 19.5 C81.5 32.5 60 45 60 45 Z"
        fill="none"
        stroke="var(--brick)"
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <g
        className="hmark-body"
        fill="none"
        stroke="var(--navy)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M60 47 L60 120" />
        <path d="M32 62 L88 62" />
        <path d="M22 83 C22 110 39 125 60 125 C81 125 98 110 98 83" />
      </g>
    </svg>
  );
}
