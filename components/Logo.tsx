/**
 * The Anchor Insurance mark: THE CLIENT'S LOGO, TRACED, NOT APPROXIMATED.
 *
 * The first cut of this file after the logo arrived was a simplified generic
 * anchor, and Kevin rejected it on sight, which is the "it's not MY donut"
 * failure from glaze.md happening again. This version was traced from the
 * supplied artwork (Downloads/IMG_6500.jpg) with a measured overlay-diff
 * harness: the image thresholded into navy/gold masks, landmark rows
 * extracted, and the paths iterated on top of the real image until they
 * aligned. Every distinctive part is here: the double-outlined ring with its
 * inner highlight, the twin-bar shank with the center slit running its full
 * length, the tapered stock arms with slit capsule caps, the sail fluke with
 * its inner slit and double barb, the swoosh-arrow fluke, the under-blade
 * crescent, the crown blade with its slit and bottom point, and the two gold
 * ribbons flowing in front of the shank.
 *
 * The source is a phone-screenshot JPEG, so this trace is faithful to about
 * a pixel of JPEG fuzz. If the client's original vector file ever lands,
 * lift its paths verbatim and retire this trace.
 *
 * THE SLITS ARE DRAWN IN A `gap` COLOR, NOT CUT OUT. On light grounds the
 * default near-white reads as the paper showing through. On a dark ground
 * pass the ground's color as `gap`, or the slits glow white.
 *
 * TWO CUTS. The full cut's slits and thin ribbons smear below roughly 30px,
 * so the small cut drops every slit, merges the stock, and carries one
 * heavier gold band. Pick with `solid`; `Mark` decides from its width.
 *
 * NO ids ANYWHERE IN HERE (this component renders twice per page); the
 * geometry is exported so AnchorHero, which owns ids and renders once, can
 * reuse it without redrawing.
 */

/** Shared geometry, in the traced coordinate space. */
export const ANCHOR_VIEWBOX = "120 170 390 442";
export const ANCHOR_RATIO = 442 / 390;

export const AP = {
  ringDonut:
    "M310 181.5 A43.5 43.5 0 1 1 309.9 181.5 Z M310 204 A21 21 0 1 0 310.1 204 Z",
  ringHighlight: "M281 240 A33 33 0 1 1 339 240",
  shankL: "M292 250 C294 258 292 264 291 270 L286 470 L308 472 L308 252 Z",
  shankR: "M328 250 C326 258 328 264 328 270 L332 470 L314 472 L314 252 Z",
  barL: "M308 283 L277 288 L237 300 L237 320 L308 327 Z",
  barR: "M314 283 L345 288 L383 300 L383 320 L314 327 Z",
  barSlitL: "M246 306 L302 307",
  barSlitR: "M374 306 L318 307",
  capSlitL: "M221 287 L221 322",
  capSlitR: "M399 287 L399 322",
  sail:
    "M150 400 C165 419 180 440 191 456 L182 464 L191 471 L179 476 L186 483 C170 484 152 480 141 472 C135 449 140 422 150 400 Z",
  sailSlit: "M151 426 C154 443 160 458 168 469",
  crescent:
    "M130 474 C155 486 195 492 235 494 C253 495 268 496 280 498 C262 510 228 514 196 511 C168 508 146 498 134 487 C131 483 129 478 130 474 Z",
  swoosh:
    "M380 548 C410 531 436 507 450 480 C454 472 457 464 458 457 L441 452 C436 472 425 493 409 512 C399 524 389 536 380 548 Z",
  arrowA:
    "M471 397 C476 414 480 431 483 450 C471 452 459 456 448 462 C452 440 460 417 471 397 Z",
  arrowB:
    "M471 397 C459 407 448 421 440 437 L433 452 L446 458 C452 438 460 416 471 397 Z",
  arrowBarb: "M449 465 L478 466 L456 484 Z",
  crown:
    "M172 512 C220 524 265 515 300 507 C318 503 332 507 348 514 C375 524 402 514 421 497 C433 532 415 561 384 574 C352 588 327 591 310 602 C291 584 255 570 224 553 C202 541 182 528 172 512 Z",
  crownSlit: "M225 534 C280 540 340 542 412 510",
  goldLight:
    "M196 468 C232 466 272 458 306 449 C338 440 368 435 396 432 C408 431 418 429 426 427 C419 443 402 456 378 464 C342 476 292 481 254 477 C232 474 212 472 196 468 Z",
  goldDark:
    "M262 486 C300 497 344 499 380 491 C398 486 412 478 424 467 C421 486 406 499 384 506 C344 517 296 507 262 486 Z",
} as const;

/** The navy body of the full cut, minus slits. Shared with HeaderMark. */
export function AnchorBody({ ink, gap }: { ink: string; gap: string }) {
  return (
    <>
      <path fillRule="evenodd" fill={ink} d={AP.ringDonut} />
      <path d={AP.ringHighlight} stroke={gap} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path fill={ink} d={AP.shankL} />
      <path fill={ink} d={AP.shankR} />
      <path fill={ink} d={AP.barL} />
      <path fill={ink} d={AP.barR} />
      <path d={AP.barSlitL} stroke={gap} strokeWidth="3" fill="none" />
      <path d={AP.barSlitR} stroke={gap} strokeWidth="3" fill="none" />
      <rect x="202" y="279" width="31" height="51" rx="14" fill={ink} />
      <rect x="387" y="279" width="31" height="51" rx="14" fill={ink} />
      <path d={AP.capSlitL} stroke={gap} strokeWidth="3.5" fill="none" />
      <path d={AP.capSlitR} stroke={gap} strokeWidth="3.5" fill="none" />
      <path fill={ink} d={AP.sail} />
      <path d={AP.sailSlit} stroke={gap} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path fill={ink} d={AP.crescent} />
      <path fill={ink} d={AP.swoosh} />
      <path fill={ink} d={AP.arrowA} />
      <path fill={ink} d={AP.arrowB} />
      <path fill={ink} d={AP.arrowBarb} />
      <path fill={ink} d={AP.crown} />
      <path d={AP.crownSlit} stroke={gap} strokeWidth="5.5" fill="none" strokeLinecap="round" />
    </>
  );
}

type MarkProps = {
  /** Rendered width in px. Height derives from the traced viewBox. */
  width?: number;
  /** The anchor. Defaults to the navy token. */
  ink?: string;
  /** The upper (lighter) gold ribbon. */
  accent?: string;
  /** The lower (richer) gold ribbon. */
  accentDeep?: string;
  /** What the slits are drawn in. On a dark ground pass the ground's color. */
  gap?: string;
  /** Force a cut. Leave unset to choose from width. */
  solid?: boolean;
  className?: string;
  /** Set when the mark is the only thing naming the site, e.g. a bare link. */
  title?: string;
};

export function Mark({
  width = 40,
  ink = "var(--navy)",
  accent = "var(--gold-light)",
  accentDeep = "var(--gold)",
  gap = "var(--paper)",
  solid,
  className,
  title,
}: MarkProps) {
  const height = Math.round(width * ANCHOR_RATIO);
  const useSolid = solid ?? width < 30;

  return (
    <svg
      width={width}
      height={height}
      viewBox={ANCHOR_VIEWBOX}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}

      {useSolid ? (
        <>
          {/* The small cut: same silhouette, no slits, one heavy gold band. */}
          <circle cx="310" cy="223" r="38" fill="none" stroke={ink} strokeWidth="23" />
          <path fill={ink} d="M298 252 L322 252 L331 470 L289 470 Z" />
          <path fill={ink} d="M230 294 L390 294 L390 324 L230 324 Z" />
          <rect x="196" y="276" width="40" height="56" rx="16" fill={ink} />
          <rect x="384" y="276" width="40" height="56" rx="16" fill={ink} />
          <path
            fill={ink}
            d="M148 398 C166 420 182 443 194 460 L186 484 C166 486 148 480 138 470 C133 447 138 420 148 398 Z"
          />
          <path
            fill={ink}
            d="M375 550 C408 530 436 504 452 474 L436 462 C428 486 412 512 392 532 Z"
          />
          <path fill={ink} d="M472 394 C478 416 483 436 485 456 L446 466 C452 440 460 414 472 394 Z" />
          <path fill={ink} d="M446 468 L480 468 L454 490 Z" />
          <path fill={ink} d={AP.crown} />
          <path fill={ink} d={AP.crescent} />
          <path
            fill={accentDeep}
            d="M190 470 C240 462 300 448 360 440 C390 436 412 432 428 426 C420 448 398 462 368 472 C320 486 250 486 190 470 Z"
          />
        </>
      ) : (
        <>
          <AnchorBody ink={ink} gap={gap} />
          {/* the water, in front of everything */}
          <path fill={accent} d={AP.goldLight} />
          <path fill={accentDeep} d={AP.goldDark} />
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
