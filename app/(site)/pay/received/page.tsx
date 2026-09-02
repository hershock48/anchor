import type { Metadata } from "next";
import { getFacts } from "@/lib/content";
import { isPlaceholder } from "@/lib/site";
import { dueLabel, money } from "@/lib/workroom/book";
import { recordSession, today } from "@/lib/pay";

/**
 * Where Stripe's success_url lands, carrying the session id.
 *
 * This page RECORDS the payment before it speaks: it fetches the session
 * from Stripe by that id (a forged id fetches nothing), writes the payment
 * into the book and rolls the due date, then says exactly what happened.
 * The webhook does the same thing independently and the second writer is a
 * no-op, so a closed tab and an unconfigured webhook are each survivable.
 *
 * With no session id, or if Stripe cannot be reached, it says the careful
 * thing the old static page said: the card receipt is the record.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment received",
  robots: { index: false, follow: false },
};

export default async function PayReceived({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const facts = await getFacts();
  const callUs = !isPlaceholder(facts.contact.phone) ? (
    <a href={`tel:${facts.contact.phoneHref}`}>call {facts.contact.phone}</a>
  ) : (
    <a href="/contact">reach us</a>
  );

  let recorded: Awaited<ReturnType<typeof recordSession>> | null = null;
  if (session_id) {
    try {
      recorded = await recordSession(session_id, "return");
    } catch (err) {
      console.error("[pay] could not record the returning session", err);
    }
  }
  const payment = recorded?.payment ?? null;
  const policy = recorded?.policy ?? null;

  return (
    <section className="pagehead">
      <div className="wrap" style={{ maxWidth: 720 }}>
        <p className="kicker">Payments</p>
        <h1>Thank you.</h1>
        {payment && policy ? (
          <>
            <p className="lede" style={{ marginTop: 14 }}>
              <strong>{money(payment.totalCents)}</strong> paid toward {policy.label || `policy ${policy.policyNumber}`}
              {payment.feeCents > 0 ? (
                <>
                  : {money(payment.premiumCents)} premium and the {money(payment.feeCents)} online payment fee.
                </>
              ) : (
                "."
              )}{" "}
              {payment.payerEmail ? <>Your receipt is on its way to {payment.payerEmail}.</> : <>Stripe emails your receipt.</>}
            </p>
            <p style={{ marginTop: 18 }}>
              {policy.nextDue ? (
                <>The next installment is {money(policy.amountCents)} due {dueLabel(policy.nextDue, today())}, and we will send a note before then.</>
              ) : (
                <>That was the last installment on file for this policy.</>
              )}{" "}
              It is applied to your policy the same business day.
            </p>
          </>
        ) : recorded?.autopayStarted && policy ? (
          <>
            <p className="lede" style={{ marginTop: 14 }}>
              Autopay is on for {policy.label || `policy ${policy.policyNumber}`}.{" "}
              {policy.nextDue ? (
                <>The first charge of {money(policy.amountCents)} lands on {dueLabel(policy.nextDue, today())}, and each one after it on the due date.</>
              ) : (
                <>Each installment charges on its due date.</>
              )}{" "}
              You get a receipt by email every time, and one call or email stops it.
            </p>
          </>
        ) : (
          <p className="lede" style={{ marginTop: 14 }}>
            If Stripe showed your payment going through, your card receipt is your record and
            we see the payment on our side. It is applied to your policy the same business
            day. If you chose autopay, each installment charges on its due date until you tell
            us to stop, and one call or email cancels it.
          </p>
        )}
        <p style={{ marginTop: 22 }}>
          Close to a cancellation date? Please {callUs} so we can confirm it landed before
          anything lapses.
        </p>
        <p style={{ marginTop: 22 }}>
          While the policy is in front of you: if you have never priced{" "}
          <a href="/coverage/umbrella">an umbrella</a>, ask the next time you call. It is the
          coverage most people are underweight on, and it costs less than people guess.
        </p>
      </div>
    </section>
  );
}
