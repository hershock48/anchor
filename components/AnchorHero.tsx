import { ANCHOR_VIEWBOX, AP, AnchorBody } from "./Logo";

/**
 * The hero mark, animated. THE WATER IS THE MOTION, inside the real ribbons.
 *
 * The geometry is the traced client logo, imported from Logo.tsx. The
 * animation never redraws her ribbons: each gold ribbon becomes a clipPath,
 * and inside it a set of long periodic shimmer strokes translates one period
 * and loops, so the water visibly flows through the exact shapes she drew.
 * The whole anchor rocks 1.5 degrees, the way a held anchor does in moving
 * water. Periods and speeds share no common multiple, so the composition
 * never visibly repeats.
 *
 * THIS FILE OWNS ids ("ahClipLight", "ahClipDark"), WHICH Mark IS NOT
 * ALLOWED TO DO. The no-id rule exists because Mark renders twice per page;
 * AnchorHero renders once, in the hero. Do not put a second one on a page.
 *
 * WIDTH BUDGET. The animated layers are the shimmer strokes: 720 user units
 * wide, rendered at most ~1.05x scale, far under the ~4096px mobile
 * compositing cap (see lib/ticker.ts).
 *
 * Reduced motion is handled in globals.css and degrades to the finished
 * state: the logo, still and complete.
 */
export default function AnchorHero({
  width = 300,
  ink = "var(--navy)",
  gap = "var(--navy)",
  accent = "var(--gold-light)",
  accentDeep = "var(--gold)",
}: {
  width?: number;
  ink?: string;
  /** The slit color: pass the hero's background so the slits read as ground. */
  gap?: string;
  accent?: string;
  accentDeep?: string;
}) {
  const height = Math.round(width * (442 / 390));
  // One shimmer period is 120 user units; globals.css translates by exactly
  // that. Strokes span two extra periods left so the loop never uncovers.
  const shimmer = (y: number, amp: number) =>
    `M-120 ${y} q 30 ${-amp} 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`;

  return (
    <svg
      className="ahero"
      width={width}
      height={height}
      viewBox={ANCHOR_VIEWBOX}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="ahClipLight">
          <path d={AP.goldLight} />
        </clipPath>
        <clipPath id="ahClipDark">
          <path d={AP.goldDark} />
        </clipPath>
      </defs>

      <g className="ahero-rock">
        <AnchorBody ink={ink} gap={gap} />

        {/* the light ribbon, with water moving through it */}
        <g clipPath="url(#ahClipLight)">
          <path fill={accent} d={AP.goldLight} />
          <g fill="none" strokeLinecap="round" opacity="0.55">
            <path className="ahero-w1" d={shimmer(452, 7)} stroke={accentDeep} strokeWidth="5" />
            <path className="ahero-w2" d={shimmer(468, 6)} stroke={accentDeep} strokeWidth="3.5" />
          </g>
        </g>

        {/* the dark ribbon */}
        <g clipPath="url(#ahClipDark)">
          <path fill={accentDeep} d={AP.goldDark} />
          <g fill="none" strokeLinecap="round" opacity="0.5">
            <path className="ahero-w3" d={shimmer(492, 6)} stroke={accent} strokeWidth="4" />
          </g>
        </g>
      </g>
    </svg>
  );
}
