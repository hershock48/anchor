import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * The workroom door.
 *
 * Ported from devine's `lib/workroom/auth.ts` with two deliberate changes,
 * both because of WHAT IS BEHIND THE DOOR HERE.
 *
 * Devine's gate gets a four digit PIN, and that is right for its job: a shared
 * screen behind a flower counter, where a password nobody remembers mid-rush
 * gets written on the wall. This workroom is not that. It is one owner on her
 * own phone, and behind it sit quote requests carrying a customer's name,
 * phone, email, street address and current carrier. So:
 *
 *   1. A PASSCODE, not a PIN. Minimum length enforced below, because a short
 *      one on the public internet is 10,000 guesses and the rate limiter only
 *      makes that slow, not impossible.
 *   2. THE COOKIE DOES NOT CARRY THE SECRET. Devine stores the PIN itself as
 *      the cookie value, so a leaked cookie is a leaked PIN. Here the cookie
 *      carries a hash of it: a stolen cookie still opens the door until it
 *      expires, but it never hands over the passcode itself, which is the one
 *      thing that outlives the session and is probably reused elsewhere.
 *
 * What devine got right and is kept exactly: an unset variable in production
 * CLOSES the door rather than fitting a known lock. Devine's fallback was the
 * shop's own published phone number, so a deployed workroom with the variable
 * unset guarded every customer's details behind a number printed in the
 * footer. The fallback here is dev-only and is not a real-world string.
 *
 * This is still a gate, not a vault. Nothing behind it can charge a card or
 * move money: the leads queue reads, the payments screen reads. If a screen
 * ever gains a refund button, it needs a real login before it ships.
 */

const COOKIE = "anchor_workroom";
/** Local development only. See workroomPasscode(). */
const DEV_FALLBACK = "workroom-dev";
const MIN_LENGTH = 8;

/** The passcode, or null meaning "this deployment has no workroom". */
export function workroomPasscode(): string | null {
  const set = process.env.WORKROOM_PASSCODE?.trim();
  if (set) {
    if (set.length < MIN_LENGTH) {
      // Loud to the operator, closed to everyone else. A too-short passcode is
      // a misconfiguration, and quietly accepting it is how a four character
      // password ends up guarding a customer list.
      console.error(
        `[workroom] WORKROOM_PASSCODE is shorter than ${MIN_LENGTH} characters, so the workroom is closed. Set a longer one.`
      );
      return null;
    }
    return set;
  }
  return process.env.NODE_ENV === "production" ? null : DEV_FALLBACK;
}

/** What the cookie carries: a hash of the passcode, never the passcode. */
function token(passcode: string): string {
  return createHash("sha256").update(`anchor-workroom-v1:${passcode}`).digest("hex");
}

/** Constant time, so a wrong guess cannot be timed character by character. */
export function passcodeMatches(candidate: string, passcode: string): boolean {
  const a = Buffer.from(token(candidate));
  const b = Buffer.from(token(passcode));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isWorkroomAuthed(): Promise<boolean> {
  const passcode = workroomPasscode();
  if (passcode === null) return false;
  const jar = await cookies();
  const got = jar.get(COOKIE)?.value;
  if (!got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(token(passcode));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setWorkroomCookie(passcode: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, token(passcode), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // A working day and the evening after it. Long enough that she is not
    // retyping it between calls, short enough that a borrowed laptop forgets.
    maxAge: 60 * 60 * 18,
    path: "/",
  });
}

export async function clearWorkroomCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}
