"use client";

import { useEffect, useRef, useState } from "react";
import { INTAKE_DRAFT_KEY } from "@/lib/intake-draft";

/**
 * The intake form, with the one fear it is built around: she spends twenty
 * minutes filling this in, something goes wrong, and the work is gone.
 *
 * Two protections, both JavaScript, both layered ON TOP of a plain form POST
 * so with scripts off the form still submits and nothing below is load-bearing:
 *
 * 1. THE DRAFT. Every answer is saved to localStorage on her own device as
 *    she types (debounced, and flushed on pagehide/visibilitychange because
 *    the likeliest data loss is a phone discarding the tab while she is off
 *    looking up her license number). On return, saved answers are restored
 *    into EMPTY fields only, so the browser's own back-forward restore is
 *    never clobbered. The draft clears only after a confirmed send: here on
 *    the fetch path, and on /intake/sent for the no-fetch path. It never
 *    leaves her device.
 *
 * 2. THE SEND FAILS IN PLACE. Submit goes over fetch with Accept: json, so a
 *    network failure shows an error next to the button with her answers
 *    still on screen and still saved, instead of navigating to a browser
 *    error page. Only a confirmed { ok: true } navigates away.
 *
 * localStorage can be unavailable (some private modes, blocked site data),
 * so everything storage probes first and the "saved on this device" promise
 * is only rendered once a real write has succeeded. A promise the page
 * cannot keep is worse than no promise.
 *
 * The submit button is never disabled in server HTML (the QuoteForm trap):
 * `sending` starts false and only ever becomes true after a click, so the
 * no-JS path always has a live button.
 */

function Row({
  name,
  label,
  hint,
  required,
  area,
  rows,
  type,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  area?: boolean;
  rows?: number;
  type?: string;
}) {
  return (
    <div className="qf-row">
      <label htmlFor={`in-${name}`}>
        {label}
        {!required && <span className="qf-opt"> (optional)</span>}
      </label>
      {hint && <p className="qf-optnote" style={{ margin: "0 0 8px" }}>{hint}</p>}
      {area ? (
        <textarea id={`in-${name}`} name={name} rows={rows || 3} maxLength={2000} />
      ) : (
        <input
          id={`in-${name}`}
          name={name}
          type={type || "text"}
          maxLength={300}
          required={required}
        />
      )}
    </div>
  );
}

export default function IntakeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [canStore, setCanStore] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<"" | "network" | "missing_name">("");

  const saveNow = () => {
    const form = formRef.current;
    if (!form) return;
    const data: Record<string, string> = {};
    for (const [k, v] of new FormData(form)) {
      // The honeypot stays out of the draft; everything else is saved even
      // when empty, so clearing a field sticks across a reload.
      if (k !== "company" && typeof v === "string") data[k] = v;
    }
    try {
      localStorage.setItem(INTAKE_DRAFT_KEY, JSON.stringify(data));
    } catch {}
  };

  useEffect(() => {
    try {
      localStorage.setItem(`${INTAKE_DRAFT_KEY}:probe`, "1");
      localStorage.removeItem(`${INTAKE_DRAFT_KEY}:probe`);
    } catch {
      return; // No storage, no promise. The form still works as plain POST.
    }
    setCanStore(true);

    const form = formRef.current;
    if (form) {
      try {
        const raw = localStorage.getItem(INTAKE_DRAFT_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Record<string, unknown>;
          for (const [k, v] of Object.entries(saved)) {
            const el = form.elements.namedItem(k);
            if (
              (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) &&
              !el.value &&
              typeof v === "string" &&
              v
            ) {
              el.value = v;
            }
          }
        }
      } catch {}
    }

    // A pending debounce is unsaved typing. Flush it the moment the page is
    // backgrounded, because a phone can discard the tab from there.
    const flush = () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = undefined;
        saveNow();
      }
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
    };
  }, []);

  const onInput = () => {
    if (!canStore) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      saveNow();
    }, 400);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const form = formRef.current;
    if (!form) return;
    e.preventDefault();
    setSending(true);
    setFailed("");
    if (canStore) {
      if (timer.current) clearTimeout(timer.current);
      saveNow(); // Belt and suspenders: the draft is current before the wire.
    }
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        try {
          localStorage.removeItem(INTAKE_DRAFT_KEY);
        } catch {}
        window.location.assign("/intake/sent");
        return; // Keep `sending` true so the button stays quiet during navigation.
      }
      setFailed(data?.error === "missing_name" ? "missing_name" : "network");
    } catch {
      setFailed("network");
    }
    setSending(false);
  };

  return (
    <form ref={formRef} className="qf" method="post" action="/api/intake" onInput={onInput} onSubmit={onSubmit}>
      {/* Honeypot, same mechanism as the quote form. Off-screen and labelled. */}
      <div className="qf-hp" aria-hidden="true">
        <label htmlFor="in-company">Leave this field empty</label>
        <input id="in-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset>
        <legend>The basics</legend>
        <Row name="name" label="Your full name" hint="As it should appear on the site." required />
        <Row name="title" label="Your title" hint="We have &ldquo;Agent and owner&rdquo; penciled in." />
        <Row name="amanda_role" label="Amanda&rsquo;s role" hint="So we introduce her correctly." />
        <div className="qf-two">
          <Row name="phone" label="Office phone" type="tel" />
          <Row name="email" label="Email for the site" hint="And who reads that inbox." />
        </div>
        <Row name="address" label="Street address and ZIP" area rows={2} />
        <Row name="walkin" label="Walk-in or by appointment?" hint="This changes how the contact page reads." />
        <Row
          name="hours"
          label="Hours"
          hint="Weekdays, Saturday, and any seasonal exception or one day that is different."
          area
        />
        <Row name="founding_year" label="Founding year" hint="Only if you want one shown." />
      </fieldset>

      <fieldset>
        <legend>Licensing and carriers</legend>
        <div className="qf-two">
          <Row name="license_number" label="Michigan producer license number" />
          <Row name="npn" label="NPN" />
        </div>
        <Row
          name="carriers"
          label="Carriers you are appointed with"
          hint="We only show confirmed appointments. Some carriers have rules about using their logo, so we check each one before it appears."
          area
        />
      </fieldset>

      <fieldset>
        <legend>Online</legend>
        <Row name="facebook" label="Facebook page" />
        <Row name="socials" label="Instagram or other accounts" hint="Anywhere you post that the site should link to." />
        <Row name="gbp" label="Google Business Profile" hint="Do you have one? If so, the link." />
        <Row
          name="review_link"
          label="Google review link"
          hint="The write-a-review link from your Business Profile dashboard. We can help you pull this one."
        />
        <Row
          name="domain"
          label="Website address"
          hint="We have anchorinsurancemi.com penciled in, not purchased. Tell us what you want and we will handle the rest. It is registered in your name."
        />
      </fieldset>

      <fieldset>
        <legend>The giving page</legend>
        <p className="qf-optnote">
          The site says a percentage of what you earn goes back, with no dollar
          amounts. If the specifics are going to live on your social accounts,
          the giving page can stay simple and point people there.
        </p>
        <Row
          name="giving_where"
          label="Where will giving updates live?"
          hint="Facebook, Instagram, a newsletter, wherever you will actually post them."
        />
        <Row name="giving_page" label="Anything the giving page itself should say?" area />
        <Row
          name="attorney"
          label="Attorney or E&amp;O review"
          hint="Michigan has rules on advertising donated commission. Has your attorney or E&amp;O carrier looked at the program, and if not, would you like us to send them a one-page summary?"
        />
      </fieldset>

      <fieldset>
        <legend>Your story and photos</legend>
        <Row
          name="call_time"
          label="A time to talk"
          hint="The About page comes from a recorded phone conversation, about an hour, in your own words. What day and time works?"
        />
        <Row
          name="photos"
          label="Photos we can use"
          hint="You, the office, Manchester. If someone else took a photo, we need their OK in writing. Files can go by email or text; here, just tell us what you have."
          area
          rows={2}
        />
        <Row
          name="logo_file"
          label="The original logo file"
          hint="The file your designer sent you, if you have it. The copy we are working from looks great on screen, and the original would let us use it in print too."
        />
      </fieldset>

      <fieldset>
        <legend>Nuts and bolts</legend>
        <Row
          name="quote_inbox"
          label="Where should quote requests go?"
          hint="An email inbox you own and check. Quote forms on the site will be delivered there."
        />
        <Row
          name="retention"
          label="How long do you keep quote information?"
          hint="This goes in the privacy policy, in plain language."
        />
      </fieldset>

      <div className="qf-actions">
        <button className="btn" type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send it to Kevin"}
        </button>
        <p className="qf-note" role="status">
          {canStore
            ? "Your answers save on this device as you type, so you can leave and come back any time. Sending goes straight to Kevin’s inbox; nothing is published anywhere."
            : "Goes straight to his inbox. Nothing here is published anywhere."}
        </p>
      </div>
      {failed && (
        <p className="qf-error" role="alert">
          {failed === "missing_name"
            ? "Add your name at the top, that is the one field it needs, then press send again."
            : (
              <>
                That did not go through, and nothing was lost: your answers are
                still saved on this device. Give it a minute and try again, or{" "}
                <a href="mailto:kevin@glazedweb.com?subject=Anchor%20Insurance%20intake">email Kevin</a>{" "}
                and he will take them over the phone.
              </>
            )}
        </p>
      )}
    </form>
  );
}
