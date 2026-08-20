"use client";

import { useEffect, useState } from "react";
import { lines } from "@/lib/site";

/**
 * The quote form.
 *
 * SHORT FIRST STEP, ON PURPOSE. Insurance lead forms average about eight fields
 * and convert around six percent. A five-field form finishes roughly twice as
 * often as an eight-field one, and the drop is not linear: there is a cliff at
 * about five. So step one asks the four things needed to call somebody back and
 * everything else is optional on step two.
 *
 * IT WORKS WITH JAVASCRIPT OFF. This is a real form with a real action and
 * method, so with no JS it posts everything at once and the handler redirects.
 * The step logic only hides fieldsets; it never gates the submit.
 *
 * THE HIDDEN SUBMIT TRAP. A hidden submit button is still the form's default
 * button, so Enter from step one would submit the whole thing. The step-two
 * submit is `disabled` while step one is showing, which is what actually
 * prevents it. `hidden` alone does not.
 */
export default function QuoteForm() {
  const [step, setStep] = useState(1);
  const [ready, setReady] = useState(false);
  const [initialLine, setInitialLine] = useState("");

  // Nothing JS-only is applied until this flips. Before it does, the server's
  // HTML shows BOTH fieldsets and an enabled submit, which is the entire no-JS
  // path: fill in what you can, press the button, it all posts at once.
  useEffect(() => setReady(true), []);

  // Read ?line= here rather than in the page, so the page stays static.
  // Applied to the field after mount, which is why the select is uncontrolled
  // with a defaultValue and gets set directly instead.
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("line") || "";
    if (!v) return;
    setInitialLine(v);
    const el = document.getElementById("line") as HTMLSelectElement | null;
    if (el) el.value = v;
  }, []);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    setState("sending");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        body: new FormData(form),
        headers: { accept: "application/json" },
      });
      const data = await res.json();
      if (data.ok) {
        setState("done");
      } else {
        setState("error");
        setMessage(data.error || "Something did not go through.");
      }
    } catch {
      setState("error");
      setMessage("We could not reach the server.");
    }
  }

  if (state === "done") {
    return (
      <div className="qf-done" role="status">
        <h2>Got it.</h2>
        <p>
          Your request is in. We will call you back at the number you gave us, usually the same
          business day and always within one.
        </p>
        <p className="qf-honest">
          Nothing is bound and nothing has changed about your current coverage. You are insured
          by whatever policy you had five minutes ago until a carrier issues a new one in
          writing.
        </p>
      </div>
    );
  }

  return (
    <form
      className={ready ? `qf stepped step-${step}` : "qf"}
      action="/api/quote"
      method="post"
      onSubmit={onSubmit}
    >
      {/* Honeypot. Off screen, labelled for screen readers, never autofilled. */}
      <div className="qf-hp" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset data-step="1">
        <legend>
          <span className="qf-step">Step 1 of 2</span>
          What do you need covered?
        </legend>

        <div className="qf-row">
          <label htmlFor="line">Coverage</label>
          <select id="line" name="line" defaultValue={initialLine}>
            <option value="">Not sure yet</option>
            {lines.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="qf-row">
          <label htmlFor="name">Your name</label>
          <input id="name" name="name" type="text" required autoComplete="name" />
        </div>

        <div className="qf-two">
          <div className="qf-row">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" />
          </div>
          <div className="qf-row">
            <label htmlFor="zip">ZIP code</label>
            <input
              id="zip"
              name="zip"
              type="text"
              required
              autoComplete="postal-code"
              inputMode="numeric"
              pattern="[0-9]{5}"
              maxLength={5}
            />
          </div>
        </div>

        <div className="qf-row">
          <label htmlFor="email">
            Email <span className="qf-opt">optional</span>
          </label>
          <input id="email" name="email" type="email" autoComplete="email" />
        </div>

        <div className="qf-consent">
          <input id="consent" name="consent" type="checkbox" value="yes" required />
          <label htmlFor="consent">
            You may call or text me about this request at the number above. Message and data
            rates may apply, texts are not required to buy anything, and I can stop them any
            time by replying STOP.
          </label>
        </div>

        <div className="qf-actions">
          <button type="button" className="btn qf-jsonly" onClick={() => setStep(2)}>
            Continue
          </button>
          <p className="qf-note">
            Four fields is all we need to call you back. The next step is optional and it makes
            the quote more accurate.
          </p>
        </div>
      </fieldset>

      <fieldset data-step="2">
        <legend>
          <span className="qf-step">Step 2 of 2</span>
          Anything that makes the quote sharper
        </legend>
        <p className="qf-optnote">All of this is optional. Skip it and we will ask on the call.</p>

        <div className="qf-row">
          <label htmlFor="address">Street address</label>
          <input id="address" name="address" type="text" autoComplete="street-address" />
        </div>
        <div className="qf-two">
          <div className="qf-row">
            <label htmlFor="current_carrier">Who covers you now</label>
            <input id="current_carrier" name="current_carrier" type="text" />
          </div>
          <div className="qf-row">
            <label htmlFor="renewal">When does it renew</label>
            <input id="renewal" name="renewal" type="text" placeholder="March, or not sure" />
          </div>
        </div>
        <div className="qf-row">
          <label htmlFor="notes">Anything else we should know</label>
          <textarea id="notes" name="notes" rows={4} />
        </div>

        <p className="qf-nodob">
          We are not asking for dates of birth, license numbers or vehicle identification
          numbers on a web form. Those come up on the call, with a person.
        </p>

        <div className="qf-actions">
          {/* disabled, not just hidden: a hidden submit is still the form's
              default button and Enter on step one would fire it. */}
          <button type="submit" className="btn" disabled={(ready && step !== 2) || state === "sending"}>
            {state === "sending" ? "Sending" : "Send my request"}
          </button>
          <button type="button" className="btn ghost qf-jsonly" onClick={() => setStep(1)}>
            Back
          </button>
        </div>
      </fieldset>

      {/* No JS: both fieldsets are visible because `hidden` is only applied by
          React state, which never runs. One submit, everything posts. */}
      <noscript>
        <p className="qf-noscript">
          JavaScript is off, which is fine. Everything is on one page, so fill in what you can
          and press Send. It all goes at once.
        </p>
      </noscript>

      {state === "error" ? (
        <p className="qf-error" role="alert">
          {message} Nothing was lost. Call us instead and we will take it down.
        </p>
      ) : null}
    </form>
  );
}
