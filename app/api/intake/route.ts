import { NextResponse } from "next/server";

export const runtime = "nodejs";
/** A handler whose behavior depends on the request cannot be cached. */
export const dynamic = "force-dynamic";

/**
 * The intake sheet, submitted from /intake.
 *
 * Same honesty contract as /api/quote: every submission is logged in full and
 * always succeeds for the visitor, so nothing is ever lost to a missing
 * environment variable. Delivery is layered on top and its failure is the
 * operator's problem to see in the Vercel log.
 *
 * UNLIKE /api/quote, delivery here is implemented, because this form's
 * destination is not a placeholder: it is Kevin. The quote form waits on a
 * mailbox the AGENCY owns, which does not exist yet. This one goes over
 * Resend from the verified glazedweb.com sending domain, which is the house
 * rail for studio mail. The subscription rule in glaze.md protects the
 * client from renting infrastructure; this is our own intake, on our own
 * account, and she can leave with her site and never touch it.
 *
 * THE SEAM: set INTAKE_TO (Kevin's inbox) and RESEND_API_KEY (a sending-only
 * key for this project) in the Vercel dashboard. Until both are set,
 * submissions log and warn.
 *
 * PII: a name, a phone number, an address, license numbers. Logged and
 * mailed to one inbox, stored nowhere, seen by no third party beyond the
 * mail rail. The page's own copy promises exactly this.
 */

const SECTIONS: [string, [string, string][]][] = [
  [
    "The basics",
    [
      ["name", "Full name"],
      ["title", "Title"],
      ["amanda_role", "Amanda's role"],
      ["phone", "Office phone"],
      ["email", "Email for the site"],
      ["address", "Street address and ZIP"],
      ["walkin", "Walk-in or by appointment"],
      ["hours", "Hours"],
      ["founding_year", "Founding year"],
    ],
  ],
  [
    "Licensing and carriers",
    [
      ["license_number", "Michigan producer license number"],
      ["npn", "NPN"],
      ["carriers", "Carrier appointments"],
    ],
  ],
  [
    "Online",
    [
      ["facebook", "Facebook page"],
      ["socials", "Instagram and other accounts"],
      ["gbp", "Google Business Profile"],
      ["review_link", "Google review link"],
      ["domain", "Website address"],
    ],
  ],
  [
    "The giving page",
    [
      ["giving_where", "Where giving updates will live"],
      ["giving_page", "What the giving page should say"],
      ["attorney", "Attorney or E&O review"],
    ],
  ],
  [
    "Story and photos",
    [
      ["call_time", "A time to talk"],
      ["photos", "Photos we can use"],
      ["logo_file", "The original logo file"],
    ],
  ],
  [
    "Nuts and bolts",
    [
      ["quote_inbox", "Where quote requests should go"],
      ["retention", "How long quote information is kept"],
      ["agency_billed", "Agency-billed policies, and card payment on the site"],
    ],
  ],
];

const FIELDS = SECTIONS.flatMap(([, rows]) => rows.map(([f]) => f));

function clean(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim().slice(0, 2000) : "";
}

/** The email body: answered fields grouped by section, blanks named at the end. */
function formatMail(payload: Record<string, string>): string {
  const parts: string[] = [];
  const blank: string[] = [];
  for (const [section, rows] of SECTIONS) {
    const answered = rows.filter(([f]) => payload[f]);
    for (const [f, label] of rows) if (!payload[f]) blank.push(label);
    if (!answered.length) continue;
    parts.push(section.toUpperCase());
    for (const [f, label] of answered) parts.push(`${label}:\n${payload[f]}`);
    parts.push("");
  }
  if (blank.length) parts.push(`LEFT BLANK\n${blank.join(", ")}`);
  return parts.join("\n\n").trim();
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Honeypot, same as the quote form: accept silently, deliver nothing.
  if (clean(form.get("company"))) {
    return respond(req, true);
  }

  const payload: Record<string, string> = {};
  for (const f of FIELDS) payload[f] = clean(form.get(f));

  if (!payload.name) {
    // Native `required` catches this in every real browser, JS on or off.
    console.warn("[intake] submission rejected: no name");
    return respond(req, false);
  }

  // The full payload first, so nothing is lost if delivery fails or is unset.
  console.log(
    "[intake] submission",
    JSON.stringify({ receivedAt: new Date().toISOString(), ...payload })
  );

  const to = process.env.INTAKE_TO;
  const key = process.env.RESEND_API_KEY;
  if (!to || !key) {
    console.warn(
      "[intake] INTAKE_TO or RESEND_API_KEY is not set, so this submission was " +
        "logged and not delivered. Set both in the Vercel dashboard."
    );
  } else {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Anchor intake <anchor@glazedweb.com>",
          to: [to],
          // Reply lands with her only if she gave something mail-shaped.
          ...(payload.email.includes("@") ? { reply_to: payload.email } : {}),
          subject: `Anchor intake sheet from ${payload.name}`,
          text: formatMail(payload),
        }),
      });
      if (!res.ok) {
        console.error("[intake] delivery failed", res.status, await res.text());
      }
    } catch (err) {
      console.error("[intake] delivery failed", err);
    }
  }

  // The visitor always succeeds once the payload is logged. A delivery fault
  // is ours to see in the log, not hers to retype the sheet over.
  return respond(req, true);
}

/** Redirect for the no-JS form post, JSON for a fetch path if one ever exists. */
function respond(req: Request, ok: boolean) {
  const wantsJson = (req.headers.get("accept") || "").includes("application/json");
  if (wantsJson) {
    return NextResponse.json(ok ? { ok: true } : { ok: false, error: "missing_name" }, {
      status: ok ? 200 : 400,
    });
  }
  // 303 so the browser follows with GET; see /api/quote for why not 301.
  const url = new URL(ok ? "/intake/sent" : "/intake", req.url);
  return NextResponse.redirect(url, 303);
}
