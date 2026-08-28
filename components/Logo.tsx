/**
 * The Anchor Insurance mark, drawn from the client's own logo.
 *
 * THE CLIENT BROUGHT A REAL LOGO ON AUGUST 28, 2026: a navy anchor with a
 * ring, a knobbed stock, barbed flukes, and a gold wave flowing across the
 * middle. This is that logo redrawn as clean vector geometry, per the glaze
 * rule to lift the real thing: proportions and parts match the supplied
 * artwork, with the linework regularized so it survives small sizes. The
 * heart-ring mark this build launched with predates the real logo and is
 * retired; it lives in git history before this date.
 *
 * THE WAVE IS DRAWN LAST so it passes in front of the shank, which is the
 * whole gesture of the original. In AnchorHero the same three ribbons are the
 * ones that move.
 *
 * TWO CUTS, NOT ONE ARTWORK AT TWO SIZES.
 * Below roughly 30px the three ribbons close into a smear and the thin stock
 * disappears, so the small cut carries one heavier wave, thicker strokes and
 * plain triangle flukes. Pick with the `solid` prop; `Mark` decides for you
 * from the width it is given.
 *
 * NO GRADIENTS AND NO `id` ANYWHERE IN HERE, ON PURPOSE.
 * This component renders twice on most pages, header and footer. A component
 * that can render twice cannot own a fixed id: two instances sharing one has
 * painted a dark square before. Everything here is plain paths, and color
 * comes from props, which is also how the reversed and one-color versions
 * work with no duplicated geometry.
 *
 * `width` and `height` are always stated. A viewBox alone gives an aspect
 * ratio but no intrinsic size, and Safari can fall back to a 150px default.
 */

type MarkProps = {
  /** Rendered width in px. Height is derived from the 120x150 viewBox. */
  width?: number;
  /** The anchor. Defaults to the navy token. */
  ink?: string;
  /** The wave. Defaults to the gold token. */
  accent?: string;
  /** The middle ribbon. Defaults to the deeper gold; pass the same value as
   *  `accent` for a flat one-accent version. */
  accentDeep?: string;
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
  accent = "var(--gold)",
  accentDeep = "var(--gold-deep)",
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
        <>
          <circle cx="60" cy="20" r="10.5" fill="none" stroke={ink} strokeWidth="9" />
          <g fill="none" stroke={ink} strokeWidth="13" strokeLinecap="round">
            <path d="M60 34 L60 114" />
            <path d="M28 54 L92 54" strokeWidth="11" />
            <path d="M16 84 C20 111 37 126 60 126 C83 126 100 111 104 84" />
          </g>
          <path d="M7 95 L15 60 L32 87 Z" fill={ink} />
          <path d="M113 95 L105 60 L88 87 Z" fill={ink} />
          <path
            d="M6 94 C24 80 42 80 58 91 C74 102 92 102 114 86"
            stroke={accent}
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <circle cx="60" cy="19.5" r="10" fill="none" stroke={ink} strokeWidth="7.5" />
          <path d="M60 32 L60 116" stroke={ink} strokeWidth="10.5" strokeLinecap="round" fill="none" />
          <path d="M28 51 L92 51" stroke={ink} strokeWidth="9" strokeLinecap="round" fill="none" />
          <circle cx="26" cy="51" r="6.2" fill={ink} />
          <circle cx="94" cy="51" r="6.2" fill={ink} />
          <path
            d="M17 86 C21 112 37 127 60 127 C83 127 99 112 103 86"
            stroke={ink}
            strokeWidth="10.5"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M8 94 L15 62 L30 87 Q19 82 8 94 Z" fill={ink} />
          <path d="M112 94 L105 62 L90 87 Q101 82 112 94 Z" fill={ink} />
          {/* the water, in front of everything */}
          <path
            d="M6 90 C22 76 40 76 57 88 C74 100 92 100 114 84"
            stroke={accent}
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M10 103 C26 91 44 91 60 101 C76 111 92 111 110 97"
            stroke={accentDeep}
            strokeWidth="6.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M22 114 C36 105 52 105 65 111 C77 117 90 117 102 110"
            stroke={accent}
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}

/**
 * The full lockup, set the way the client's logo sets it: the name in serif
 * capitals, a gold rule, and the rest of the legal name under it. Cinzel via
 * `--font-brand` because the logo's wordmark is Trajan-style capitals and
 * Cinzel is the free face closest to it; it is loaded in app/layout.tsx and
 * used nowhere else, so the serif stays a brand voice rather than becoming a
 * heading font.
 *
 * The strings are literals rather than reads from lib/site.ts because this is
 * artwork, not copy: the sizes and tracking are tuned to these exact words.
 */
export function Lockup({
  markWidth = 34,
  ink = "var(--navy)",
  accent = "var(--gold)",
  sub = "var(--slate)",
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
      {markSlot ?? <Mark width={markWidth} ink={ink} />}
      <span style={{ display: "block" }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-brand), Georgia, serif",
            fontWeight: 700,
            fontSize: compact ? 14.5 : 16.5,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: ink,
            whiteSpace: "nowrap",
          }}
        >
          Anchor Insurance
        </span>
        {compact ? null : (
          <>
            <span
              style={{
                display: "block",
                height: 2,
                background: accent,
                margin: "5px 0 4px",
              }}
              aria-hidden="true"
            />
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-brand), Georgia, serif",
                fontWeight: 600,
                fontSize: 8.5,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: sub,
                whiteSpace: "nowrap",
              }}
            >
              And Risk Management
            </span>
          </>
        )}
      </span>
    </span>
  );
}
