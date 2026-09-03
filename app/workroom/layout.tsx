import type { Metadata } from "next";
import WorkroomChrome from "@/components/workroom/Chrome";

/**
 * The workroom's shell: none of the site's marketing chrome, all of its
 * tokens.
 *
 * It sits OUTSIDE /demo on purpose (devine's reasoning, unchanged): it is not
 * part of the customer demo, it is the agency's tool, and it does not move
 * when the site graduates to the real domain. `robots` below keeps it out of
 * search after the pitch host's blanket noindex stops applying, because a
 * leads queue has no business in an index either way. It is also deliberately
 * absent from app/sitemap.ts and from every nav on the customer site.
 *
 * THE STYLES LIVE HERE, not in globals.css, so the customer pages never carry
 * the weight of a tool they cannot open (devine's pattern). Everything below
 * is built from the site's own tokens, and the gold rules from the README hold
 * here too: gold is a FILL, and a gold surface carries navy lettering.
 */
export const metadata: Metadata = {
  title: { default: "Workroom · Anchor Insurance", template: "%s · Workroom" },
  description: "The agency's leads queue, payments and the facts on the site.",
  robots: { index: false, follow: false },
};

export default function WorkroomLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Skip link first in tab order, same rule as the customer site: the
          chrome is a row of tabs to step past otherwise. */}
      <a className="skip" href="#main">
        Skip to content
      </a>
      <WorkroomChrome />
      <main id="main" className="wr-main">
        <div className="wr-wrap">{children}</div>
      </main>

      <style>{`
        .wr-main { padding: 30px 0 90px; background: var(--paper); min-height: 70vh; }
        /* The customer stylesheet pads every <section> for the marketing pages;
           the facts screen groups its fields in sections and inherited a band of
           empty space between each group (visible in the agreement's screenshot). */
        .wr-main section { padding: 0; margin: 0; }
        .wr-wrap { max-width: 900px; margin: 0 auto; padding: 0 20px; }

        /* ── chrome ── */
        .wr-chrome { position: sticky; top: 0; z-index: 30; background: var(--paper-2); border-bottom: 1px solid var(--line); }
        .wr-chrome-in { max-width: 900px; margin: 0 auto; padding: 8px 20px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        /* Vertical padding so the link measures 24px tall: the lockup's text
           alone is ~17px, which the facts-screen audit caught as the one
           small tap target in the chrome. */
        .wr-brand { display: flex; align-items: baseline; gap: 8px; flex: 0 0 auto; text-decoration: none; color: inherit; padding: 6px 0; }
        .wr-shop { font-family: var(--font-brand), serif; font-size: 15px; line-height: 1; color: var(--navy); letter-spacing: .04em; }
        .wr-word { font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--slate); }
        .wr-tabs { display: flex; gap: 18px; flex: 1 1 auto; flex-wrap: wrap; }
        .wr-tabs a { font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; text-decoration: none; color: var(--navy); padding: 9px 1px; border-bottom: 2px solid transparent; white-space: nowrap; }
        .wr-tabs a[aria-current="page"] { color: var(--gold-ink); border-bottom-color: var(--gold); }
        .wr-right { display: flex; align-items: center; gap: 16px; flex: 0 0 auto; }
        .wr-right a, .wr-right button { font-size: 12px; font-weight: 600; color: var(--slate); text-decoration: none; background: none; border: 0; font-family: inherit; cursor: pointer; padding: 9px 1px; }
        .wr-right a:hover, .wr-right button:hover { color: var(--navy); }
        @media (max-width: 700px) {
          .wr-chrome-in { padding: 6px 16px; gap: 0 14px; }
          .wr-brand { order: 1; }
          .wr-right { order: 2; margin-left: auto; }
          .wr-tabs { order: 3; width: 100%; gap: 14px; }
        }

        /* ── headings and text ── */
        .wr-head { margin-bottom: 22px; }
        .wr-head h1 { font-size: clamp(26px, 4vw, 34px); color: var(--navy); }
        .wr-h2 { font-size: 15px; font-family: var(--font-mono), ui-monospace, monospace; letter-spacing: .12em; text-transform: uppercase; color: var(--slate); font-weight: 600; margin: 34px 0 12px; }
        .wr-muted { color: var(--slate); font-size: 15px; margin-top: 6px; }
        .wr-fine { font-size: 13.5px; margin-top: 20px; }
        .wr-error { color: #8c2b21; font-weight: 600; font-size: 15px; margin-top: 12px; }
        .wr-saved { color: var(--gold-ink); font-weight: 600; font-size: 14px; }
        /* inline-block with vertical padding so the link measures 24px tall. */
        .wr-back { display: inline-block; font-size: 14px; color: var(--slate); padding: 6px 0; }
        .wr-warn { background: var(--sand); color: var(--navy); border-radius: var(--radius); padding: 16px 18px; font-size: 14.5px; line-height: 1.6; margin-bottom: 22px; }

        /* ── filters ── */
        .wr-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
        .wr-filters button { font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; padding: 7px 13px; border-radius: 999px; border: 1px solid var(--line); background: var(--paper-2); color: var(--navy); }
        .wr-filters button.on { background: var(--navy); color: #fff; border-color: var(--navy); }
        .wr-count { opacity: .7; font-variant-numeric: tabular-nums; }

        /* ── list ── */
        .wr-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .wr-list li { background: var(--paper-2); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }
        .wr-row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; text-decoration: none; color: inherit; flex-wrap: wrap; }
        a.wr-row:hover { background: var(--paper); }
        .wr-row-main { flex: 1 1 200px; min-width: 0; display: block; }
        .wr-row-name { display: block; font-weight: 700; color: var(--navy); font-size: 16px; }
        .wr-row-sub { display: block; font-size: 13.5px; color: var(--slate); margin-top: 2px; }
        .wr-row-when { font-size: 13px; color: var(--slate); white-space: nowrap; }
        .wr-amount { font-weight: 700; color: var(--navy); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .wr-row-call { display: block; padding: 10px 16px; border-top: 1px solid var(--line); font-size: 14px; font-weight: 600; color: var(--gold-ink); background: var(--paper); }

        /* ── chips. Gold and sand are fills carrying navy, per the README. ── */
        .wr-chip { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
        .wr-chip-new { background: var(--navy); color: #fff; }
        .wr-chip-called { background: var(--gold); color: var(--navy); }
        .wr-chip-quoted { background: var(--sand); color: var(--navy); }
        .wr-chip-won { background: var(--paper-2); color: var(--navy); box-shadow: inset 0 0 0 2px var(--navy); }
        .wr-chip-lost { background: var(--paper-2); color: var(--slate); box-shadow: inset 0 0 0 1px var(--line); }

        /* ── detail ── */
        .wr-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 0; }
        .wr-facts dt { font-size: 12px; font-family: var(--font-mono), ui-monospace, monospace; letter-spacing: .1em; text-transform: uppercase; color: var(--slate); }
        .wr-facts dd { margin: 4px 0 0; font-size: 15.5px; color: var(--navy); }
        .wr-quote { margin-top: 18px; background: var(--paper-2); border: 1px solid var(--line); border-left: 3px solid var(--gold); border-radius: var(--radius); padding: 16px 18px; }
        .wr-quote p + p { margin-top: 10px; }
        .wr-status-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .wr-status-btn { font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; padding: 8px 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--paper-2); color: var(--navy); }
        .wr-status-btn.on { background: var(--navy); color: #fff; border-color: var(--navy); }
        .wr-status-btn:disabled { cursor: default; }
        .wr-notes { width: 100%; font: inherit; font-size: 15px; padding: 12px 14px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--paper-2); color: var(--navy); }
        .wr-notes:focus { border-color: var(--navy); }
        .wr-save-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 12px; }

        /* ── the facts form ── */
        .wr-group-note { margin: -4px 0 14px; }
        .wr-form { display: grid; gap: 16px; }
        .wr-field label { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-weight: 600; font-size: 15px; color: var(--navy); margin-bottom: 6px; }
        .wr-field input { width: 100%; font: inherit; font-size: 16px; padding: 12px 14px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--paper-2); color: var(--navy); }
        .wr-field input:focus { border-color: var(--navy); }
        .wr-field input[aria-invalid="true"] { border-color: #8c2b21; }
        .wr-help { font-size: 13.5px; color: var(--slate); margin-top: 6px; line-height: 1.5; }
        .wr-field-error { font-size: 13.5px; color: #8c2b21; font-weight: 600; margin-top: 6px; line-height: 1.5; }
        .wr-save-sticky { position: sticky; bottom: 0; background: var(--paper); padding: 14px 0 16px; margin-top: 30px; border-top: 1px solid var(--line); }

        /* ── the book ── */
        .wr-toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 18px; }
        .wr-search { flex: 1 1 260px; }
        .wr-search input { width: 100%; font: inherit; font-size: 16px; padding: 11px 14px; border: 1px solid var(--line); border-radius: 999px; background: var(--paper-2); color: var(--navy); }
        .wr-search input:focus { border-color: var(--navy); }
        .wr-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
        .wr-link { font: inherit; font-size: 14px; font-weight: 600; color: var(--gold-ink); background: none; border: 0; cursor: pointer; padding: 9px 2px; text-decoration: underline; text-underline-offset: 3px; }
        .wr-link:hover { color: var(--navy); }
        .wr-panel { background: var(--paper-2); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px 20px 18px; margin-bottom: 18px; }
        .wr-panel .wr-save-row { margin-top: 18px; }
        .wr-field select, .wr-field input[type="date"], .wr-field input[type="file"] { width: 100%; font: inherit; font-size: 16px; padding: 11px 14px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--paper-2); color: var(--navy); }
        .wr-field select:focus, .wr-field input[type="date"]:focus { border-color: var(--navy); }
        .wr-fieldset { border: 0; padding: 0; margin: 0; }
        .wr-fieldset legend { font-weight: 600; font-size: 15px; color: var(--navy); margin-bottom: 8px; padding: 0; }
        .wr-radio { display: flex; gap: 10px; align-items: center; font-size: 15px; color: var(--navy); padding: 6px 0; }
        .wr-radio input { width: 24px; height: 24px; accent-color: var(--navy); flex-shrink: 0; }
        .wr-pol { padding: 16px 18px; }
        .wr-pol-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
        .wr-pol-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .wr-actions { display: flex; gap: 8px 14px; align-items: center; flex-wrap: wrap; margin-top: 14px; }
        .wr-code { font-family: var(--font-mono), ui-monospace, monospace; font-size: 12.5px; line-height: 1.5; background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius); padding: 12px 14px; overflow-x: auto; margin: 12px 0; color: var(--navy); }
        .wr-errors { margin: 8px 0 0; padding-left: 20px; font-size: 14px; color: #8c2b21; line-height: 1.6; }
        .wr-panel code { font-family: var(--font-mono), ui-monospace, monospace; font-size: 13px; }

        /* ── gate, buttons, empty ── */
        .wr-gate { max-width: 380px; margin: 40px auto; }
        .wr-gate h1 { font-size: 30px; color: var(--navy); }
        .wr-gate form { margin-top: 20px; display: grid; gap: 8px; }
        .wr-gate label { font-weight: 600; font-size: 15px; color: var(--navy); }
        .wr-gate input { font: inherit; font-size: 16px; padding: 12px 14px; border: 1px solid var(--line); border-radius: var(--radius); background: var(--paper-2); color: var(--navy); }
        .wr-gate input:focus { border-color: var(--navy); }
        .wr-btn { display: inline-block; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; padding: 12px 20px; border-radius: 999px; border: 0; background: var(--navy); color: #fff; text-decoration: none; margin-top: 4px; }
        .wr-btn:disabled { opacity: .7; cursor: default; }
        .wr-empty { background: var(--paper-2); border: 1px solid var(--line); border-radius: var(--radius); padding: 30px 26px; }
        .wr-empty h2 { font-size: 21px; color: var(--navy); }
        .wr-empty p { margin-top: 10px; color: var(--slate); max-width: 60ch; }

        :where(.wr-main, .wr-chrome) :is(a, button, input, textarea):focus-visible { outline: 3px solid var(--navy); outline-offset: 2px; }
      `}</style>
    </>
  );
}
