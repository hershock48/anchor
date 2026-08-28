/**
 * The hero mark, animated. THE WATER IS THE MOTION.
 *
 * glaze.md: the best effect is usually the client's own brand doing
 * something. Her logo is an anchor with a gold wave flowing across it, so
 * here the wave actually flows. The anchor itself only rocks, slowly, the
 * way a held anchor does in moving water.
 *
 * HOW THE FLOW WORKS. Each ribbon is a periodic sine-like path two full
 * periods longer than the frame (period 270 user units, drawn from -540),
 * animated by translating exactly one period and looping. The loop point is
 * therefore invisible. The ribbons run at 9s, 12.5s and 7s with negative
 * delays, and the rock at 7.5s: nothing is a multiple of anything, so the
 * composition never visibly repeats. Desynchronization over amplitude.
 *
 * A gradient mask fades the ribbons out near the frame edges so the moving
 * water dissolves instead of being cut off flat.
 *
 * THIS FILE OWNS TWO ids ("aheroFadeG", "aheroFade"), WHICH THE STATIC MARK
 * IS NOT ALLOWED TO DO. The rule against ids exists because Mark renders
 * twice per page. AnchorHero renders in the hero only, once per page, same as
 * the old AnimatedMark pattern. Do not put a second one on a page.
 *
 * WIDTH BUDGET. The animated layers are the ribbon paths: 1080 user units,
 * rendered at 300px wide, so about 1080px per layer, and about 774px at the
 * 215px mobile size. Both are far under the ~4096px point where mobile GPUs
 * stop compositing an animated layer (see lib/ticker.ts). Re-check this if
 * you lengthen the paths.
 *
 * Reduced motion is handled in globals.css and degrades to the finished
 * state: the anchor sits still with the water drawn in full.
 */
export default function AnchorHero({
  width = 300,
  /** Defaults are for a LIGHT ground. On the navy hero pass the light values,
   *  or the anchor is navy on navy and effectively invisible. */
  ink = "var(--navy)",
  accent = "var(--gold)",
  accentDeep = "var(--gold-deep)",
}: {
  width?: number;
  ink?: string;
  accent?: string;
  accentDeep?: string;
}) {
  const height = Math.round(width * (400 / 300));
  // One ribbon period. The animation in globals.css translates by exactly
  // this many user units; if it changes, change aheroFlow with it.
  const wave = (y: number, amp: number) =>
    `M-540 ${y} q 67.5 ${-amp} 135 0 t 135 0 t 135 0 t 135 0 t 135 0 t 135 0 t 135 0 t 135 0`;

  return (
    <svg
      className="ahero"
      width={width}
      height={height}
      viewBox="0 0 300 400"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="aheroFadeG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.1" stopColor="#fff" />
          <stop offset="0.9" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="aheroFade" maskUnits="userSpaceOnUse" x="0" y="160" width="300" height="155">
          <rect x="0" y="160" width="300" height="155" fill="url(#aheroFadeG)" />
        </mask>
      </defs>

      <g className="ahero-rock">
        <g fill="none" stroke={ink}>
          <circle cx="150" cy="49" r="25" strokeWidth="18.5" />
          <g strokeWidth="26" strokeLinecap="round">
            <path d="M150 80 L150 290" />
            <path d="M70 127.5 L230 127.5" strokeWidth="22.5" />
            <path d="M42.5 215 C52.5 280 92.5 317.5 150 317.5 C207.5 317.5 247.5 280 257.5 215" />
          </g>
          <g fill={ink} stroke="none">
            <circle cx="65" cy="127.5" r="15.5" />
            <circle cx="235" cy="127.5" r="15.5" />
            <path d="M20 235 L37.5 155 L75 217.5 Q47.5 205 20 235 Z" />
            <path d="M280 235 L262.5 155 L225 217.5 Q252.5 205 280 235 Z" />
          </g>
        </g>

        <g mask="url(#aheroFade)" fill="none" strokeLinecap="round">
          <path className="ahero-w1" d={wave(220, 34)} stroke={accent} strokeWidth="22.5" />
          {/* Negative amplitude flips the phase, so the middle ribbon crests
              where the others trough. */}
          <path className="ahero-w2" d={wave(254, -27)} stroke={accentDeep} strokeWidth="16" />
          <path className="ahero-w3" d={wave(283, 20)} stroke={accent} strokeWidth="11" />
        </g>
      </g>
    </svg>
  );
}
