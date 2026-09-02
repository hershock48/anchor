import { NextResponse } from "next/server";
import { setWorkroomCookie, workroomPasscode, passcodeMatches } from "@/lib/workroom/auth";
import { clientKey, limiter } from "@/lib/ratelimit";

/**
 * The workroom door, with a bouncer.
 *
 * Lifted from devine's login route. Its header records the measurement that
 * earned the limiter: 30 unthrottled attempts landed in 43ms, so an ungated
 * door is a sweep, not a guess. The counter itself now lives in
 * lib/ratelimit.ts, shared with the find-your-bill lookup.
 *
 * Five misses per ten minutes, down from ten on September 1, 2026, the day
 * the passcode minimum dropped to four characters (lib/workroom/auth.ts
 * says why).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const logins = limiter("workroom-login", { windowMs: 10 * 60 * 1000, max: 5 });

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
  if (!logins.allowed(key)) {
    return NextResponse.json(
      { error: "Too many tries. Wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(logins.retryAfterSec()) } }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { passcode?: unknown };
  if (typeof body.passcode !== "string" || !passcodeMatches(body.passcode, passcode)) {
    logins.fail(key);
    return NextResponse.json({ error: "That passcode is not right." }, { status: 401 });
  }

  logins.clear(key);
  await setWorkroomCookie(passcode);
  return NextResponse.json({ ok: true });
}
