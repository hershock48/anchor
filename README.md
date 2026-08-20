# Insurance for a Cause

The website for **Insurance for a Cause**, the trade name of **Anchor Insurance
and Risk Management**, an independent agency in Marshall, Michigan.

Next.js App Router, TypeScript, plain CSS, deployed on Vercel. **Prospect, not
signed** as of August 2026: this is a concept build, and the pitch that goes with
it lives in this same repo under `public/pitch/`.

Read `glaze.md` in the `glazedweb` repo before touching this. The rules this
build follows are in `glaze/launch.md` (definition of done), `glaze/brand.md`
(the studio mark and credit), `glaze/intake.md` (the facts still missing) and
`glaze/proposal.md` (the host split).

---

## Run it

```bash
npm install
npm run dev            # localhost:3000
npm run build && npm start
```

**Audit the production build, never the dev server.** Dev serves different CSS
and hides build-time failures.

```bash
npm install axe-core playwright-core --no-save
npx next start -p 4502
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node ../glazedweb/glaze/scripts/audit.mjs --base http://127.0.0.1:4502 \
  --routes /,/coverage,/coverage/auto,/coverage/home,/coverage/renters,/coverage/umbrella,/coverage/life,/coverage/business,/giving,/giving/ledger,/tools/michigan-pip,/guides,/guides/mini-tort,/guides/excess-attendant-care,/guides/why-your-rate-depends-on-where-you-live,/about,/contact,/quote,/quote/received,/privacy
```

---

## Where content lives

**`lib/site.ts` is the one file.** Every business fact is there: the names, the
phone, the address, hours, license numbers, carriers, and the whole giving
program. A correction is one edit.

| File | What it holds |
|---|---|
| `lib/site.ts` | Agency facts, contact, license, carriers, the giving program |
| `lib/pip.ts` | Michigan PIP levels and savings. **Source of truth for those numbers** |
| `lib/guides.ts` | The local explainer articles |

**The one surface that cannot read from `lib/site.ts`** is the pitch, at
`public/pitch/insuranceforacause/`. Those are hand-written static HTML on purpose
so they can be edited on a phone if a call goes sideways. If a fact changes
before she signs, it has to change in both places. After she signs the pitch gets
deleted and the problem goes away.

---

## Placeholders: what is not real yet

Everything below renders as a visibly marked blank rather than a guess. **Say
this out loud at handover.** A placeholder that ships silently reads to a visitor
as a real number, and that has already put invented prices in front of real
customers on another build.

- [ ] **Owner name** — `site.owner.name`. Also on the logo page in the pitch.
- [ ] **Amanda's role** — `site.owner.second`. We know she exists, not what she does.
- [ ] **Phone**, and the digits-only form for `tel:` links
- [ ] **Email**
- [ ] **Street address and ZIP**, and whether there is a walk-in office at all
- [ ] **Hours**, including the seasonal exception and the one day that is different
- [ ] **Michigan producer license number and NPN**
- [ ] **Carrier appointments** — `site.carriers` is an empty array and the homepage
      says so in words rather than showing a logo wall we are not entitled to
- [ ] **The giving percentage** — `giving.rate`. Never ship "a portion of proceeds"
- [ ] **First cause, target, deadline** — `giving.goal`
- [ ] **Her story** — `app/about/page.tsx`. Comes out of a recorded hour with her,
      in her words. The single most damaging thing on this site to invent
- [ ] **Privacy retention period** — `app/privacy/page.tsx`
- [ ] **Real photographs.** There are none. No stock, on purpose
- [ ] **The domain.** `site.url` assumes `insuranceforacause.com` and it is not
      bought. `site.urlConfirmed` is `false`. It feeds `metadataBase` and the
      sitemap, so it is load-bearing

---

## Traps

**The host split is in `beforeFiles` and has to stay there.** A plain `rewrites()`
array is `afterFiles`, which only runs once Next has failed to find a page, and
`app/page.tsx` already answers `/`. Put these in the wrong bucket and the pitch
host silently serves the client's homepage. Host scoping rather than
`basePath: "/demo"`, because basePath is global to a build and would bury the real
site under `/demo` the day the domain goes live.

**The quote form must keep working with JavaScript off, and that is not
automatic.** The first version shipped `hidden` on step two and `disabled` on the
submit, both rendered server-side, so a visitor without JS saw one step and could
never submit. Stepping now lives in a `.stepped` class the client adds after
mount, and `disabled` is gated on `ready`. **If you reintroduce `hidden={...}` on
a fieldset you break the no-JS path and nothing will tell you.** Test it:

```js
const ctx = await browser.newContext({ javaScriptEnabled: false });
```

**A hidden submit button is still the form's default button.** Enter from step one
submits unless the button is actually `disabled`. `hidden` alone does not stop it.

**`Reveal` re-arms on navigation.** `usePathname()` is in the dependency array on
purpose. Queried once on mount, it hides the next page's elements forever and
every internal link lands on a blank page while the URL and the nav highlight both
change correctly and nothing errors. A navigation test that does not assert
visibility will not catch it.

**`.reveal` only hides underneath `.js`.** The un-animated state is the finished
state. Move the opacity rule out from under that selector and a blocked script
ships a blank page.

**The mark has no `id` and no gradient, on purpose.** `components/Logo.tsx`
renders in both the header and the footer. A component that can render twice
cannot own a fixed id, and two instances sharing a gradient id has painted a dark
square before. Color comes from props, which is also how the reversed and
one-color versions work with no duplicated geometry.

**Two cuts, not one artwork at two sizes.** The rope hole closes into a smudge
below about 30px, so `Mark` switches to a solid heart under that width. The
favicon is built from the solid cut for the same reason.

**No `new Date()` in a rendered page.** It freezes at build time. That is why the
footer copyright has no year: a "dynamic" year that silently stops updating is
worse than no year.

**Three color tokens, each validated against BOTH light grounds.** `--brick` is a
fill color, white on it is 5.37. `--brick-ink` is red as *text*, because `--brick`
measures only 3.79 as text on `--sand`. `--slate` is 6.39 on paper and 4.99 on
sand. The sand band is a second ground and forgetting it is exactly how two
violations got in. **Fix contrast at the token, never on the flagged element.**

**Wide tables scroll inside themselves.** `.tablewrap` carries `tabIndex={0}` and a
`role`, because a scroll container is otherwise unreachable by keyboard.

---

## The quote form has no inbox yet

`app/api/quote/route.ts` **logs the full submission and always succeeds for the
visitor.** It does not pretend to deliver. There is a warning in the log on every
submission until `QUOTE_TO` is set.

This is the honest behavior when a form has no confirmed destination: accept it,
tell the visitor the truth, and write the whole payload to the log so nothing is
lost. What is not acceptable is a stub that waits half a second and says "Thanks,
we got it" while sending nowhere.

**To finish it:** set `QUOTE_TO` and the `SMTP_*` variables in the Vercel
dashboard, then implement `deliver()`. SMTP through a mailbox the agency already
owns, not a hosted API with its own subscription. If she has no mailbox yet, send
from a `glazedweb.com` address with `replyTo` set to the customer so her DNS work
is never on the critical path. See `.env.example`.

**PII.** The form deliberately does not ask for dates of birth, license numbers or
VINs. Those come up on the call. What it does collect is logged, not stored, and
`app/privacy/page.tsx` says so. **If the handler changes, that page changes with
it.**

---

## The giving program, and why it is shaped this way

Michigan DIFS publishes six conditions on a producer donating commission. Two are
load-bearing here:

- The donation must be **offered uniformly** and not tied to specific
  transactions. So the site never says "your policy bought X."
- The insured **must not control** which organization receives the donation. So
  the cause is picked by a **public vote open to anyone**, not by a
  choose-your-charity control on the quote form. Do not add one.

A third is operational: **the recipient must not be a client of the producer.**
That is published on the giving page and in the footer, because saying it out loud
is both good faith and compliance.

Her attorney or E&O carrier signs off on the program, not us. DIFS closes its own
FAQ recommending counsel.

---

## Verified state, August 20 2026

Production build, 20 routes:

```
axe violations total: 0
horizontal overflow:  none
console errors:       none
4xx/5xx:              none
```

- Overflow separately checked at **320, 390, 768 and 1440**. Clean at all four.
- Every route has its **own** title and meta description. No duplicates.
- Homepage first-load JS: **138 KB gzipped**, against a 150 KB bar. Measured from
  the chunks on disk. *(Note for whoever re-measures: fetching the chunks through
  Playwright's request API reports about 465 KB because it decompresses them.
  Gzip the files on disk instead.)*
- **JavaScript off:** both fieldsets visible, one enabled submit, the form posts
  and redirects to `/quote/received`, and the payload appears in the log. No
  `.reveal` element is hidden.
- **JavaScript on:** stepping works and the step-two submit is disabled on step one.
- Production dependency audit: **0 vulnerabilities.**

### Faults found and fixed on the way here

**Next 15.5.4 ships with a published CVE** and the only clean fix was Next 16.
Greenfield build, so the migration cost was zero. Pinned at 16.3.1.

**The no-JS form was broken**, described above. This is the one worth
remembering, because the build was green and the page looked perfect.

**Two contrast violations**, both from tokens validated against `--paper` while
`--sand` went unchecked.

**The PIP table pushed the page to 501px at a 390px viewport.**

**`/quote` was dynamic** because it awaited `searchParams`, so the router's
prefetch 307'd and then failed in the console on every page linking to it.

**There was no favicon at all**, which is what that console 404 turned out to be.

---

## Before launch

Worked from `glaze/launch.md`. Everything under **Placeholders** is also on this
list.

- [ ] Every placeholder filled or consciously kept
- [ ] Real photographs of her, the office and the town. No stock
- [ ] Carrier appointments confirmed, **and their marketing rules read.** Several
      carriers restrict use of their mark and a few require marketing review
- [ ] The giving program in front of her attorney or E&O carrier
- [ ] `QUOTE_TO` and SMTP set, `deliver()` implemented, **and a test submission
      confirmed arriving in a real inbox.** Those are two separate things
- [ ] Google Business Profile, plus Yelp and BBB. Counterintuitive for insurance,
      but that is where AI answers pull local citations from
- [ ] A review request wired into the post-bind workflow. Roughly half of people
      will not use a business with fewer than twenty reviews, and three quarters
      want to see reviews from the last three months. **This will probably do more
      for her than half of this website will**
- [ ] Domain bought and pointed, `site.url` updated
- [ ] Link cards checked in Messages and one non-Apple surface. **Two of them:**
      `public/pitch/insuranceforacause/og.jpg` is Glazed's argument in Glazed's
      colors and is what the proposal link shows. `public/og.jpg` is hers
      entirely and is what the demo link shows. Getting them backwards is the
      common mistake
- [ ] The studio credit is on. It is `Baked by`, not `Double Dipped by`: a donut
      pun does not belong next to somebody's license number while they are
      deciding whether to trust an agency with their house. Tell her it is there;
      removing it is one line
- [ ] Delete `public/pitch/` and the pitch rewrites once she signs or passes

---

## The pitch, in this repo

| Path | What it is |
|---|---|
| `public/pitch/insuranceforacause/index.html` | The proposal. Self-contained, no build step |
| `public/pitch/insuranceforacause/logo.html` | The logo presentation and mockups. **Send this first** |
| `public/pitch/insuranceforacause/og.jpg` | The proposal's link card, 1200x630 |
| `public/og.jpg` | The **demo's** link card. Hers, not Glazed's |
| `tools/og-card.html` | The proposal card is rendered from this |
| `tools/demo-og-card.html` | The demo card is rendered from this |

On `insuranceforacause.glazedweb.com`: proposal at `/`, logo at `/logo`, the whole
site at `/demo`. Every path on that host sends `X-Robots-Tag: noindex, nofollow`,
and so does any `.vercel.app` host, which is indexable by default and the same
duplicate-content risk.

The proposal is priced **$3,500 build, $150 a month**, and it points at the demo
in six places: the hero button, a band at the top of "What we built", deep links
into `/demo/giving`, `/demo/quote` and `/demo/tools/michigan-pip`, and the
closing ask.

**The pitch rewrites match the `*.vercel.app` preview host as well as the custom
domain.** Scoped to the domain alone, `/logo` and `/demo` return 404 on the
preview URL, which is the one you open before DNS is pointed. Both hosts are
noindex. **On the preview host the root is the proposal, not the site**; the site
is at `/demo`.

---

## What is not in this repo

The research behind the content: the Michigan DIFS conditions, the eight-agency
survey of giving pages, the PIP and market research, and the discovery work on how
a new agency actually gets found in 2026. Ask Kevin.
