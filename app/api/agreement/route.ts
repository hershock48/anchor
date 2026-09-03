import { NextResponse } from "next/server";
import { agreement, money, type AgreementAcceptance } from "@/lib/agreement";
import { getStore, newId } from "@/lib/workroom/store";

/**
 * Where the acceptance lands. Clickwrap, the same mechanism as the glazedweb
 * menu-order flow and devine's custom order: the client reads the published
 * v1.0 terms plus the Exhibit A on the page, types her name, ticks the box,
 * and THE EMAIL IS THE RECORD. Both parties get a copy carrying the version
 * string, the exhibit, the typed name and title, and the server's timestamp.
 * The database row is the queryable duplicate.
 *
 * Mail goes over Resend from the studio's verified domain, like the intake
 * sheet: this is studio mail (a countersignature record to Kevin), not the
 * agency's customer mail, and the agency has no mailbox yet anyway. The
 * record goes to AGREEMENT_TO, defaulting to Kevin's address from the
 * proposal's footer.
 *
 * Honesty states mirror the quote intake: the full record is logged before
 * anything can fail, and when mail cannot be sent the page hands the visitor
 * a prefilled mailto carrying the same acceptance text rather than a false
 * "you're all set."
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

function recordText(a: AgreementAcceptance): string {
  return [
    `AGREEMENT ACCEPTED`,
    ``,
    `${a.version}`,
    `${a.exhibit}`,
    ``,
    `Provider:    ${agreement.provider} (Kevin Hershock)`,
    `Business:    ${a.business}`,
    `Accepted by: ${a.name}${a.title ? `, ${a.title}` : ""}`,
    `Email:       ${a.email}`,
    `Accepted at: ${a.acceptedAt} (server time)`,
    `Record id:   ${a.id}`,
    `From IP:     ${a.ip}`,
    ``,
    `Terms: ${agreement.termsUrl} (v1.0), incorporated by reference.`,
    `Exhibit A as shown at anchor.glazedweb.com/agreement on the acceptance date:`,
    ``,
    `  Build fee ${money(agreement.buildFee)}, deposit ${money(agreement.deposit)} due on acceptance,`,
    `  balance on launch. Monthly service fee ${money(agreement.monthly)} from the first of the`,
    `  month after launch, including the workroom and the online payment service.`,
    `  Edit allowance ${agreement.editAllowance}. Additional work ${money(agreement.hourlyRate)}/hour,`,
    `  quoted and approved in advance. Online card payments carry a $${(agreement.onlineFeeCents / 100).toFixed(2)}`,
    `  customer-paid online payment fee collected by glazedweb as the payment technology`,
    `  provider through Stripe, never charged to the Client. ${agreement.timeline}`,
    ``,
    ...agreement.scope.map((s, i) => `  Scope ${i + 1}. ${s}`),
    `  Not included: ${agreement.notIncluded}`,
    ``,
    `  Online payment terms (Exhibit A, part 3):`,
    ...agreement.payments.map((p, i) => `  ${i + 1}. ${p.lead} ${p.text}`),
  ].join("\n");
}

/** For a browser poke while wiring things up: says whether the pieces exist,
    never what they are. */
export async function GET() {
  return NextResponse.json({
    mail: !!process.env.RESEND_API_KEY,
    recordTo: process.env.AGREEMENT_TO ? "AGREEMENT_TO" : "default (kevin@glazedweb.com)",
    backend: getStore().backend,
  });
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Empty submission." }, { status: 400 });
  }
  const p = (raw ?? {}) as Record<string, unknown>;

  const name = str(p.name, 120);
  const title = str(p.title, 120);
  const business = str(p.business, 160) || agreement.client;
  const email = str(p.email, 200);
  const agreed = p.agreed === true;

  if (!agreed) return NextResponse.json({ error: "The agreement box was not checked." }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ error: "A full name is required." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A working email is required; your copy of the record goes there." }, { status: 400 });
  }

  const acceptance: AgreementAcceptance = {
    id: newId("agr"),
    createdAt: Date.now(),
    business,
    name,
    title,
    email,
    acceptedAt: new Date().toISOString(),
    version: agreement.version,
    exhibit: agreement.exhibit,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
    userAgent: str(req.headers.get("user-agent"), 300),
  };

  const text = recordText(acceptance);
  // The log carries the whole record before anything can fail.
  console.log(`[agreement] acceptance ${acceptance.id}:\n${text}`);

  try {
    await getStore().agreements.put(acceptance);
  } catch (err) {
    console.error(`[agreement] acceptance ${acceptance.id} not stored (email still the record):`, err);
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.AGREEMENT_TO || "kevin@glazedweb.com";
  if (!key) {
    console.log(`[agreement] acceptance ${acceptance.id} NOT emailed: RESEND_API_KEY not set.`);
    return NextResponse.json({ state: "unconfigured", record: text });
  }

  const send = (msg: { to: string; replyTo: string; subject: string; text: string }) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "glazedweb <anchor@glazedweb.com>",
        to: [msg.to],
        reply_to: msg.replyTo,
        subject: msg.subject,
        text: msg.text,
      }),
    });

  // Glazed's copy decides success; it is the countersignature record.
  try {
    const res = await send({ to, replyTo: email, subject: `Agreement accepted: ${business} (${agreement.version})`, text });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  } catch (err) {
    console.error(`[agreement] acceptance ${acceptance.id} send FAILED:`, err);
    return NextResponse.json({ state: "send-failed", record: text });
  }

  // The client's copy is best-effort (her acceptance already stands either
  // way) but it is AWAITED, because fire-and-forget dies on serverless: the
  // lambda freezes the moment the response returns (devine's first live test
  // delivered exactly one of the two emails that way).
  try {
    await send({
      to: email,
      replyTo: to,
      subject: `Your signed copy: ${agreement.version}, ${business}`,
      text: `This is your record of acceptance. Keep this email.\n\n${text}\n\nThe full terms: ${agreement.termsUrl}\nPDF copy: ${agreement.pdfUrl}`,
    });
  } catch (err) {
    console.error(`[agreement] acceptance ${acceptance.id} client copy not sent:`, err);
  }

  return NextResponse.json({ state: "sent" });
}
