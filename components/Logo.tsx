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
 * TWO FILES, ONE ARTWORK. The original is navy-on-light. The reversed cut
 * (anchor-mark-reverse.png) is for dark grounds and is made by RECOLORING her
 * pixels, navy to white with the gold untouched, never by redrawing; the
 * slits let the ground show through, which is what a real reversed logo does.
 * Never place the navy original on a dark ground (it vanishes) and never
 * place the reversed cut on a light one.
 *
 * The source is a phone-screenshot JPEG, 380x450 at the crop. It is sharp at
 * every size the site uses (largest render is ~260px). If the client's
 * original vector or high-res file ever lands, re-key from that and nothing
 * else changes; print work will need it.
 */

export const MARK_RATIO = 450 / 380;
export const MARK_SRC = "/brand/anchor-mark.png";
export const MARK_REVERSE_SRC = "/brand/anchor-mark-reverse.png";

type MarkProps = {
  /** Rendered width in px. Height derives from the artwork's ratio. */
  width?: number;
  /** Use the reversed cut. REQUIRED on dark grounds; see above. */
  reverse?: boolean;
  className?: string;
  /** Set when the mark is the only thing naming the site, e.g. a bare link. */
  title?: string;
};

export function Mark({ width = 40, reverse = false, className, title }: MarkProps) {
  const height = Math.round(width * MARK_RATIO);
  return (
    // Plain <img>: the asset is a static file in /public and the render sizes
    // are fixed, so next/image would only add indirection.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={reverse ? MARK_REVERSE_SRC : MARK_SRC}
      width={width}
      height={height}
      alt={title ?? ""}
      className={className}
      style={{ display: "block" }}
    />
  );
}

/**
 * THE WORDMARK: lowercase "anchor" in the headline face, with the trade
 * beside it in the mono.
 *
 * It replaced a lockup set the way the client's logo file sets it: the name
 * in Cinzel capitals (the free face closest to Trajan), widely tracked, over
 * a thin gold rule, with "AND RISK MANAGEMENT" in small spaced capitals
 * underneath. Kevin, 29 September 2026: it "looks sort of like a legal office
 * and not a fun gen z branded insurance office." He was right, and it was
 * four things at once. Inscriptional Roman capitals are the house face of law
 * firms and banks. Wide letterspacing is how a firm says it is old. A
 * hairline between two lines of type is a letterhead device. And the second
 * line read like "& Associates".
 *
 * Four options were rendered beside her real mark and Kevin picked this one,
 * without the coral full stop the render carried. It uses Archivo, the face
 * every headline on the site already uses, so the logo matches the page
 * under it and Cinzel is no longer loaded at all.
 *
 * HER ANCHOR IS UNTOUCHED. The drawing was never the problem.
 *
 * THIS DEPARTS FROM HER LOGO FILE, her cards and her signage, which still set
 * the name in capitals. That is a decision about her identity and it is hers
 * to approve; as of this commit it is Kevin's pick on a spec build.
 *
 * THE LEGAL NAME IS NOT IN THE WORDMARK ANY MORE. "Anchor Insurance and Risk
 * Management" is the licensed name and it is written out in the footer
 * (Footer.tsx, from site.legalName), which is where a license line belongs.
 */
export function Wordmark({
  ink = "var(--navy)",
  sub = "var(--slate)",
  compact = false,
}: {
  ink?: string;
  /** The trade label. 6.62 on paper as slate; pass a light value on navy. */
  sub?: string;
  compact?: boolean;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: compact ? 8 : 10, lineHeight: 1 }}>
      <span
        style={{
          fontFamily: "var(--font-display), -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: compact ? 23 : 29,
          letterSpacing: "-0.05em",
          color: ink,
          whiteSpace: "nowrap",
        }}
      >
        anchor
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontWeight: 600,
          fontSize: compact ? 9.5 : 10.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: sub,
          whiteSpace: "nowrap",
          /* The mono sits on the heavy word's x-height, not its baseline:
             centered, it floats; on the baseline, it sags under the bowl. */
          paddingTop: compact ? 7 : 9,
        }}
      >
        insurance
      </span>
    </span>
  );
}

export function Lockup({
  markWidth = 34,
  ink = "var(--navy)",
  sub = "var(--slate)",
  compact = false,
  /** Lets a caller pass a custom mark without this component changing. */
  markSlot,
}: {
  markWidth?: number;
  ink?: string;
  sub?: string;
  compact?: boolean;
  markSlot?: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        lineHeight: 1,
        textDecoration: "none",
      }}
    >
      {markSlot ?? <Mark width={markWidth} />}
      <Wordmark ink={ink} sub={sub} compact={compact} />
    </span>
  );
}
