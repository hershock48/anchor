/**
 * The hero mark, animated.
 *
 * glaze.md: the best effect is usually the client's own brand doing something,
 * not a generic reveal. Glazed's donut sags and drips. Hers is an anchor, so it
 * hangs and swings, the rope it hangs from flexes, and the heart beats.
 *
 * THREE THINGS ON DESYNCHRONIZED SCHEDULES. Amplitude matters less than
 * desynchronization: three things arriving 150 to 300ms apart reads as weather,
 * three arriving together reads as a slide transition. The sway, the rope and
 * the beat run at 6.2s, 5.1s and 3.4s with negative delays so they never line
 * up and the loop point is never visible.
 *
 * The swing pivots from the top of the rope, not the middle of the anchor,
 * because an anchor on a line rotates about where it is held.
 *
 * Reduced motion is handled in globals.css and degrades to the finished state,
 * not to a blank one: the anchor simply hangs still.
 */
export default function AnchorHero({
  width = 300,
  /** Defaults are for a LIGHT ground. On the navy hero pass the light values,
   *  or the anchor is navy on navy and effectively invisible. */
  ink = "var(--navy)",
  accent = "var(--brick)",
  rope = "var(--navy-3)",
}: {
  width?: number;
  ink?: string;
  accent?: string;
  rope?: string;
}) {
  const height = Math.round(width * (400 / 300));
  return (
    <svg
      className="ahero"
      width={width}
      height={height}
      viewBox="0 0 300 400"
      aria-hidden="true"
      focusable="false"
    >
      {/* the rope it hangs from */}
      <path
        className="ahero-rope"
        d="M150 0 C150 14, 150 26, 150 36"
        stroke={rope}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      <g className="ahero-swing">
        {/* heart, the ring the rope passes through */}
        <path
          className="ahero-beat"
          d="M150 118 C150 118 96 87 96 54.5 C96 34.8 111.3 19.3 130.5 19.3
             C140.5 19.3 147.3 24.5 150 31.3 C152.7 24.5 159.5 19.3 169.5 19.3
             C188.7 19.3 204 34.8 204 54.5 C204 87 150 118 150 118 Z"
          fill="none"
          stroke={accent}
          strokeWidth="25"
          strokeLinejoin="round"
        />
        <g
          fill="none"
          stroke={ink}
          strokeWidth="25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M150 132 L150 318" />
          <path d="M80 160 L220 160" />
          <path d="M55 213 C55 281, 98 318, 150 318 C202 318, 245 281, 245 213" />
        </g>
      </g>
    </svg>
  );
}
