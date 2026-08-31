/**
 * The Anchor Insurance mark: THE CLIENT'S ARTWORK, USED AS-IS.
 *
 * Two vector recreations of her logo shipped and died here: a simplified
 * generic anchor (rejected on sight) and then a faithful trace (still not the
 * thing). The client's call, August 31, 2026: use the logo they have. So the
 * mark is now the supplied artwork itself, cropped from the file she sent
 * (Downloads/IMG_6500.jpg) with the white background keyed to alpha, shipped
 * as /brand/anchor-mark.png. Do not redraw it, do not "clean it up", do not
 * trace it again.
 *
 * THE ARTWORK IS NAVY-ON-LIGHT AND THAT IS THE ONLY VERSION THAT EXISTS.
 * There is no reversed cut and no one-color cut. On any dark ground the mark
 * sits on a paper plate (`plate` prop), the way a real sign does. Never place
 * the bare transparent PNG on navy: the anchor disappears and the keyed edge
 * halos.
 *
 * The source is a phone-screenshot JPEG, 380x450 at the crop. It is sharp at
 * every size the site uses (largest render is ~260px). If the client's
 * original vector or high-res file ever lands, re-key from that and nothing
 * else changes; print work will need it.
 */

export const MARK_RATIO = 450 / 380;
export const MARK_SRC = "/brand/anchor-mark.png";

type MarkProps = {
  /** Rendered width in px. Height derives from the artwork's ratio. */
  width?: number;
  /** Wrap in a paper plate. REQUIRED on dark grounds; see above. */
  plate?: boolean;
  className?: string;
  /** Set when the mark is the only thing naming the site, e.g. a bare link. */
  title?: string;
};

export function Mark({ width = 40, plate = false, className, title }: MarkProps) {
  const height = Math.round(width * MARK_RATIO);
  const img = (
    // Plain <img>: the asset is a static file in /public and the render sizes
    // are fixed, so next/image would only add indirection.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MARK_SRC}
      width={width}
      height={height}
      alt={title ?? ""}
      className={className}
      style={{ display: "block" }}
    />
  );
  return plate ? <span className="mark-plate">{img}</span> : img;
}

/**
 * The full lockup, set the way the client's logo sets it: the name in serif
 * capitals, a gold rule, and the rest of the legal name under it. Cinzel via
 * `--font-brand` because the logo's wordmark is Trajan-style capitals and
 * Cinzel is the free face closest to it; it is loaded in app/layout.tsx and
 * used nowhere else, so the serif stays a brand voice rather than becoming a
 * heading font.
 */
export function Lockup({
  markWidth = 34,
  ink = "var(--navy)",
  accent = "var(--gold)",
  sub = "var(--slate)",
  compact = false,
  /** Lets a caller pass a custom mark without this component changing. */
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
      {markSlot ?? <Mark width={markWidth} />}
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
