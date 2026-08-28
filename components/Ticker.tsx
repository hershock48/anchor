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
  reverse = false,
  tone = "gold",
}: {
  items: React.ReactNode[];
  /** One full loop. Bigger is slower. */
  seconds: number;
  reverse?: boolean;
  tone?: "gold" | "navy";
}) {
  const run = [...items, ...items];
  return (
    <div className={`tick tick-${tone}`} aria-hidden="true">
      <div
        className={reverse ? "tick-track tick-rev" : "tick-track"}
        style={{ ["--tick-dur" as string]: `${seconds}s` }}
      >
        {run.map((item, i) => (
          <span className="tick-item" key={i}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
