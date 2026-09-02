/**
 * A per-instance failure counter, shared by every door on the site that a
 * script could lean on: the workroom login and the find-your-bill lookup.
 *
 * Lifted out of the login route, whose header records the measurement that
 * earned it: 30 unthrottled attempts landed in 43ms, so an ungated door is a
 * sweep, not a guess. Counters live in memory per instance, which on
 * serverless means an attacker spread across enough cold starts gets more
 * tries than the number suggests. Still worth having: it turns a fast sweep
 * into something slow, noisy and obvious. A shared store is the upgrade if a
 * door ever guards more than it does today.
 */

type Bucket = { failures: number[] };

export function limiter(name: string, opts: { windowMs: number; max: number }) {
  const g = globalThis as typeof globalThis & { __anchorLimiters?: Map<string, Map<string, Bucket>> };
  if (!g.__anchorLimiters) g.__anchorLimiters = new Map();
  if (!g.__anchorLimiters.has(name)) g.__anchorLimiters.set(name, new Map());
  const buckets = g.__anchorLimiters.get(name)!;

  const prune = (key: string) => {
    const now = Date.now();
    const b = buckets.get(key) ?? { failures: [] };
    b.failures = b.failures.filter((t) => now - t < opts.windowMs);
    buckets.set(key, b);
    return b;
  };

  return {
    /** True when this key may try again. */
    allowed(key: string): boolean {
      return prune(key).failures.length < opts.max;
    },
    retryAfterSec(): number {
      return Math.ceil(opts.windowMs / 1000);
    },
    fail(key: string): void {
      prune(key).failures.push(Date.now());
    },
    clear(key: string): void {
      buckets.delete(key);
    },
  };
}

/** The caller's address, as the platform reports it. */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip"))?.trim() || "unknown";
}
