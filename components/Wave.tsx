/**
 * The band divider.
 *
 * Glazed's homepage separates every band with the drip edge from its own logo:
 * a brand element doing structural work rather than a generic rule. This is the
 * same idea in her brand. The mark is an anchor, so the edge is water.
 *
 * Not a smooth sine wave. Real water has uneven crests, and an even one reads as
 * a decorative divider rather than as part of the identity. The crests here are
 * deliberately different heights and spacings.
 *
 * `preserveAspectRatio="none"` so it stretches to any width, exactly as the drip
 * does. Width and height are stated because a viewBox alone gives an aspect
 * ratio and no intrinsic size, and Safari falls back to 150px.
 */
export default function Wave({
  fill,
  bg,
  flip = false,
}: {
  /** The color of the band BELOW the wave. */
  fill: string;
  /** The color of the band ABOVE it. */
  bg: string;
  flip?: boolean;
}) {
  return (
    <svg
      className="wave"
      width="1440"
      height="52"
      viewBox="0 0 1440 52"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={{ background: bg, transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M0 24 C 90 6, 168 40, 262 30 C 356 20, 402 2, 508 14 C 614 26, 660 46, 762 38
           C 864 30, 918 8, 1024 18 C 1130 28, 1178 44, 1272 34 C 1366 24, 1400 10, 1440 16
           L1440 52 L0 52 Z"
        fill={fill}
      />
    </svg>
  );
}
