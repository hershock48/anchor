import { NextResponse } from "next/server";
import { setWorkroomCookie, workroomPasscode, passcodeMatches } from "@/lib/workroom/auth";

/**
 * The workroom door, with a bouncer.
 *
 * Lifted from devine's login route, rate limiter and all. Its header records
 * the measurement that earned it: 30 unthrottled attempts landed in 43ms, so
 * an ungated door is a sweep, not a guess.
 *
 * The counter is per instance and in memory, which on serverless means an
 * attacker spread across enough cold starts gets more attempts than the number
 * below suggests. That is a real limit and it is still worth having: it turns
 * a fast sweep into something slow, noisy and obvious. A shared store is the
 * upgrade if this ever guards more than a leads queue.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
// Five, down from ten on September 1, 2026, the day the passcode minimum
// dropped to four characters (lib/workroom/auth.ts says why).
const MAX_FAILURES = 5;

type Bucket = { failures: number[] };
function buckets(): Map<string, Bucket> {
  const g = globalThis as typeof globalThis & { __anchorLoginBuckets?: Map<string, Bucket> };
  if (!g.__anchorLoginBuckets) g.__anchorLoginBuckets = new Map();
  return g.__anchorLoginBuckets;
}

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip"))?.trim() || "unknown";
}

export async function POST(req: Request) {
  const passcode = workroomPasscode();
  if (passcode === null) {
    // Unset (or too short) in production is a closed door, not an open one.
    // Say so plainly: this is the operator's problem to fix and nobody
    // else's to work around.
    return NextResponse.json(
      { error: "The workroom is not set up on this deployment yet.", reason: "unconfigured" },
      { status: 503 }
    );
  }

  const key = clientKey(req);
  const now = Date.now();
  const bucket = buckets().get(key) ?? { failures: [] };
  bucket.failures = bucket.failures.filter((t) => now - t < WINDOW_MS);
  if (bucket.failures.length >= MAX_FAILURES) {
    buckets().set(key, bucket);
    return NextResponse.json(
      { error: "Too many tries. Wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(WINDOW_MS / 1000)) } }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { passcode?: unknown };
  if (typeof body.passcode !== "string" || !passcodeMatches(body.passcode, passcode)) {
    bucket.failures.push(now);
    buckets().set(key, bucket);
    return NextResponse.json({ error: "That passcode is not right." }, { status: 401 });
  }

  buckets().delete(key);
  await setWorkroomCookie(passcode);
  return NextResponse.json({ ok: true });
}
