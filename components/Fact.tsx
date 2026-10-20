import { ph, isPlaceholder } from "@/lib/site";

/**
 * One business fact, rendered plain when it is real and as a marked blank
 * when it is still a PLACEHOLDER.
 *
 * Before 20 October 2026 the pages wrote `<span className="ph">{ph(v)}</span>`
 * by hand, which is right while every value is a placeholder and wrong the
 * day one stops being: the first real street address shipped in the yellow
 * dashed box that means "not real yet". The class belongs on the blank, not
 * on the fact, and this is the one place that decides.
 */
export default function Fact({ value }: { value: string }) {
  return isPlaceholder(value) ? <span className="ph">{ph(value)}</span> : <>{value}</>;
}
