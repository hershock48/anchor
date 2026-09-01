import { NextResponse } from "next/server";
import { getStore, newId, type Lead } from "@/lib/workroom/store";

export const runtime = "nodejs";
/** A page or handler whose behavior depends on the request cannot be cached. */
export const dynamic = "force-dynamic";

/**
 * Quote requests.
 *
 * THERE IS NO CONFIRMED INBOX YET, AND THIS HANDLER IS HONEST ABOUT THAT.
 *
 * The rule from glaze.md: a form needs a real destination and a confirmed
 * inbox, and those are two separate things. Until both exist, the acceptable
 * behavior is to accept the submission, tell the visitor the truth, and write
 * the whole payload to the log so nothing is lost. What is not acceptable is a
 * stub that waits half a second and says "Thanks, we got it" while sending
 * nowhere.
 *
 * So: every submission is logged in full and always succeeds for the visitor.
 * Delivery is the missing piece and it is the operator's problem to see in the
 * Vercel log, not the visitor's problem to discover from a silent failure.
 *
 * THE SEAM: set QUOTE_TO and the SMTP_* variables in the Vercel dashboard and
 * fill in `deliver()` below. SMTP through a mailbox the client already owns,
 * not a hosted API with its own subscription. See .env.example.
 *
 * PII: this payload carries a name, a phone number, an address and possibly a
 * date of birth. It is logged rather than stored, nothing is written to a
 * database, and no third party sees it. When delivery is wired up it goes to
 * one mailbox and stops there. That is also what /privacy says, and the two
 * have to keep agreeing.
 */

const FIELDS = [
  "line",
  "name",
  "phone",
  "email",
  "zip",
  "about",
  "consent",
  // step two, all optional
  "address",
  "current_carrier",
  "renewal",
  "notes",
] as const;

function clean(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim().slice(0, 2000) : "";
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Honeypot. A real person never fills this; it is off-screen and labelled.
  if (clean(form.get("company"))) {
    // Silently accept so a bot learns nothing, but do not log or deliver.
    return respond(req, true);
  }

  const payload: Record<string, string> = {};
  for (const f of FIELDS) payload[f] = clean(form.get(f));

  const missing = ["name", "phone", "zip"].filter((f) => !payload[f]);
  if (missing.length) {
    return respond(req, false, `Missing: ${missing.join(", ")}`);
  }

  // The full payload, so nothing is lost while delivery is unconfigured.
  console.log(
    "[quote] submission",
    JSON.stringify({ receivedAt: new Date().toISOString(), ...payload })
  );

  /*
    THE LEAD IS STORED FIRST, and the log above still runs either way.

    Before the workroom existed, a quote request lived only in the Vercel log:
    nothing lost, but nothing workable either, because a log is not a list you
    can call through on a Tuesday. It is now a row in the leads queue.

    Storing must never cost the visitor their submission, so a failure here is
    caught and logged rather than raised. On the memory backend a deployed
    lambda may not be the one the queue reads from, which is why every
    workroom screen says out loud when it is running on memory.
  */
  const now = Date.now();
  const lead: Lead = {
    id: newId("ld"),
    createdAt: now,
    updatedAt: now,
    status: "new",
    line: payload.line,
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    zip: payload.zip,
    about: payload.about,
    address: payload.address,
    currentCarrier: payload.current_carrier,
    renewal: payload.renewal,
    notes: payload.notes,
    consent: payload.consent,
    workNotes: "",
  };
  try {
    await getStore().createLead(lead);
  } catch (err) {
    console.error("[quote] the lead could not be stored; it is in the log above", err);
  }

  const to = process.env.QUOTE_TO;
  if (!to) {
    console.warn(
      "[quote] QUOTE_TO is not set, so this submission was logged and not delivered. " +
        "Set QUOTE_TO and the SMTP_* variables in the Vercel dashboard."
    );
  } else {
    // deliver(to, payload) goes here. Deliberately not stubbed with a fake
    // success: an unimplemented send that returns ok is the exact failure this
    // comment exists to prevent.
    console.warn("[quote] QUOTE_TO is set but deliver() is not implemented yet.");
  }

  return respond(req, true);
}

/** Redirect for the no-JS form post, JSON for the fetch path. */
function respond(req: Request, ok: boolean, error?: string) {
  const wantsJson = (req.headers.get("accept") || "").includes("application/json");
  if (wantsJson) {
    return NextResponse.json(ok ? { ok: true } : { ok: false, error }, {
      status: ok ? 200 : 400,
    });
  }
  const url = new URL(ok ? "/quote/received" : "/quote?error=1", req.url);
  // 303 so the browser follows with GET. A 301 can turn a POST into a GET
  // implicitly and is the wrong tool; 303 says it on purpose.
  return NextResponse.redirect(url, 303);
}
