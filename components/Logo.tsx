/**
 * The Insurance for a Cause mark.
 *
 * An anchor, because the licensed agency is Anchor Insurance and Risk
 * Management and it is already the best symbol in the category: stability,
 * holding fast, not drifting. The one change is the ring at the top, the part
 * the rope passes through, which is a heart. It is not decoration attached to
 * the side, it is the piece that connects the anchor to everything else.
 *
 * TWO CUTS, NOT ONE ARTWORK AT TWO SIZES.
 * The rope hole closes into a smudge below roughly 30px, so `solid` fills the
 * heart and keeps the mass. Pick with the `solid` prop; `Mark` decides for you
 * from the width it is given.
 *
 * NO GRADIENTS AND NO `id` ANYWHERE IN HERE, ON PURPOSE.
 * This component renders twice on most pages, header and footer. A component
 * that can render twice cannot own a fixed id: two instances sharing one has
 * painted a dark square before. Everything here is plain paths, and color comes
 * from props rather than from a referenced def, which is also what makes the
 * reversed and one-color versions work with no duplicated geometry.
 *
 * `width` and `height` are always stated. A viewBox alone gives an aspect ratio
 * but no intrinsic size, and Safari can fall back to a 150px default.
 */

type MarkProps = {
  /** Rendered width in px. Height is derived from the 120x150 viewBox. */
  width?: number;
  /** The anchor. Defaults to the navy token. */
  ink?: string;
  /** The heart. Defaults to the red token. */
  accent?: string;
  /** Force a cut. Leave unset to choose from width. */
  solid?: boolean;
  className?: string;
  /** Set when the mark is the only thing naming the site, e.g. a bare link. */
  title?: string;
};

const RATIO = 150 / 120;

export function Mark({
  width = 40,
  ink = "var(--navy)",
  accent = "var(--brick)",
  solid,
  className,
  title,
}: MarkProps) {
  const height = Math.round(width * RATIO);
  const useSolid = solid ?? width < 30;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 150"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}

      {useSolid ? (
        /* Small cut: the heart is filled and slightly larger, so the mark keeps
           its weight where the outline would collapse. */
        <path
          d="M60 47 C60 47 38 34 38 20.5 C38 12.4 44.2 6 52.1 6 C56.2 6 59 8.2 60 11 C61 8.2 63.8 6 67.9 6 C75.8 6 82 12.4 82 20.5 C82 34 60 47 60 47 Z"
          fill={accent}
        />
      ) : (
        <path
          d="M60 45 C60 45 38.5 32.5 38.5 19.5 C38.5 11.6 44.6 5.4 52.3 5.4 C56.3 5.4 59 7.5 60 10.2 C61 7.5 63.7 5.4 67.7 5.4 C75.4 5.4 81.5 11.6 81.5 19.5 C81.5 32.5 60 45 60 45 Z"
          fill="none"
          stroke={accent}
          strokeWidth={10}
          strokeLinejoin="round"
        />
      )}

      <g
        fill="none"
        stroke={ink}
        strokeWidth={useSolid ? 11.5 : 10}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Shank. Starts under the heart so the two read as joined. */}
        <path d={useSolid ? "M60 42 L60 120" : "M60 47 L60 120"} />
        {/* Stock, the crossbar. */}
        <path d="M32 62 L88 62" />
        {/* Arms. */}
        <path d="M22 83 C22 110 39 125 60 125 C81 125 98 110 98 83" />
      </g>
    </svg>
  );
}

/**
 * The full lockup. The tagline sits under the name because the client asked for
 * the promise to live in the logo itself, which also means it appears on every
 * page without having to be worked into a headline.
 */
export function Lockup({
  markWidth = 34,
  ink = "var(--navy)",
  accent = "var(--brick)",
  sub = "var(--brick)",
  compact = false,
  /** Lets the header pass an animated mark without this component needing to
   *  become a client component itself. */
  markSlot,
}: {
  markWidth?: number;
  ink?: string;
  accent?: string;
  sub?: string;
  compact?: boolean;
  markSlot?: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 11,
        lineHeight: 1,
        textDecoration: "none",
      }}
    >
      {markSlot ?? <Mark width={markWidth} ink={ink} accent={accent} />}
      <span style={{ display: "block" }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-display), sans-serif",
            fontWeight: 800,
            fontSize: compact ? 17 : 19.5,
            letterSpacing: "-0.035em",
            color: ink,
          }}
        >
          Insurance for a Cause
        </span>
        {compact ? null : (
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-mono), ui-monospace, monospace",
              fontWeight: 600,
              fontSize: 9.5,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: sub,
              marginTop: 4,
            }}
          >
            Coverage that gives back
          </span>
        )}
      </span>
    </span>
  );
}
