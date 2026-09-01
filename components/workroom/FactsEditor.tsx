"use client";

import { useEffect, useState } from "react";
import { FACT_FIELDS, FACT_GROUPS, factError, type FactKey } from "@/lib/workroom/facts-def";

/**
 * The facts on the site, editable.
 *
 * The whole form renders from FACT_FIELDS, the whitelist in
 * lib/workroom/facts-def.ts: adding a field there adds it here and to the
 * save route in the same edit. A box holds the EFFECTIVE value; the built-in
 * value sits underneath as the placeholder, so clearing a box and saving
 * visibly returns the site to what it was built with.
 *
 * A fact the site does not have yet (the README's placeholder list) shows as
 * an empty box with a "Blank on the site" chip, so this screen is also the
 * handover checklist she can work through herself.
 *
 * Fetches after the gate, like the queue and the payments screen: the server
 * page renders the gate without knowing anything, and the values only travel
 * once the cookie is good.
 */

type Loaded = {
  values: Record<FactKey, string>;
  placeholders: Record<FactKey, string>;
  overridden: FactKey[];
  blank: FactKey[];
  backend: "postgres" | "memory";
};

export default function FactsEditor() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [form, setForm] = useState<Record<FactKey, string> | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FactKey, string>>>({});
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  const [failed, setFailed] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/workroom/facts", { headers: { Accept: "application/json" } });
        const data = (await res.json().catch(() => ({}))) as Partial<Loaded> & { error?: string };
        if (!res.ok || !data.values) {
          setLoadError(data.error || "Could not load the facts.");
          return;
        }
        setLoaded(data as Loaded);
        setForm(data.values);
      } catch {
        setLoadError("Could not reach the site.");
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaved("");
    setFailed("");

    // Check locally first so a typo is caught before the round trip; the
    // route runs the same checks again regardless.
    const found: Partial<Record<FactKey, string>> = {};
    for (const f of FACT_FIELDS) {
      const err = factError(f, form[f.key].trim());
      if (err) found[f.key] = err;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFailed("Check the marked boxes.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/workroom/facts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: form }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<Loaded> & {
        error?: string;
        errors?: Partial<Record<FactKey, string>>;
      };
      if (res.ok && data.values) {
        setLoaded(data as Loaded);
        setForm(data.values);
        setSaved("Saved. The site shows it within a few seconds.");
      } else if (data.errors) {
        setErrors(data.errors);
        setFailed(data.error || "Check the marked boxes.");
      } else {
        setFailed(data.error || "That did not save. Your typing is still on screen.");
      }
    } catch {
      setFailed("That did not save. Your typing is still on screen.");
    }
    setBusy(false);
  }

  if (loadError) {
    return (
      <p className="wr-error" role="alert">
        {loadError}
      </p>
    );
  }
  if (!loaded || !form) return <p className="wr-muted">Loading…</p>;

  const edited = new Set(loaded.overridden);
  const blank = new Set(loaded.blank);

  return (
    <>
      <div className="wr-head">
        <h1>Site facts</h1>
        <p className="wr-muted">
          Change a fact here and every page that shows it updates within a few seconds. Clear a
          box and save to go back to what the site was built with.
        </p>
      </div>

      {loaded.backend === "memory" && (
        <p className="wr-warn" role="status">
          <strong>No database is connected yet</strong>, so anything saved here is held only in
          memory and can be forgotten by the next restart. Connect a database in Vercel (Storage,
          then Neon) and this warning goes away.
        </p>
      )}

      <form onSubmit={save} noValidate>
        {FACT_GROUPS.map((g) => (
          <section key={g.id} aria-labelledby={`wr-g-${g.id}`}>
            <h2 className="wr-h2" id={`wr-g-${g.id}`}>
              {g.label}
            </h2>
            <p className="wr-muted wr-group-note">{g.note}</p>
            <div className="wr-form">
              {FACT_FIELDS.filter((f) => f.group === g.id).map((f) => {
                const id = `wr-f-${f.key}`;
                const err = errors[f.key];
                const helpId = err || f.help ? `${id}-help` : undefined;
                return (
                  <div className="wr-field" key={f.key}>
                    <label htmlFor={id}>
                      {f.label}
                      {edited.has(f.key) && <span className="wr-chip wr-chip-called">Edited here</span>}
                      {!edited.has(f.key) && blank.has(f.key) && (
                        <span className="wr-chip wr-chip-lost">Blank on the site</span>
                      )}
                    </label>
                    <input
                      id={id}
                      type="text"
                      inputMode={
                        f.kind === "phone" ? "tel" : f.kind === "email" ? "email" : f.kind === "url" ? "url" : "text"
                      }
                      autoComplete="off"
                      value={form[f.key]}
                      placeholder={loaded.placeholders[f.key] || "Not on the site yet"}
                      aria-describedby={helpId}
                      aria-invalid={err ? true : undefined}
                      onChange={(e) => {
                        setForm({ ...form, [f.key]: e.target.value });
                        setSaved("");
                      }}
                    />
                    {err ? (
                      <p className="wr-field-error" id={helpId} role="alert">
                        {err}
                      </p>
                    ) : (
                      f.help && (
                        <p className="wr-help" id={helpId}>
                          {f.help}
                        </p>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <div className="wr-save-row wr-save-sticky">
          <button className="wr-btn" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save and publish"}
          </button>
          {saved && (
            <span className="wr-saved" role="status">
              {saved}
            </span>
          )}
          {failed && (
            <span className="wr-error" role="alert">
              {failed}
            </span>
          )}
        </div>
      </form>
    </>
  );
}
