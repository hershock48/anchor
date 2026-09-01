/**
 * Where Stripe's success_url lands. Static and careful with its claims: this
 * page cannot see the session, so it never says "paid." Stripe's own screen
 * and the card receipt are the proof; this page says what happens next.
 */
export const metadata = {
  title: "Payment received",
  description: "What happens after you pay an agency invoice.",
  robots: { index: false, follow: false },
};

export default function PayReceived() {
  return (
    <section className="pagehead">
      <div className="wrap">
        <p className="kicker">Payments</p>
        <h1>Thank you.</h1>
        <p className="lede" style={{ marginTop: 14 }}>
          If Stripe showed your payment going through, your card receipt is your
          record and we see the payment on our side. It is applied to your policy the
          same business day. Close to a cancellation date? Call us so we can confirm
          it landed before anything lapses.
        </p>
        <p style={{ marginTop: 22 }}>
          While the policy is in front of you: if you have never priced{" "}
          <a href="/coverage/umbrella">an umbrella</a>, ask the next time you call.
          It is the coverage most people are underweight on, and it costs less than
          people guess.
        </p>
      </div>
    </section>
  );
}
