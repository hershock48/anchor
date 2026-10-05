/**
 * A scrolling rail.
 *
 * Two of these stack under the hero at different speeds and opposite
 * directions, which is the point: two rails at the same speed read as one
 * broken element, and two in the same direction read as a mistake. Copper does
 * the same thing with a live score board over a news crawl.
 *
 * The content is duplicated once and the track translates by exactly -50%, so
 * the loop is seamless. Duplicating three times and translating by -33.33% also
 * works and costs more DOM for no gain.
 *
 * `aria-hidden` because a screen reader reading an infinite marquee is a trap,
 * and nothing here is unavailable elsewhere on the page in a static form.
 *
 * Reduced motion stops the animation rather than hiding the rail, so the
 * content is still there and still readable, which is the un-animated state
 * being the finished state.
 */
export default function Ticker({
  items,
  seconds,
  narrowSeconds,
  wideCopies = 1,
  reverse = false,
  tone = "gold",
}: {
  items: React.ReactNode[];
  /** One full loop above 1200px. Bigger is slower. */
  seconds: number;
  /** One full loop at 1200px and below, where the extra copies are hidden.
   *  Defaults to `seconds`. */
  narrowSeconds?: number;
  /**
   * How many times the items repeat within each half of the loop ABOVE
   * 1200px. A half must be at least as wide as the screen or a gap scrolls
   * into view on every loop, and a short list is narrower than a desktop.
   * The copies after the first carry .tick-extra and are hidden at 1200px
   * and below, where the track has to stay under the 4096px layer cap that
   * lib/ticker.ts describes, so tablets and phones only ever get one copy.
   */
  wideCopies?: number;
  reverse?: boolean;
  tone?: "gold" | "navy";
}) {
  const half = Array.from({ length: wideCopies }, (_, copy) =>
    items.map((item) => ({ item, extra: copy > 0 }))
  ).flat();
  const run = [...half, ...half];
  return (
    <div className={`tick tick-${tone}`} aria-hidden="true">
      <div
        className={reverse ? "tick-track tick-rev" : "tick-track"}
        style={{
          ["--tick-dur" as string]: `${seconds}s`,
          ...(narrowSeconds ? { ["--tick-dur-narrow" as string]: `${narrowSeconds}s` } : {}),
        }}
      >
        {run.map(({ item, extra }, i) => (
          <span className={extra ? "tick-item tick-extra" : "tick-item"} key={i}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
