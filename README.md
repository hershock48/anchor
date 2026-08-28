# Anchor Insurance

The website for **Anchor Insurance and Risk Management**, an independent agency
in Manchester, Michigan. Customer-facing surfaces say **Anchor Insurance**.

**Three client decisions landed on August 28, 2026, and the build changed
shape.** The third: **she brought her real logo**, a navy anchor with a gold
wave, and the whole visual system now derives from it. The mark is redrawn
from it in `components/Logo.tsx`, the palette moved from navy-and-red to
navy-and-gold (see the tokens trap below), the wordmark is serif capitals via
Cinzel, and the wave is the site's motion: it flows in the hero and slides in
once in the header. The first two:

First, the name. The site was built as "Insurance for a Cause," which was the
DBA, with Anchor as the legal entity behind it. The client folded everything
under the Anchor name. The old name auditioned as the tagline for a few hours
the same day and the client said no to that too: the tagline is **"Coverage
that gives back"** and the old name survives only as the structured-data
`alternateName`. If you find it anywhere else outside a history note, that is
a bug.

Second, the giving program. The build shipped as a receipts argument: a set
percentage, a published ledger, a homepage goal bar and a public vote. The
client dropped all of it. The program now says **a percentage of what we earn
goes back** without committing to the number, and the effort goes into
content: every cause gets a write-up on `/giving/causes` (who they are, why we
picked them, what came of it), with no amounts anywhere. The receipts suite
lives in git history before this date if it is ever wanted back. There is also
a Google-review ask on the homepage and contact page, gated on
`site.social.googleReview` like every other placeholder.

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
  --routes /,/coverage,/coverage/auto,/coverage/home,/coverage/renters,/coverage/umbrella,/coverage/life,/coverage/business,/giving,/giving/causes,/tools/michigan-pip,/guides,/guides/mini-tort,/guides/excess-attendant-care,/guides/storm-claims-after-march-6,/guides/why-your-rate-depends-on-where-you-live,/about,/contact,/quote,/quote/received,/privacy
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
`public/pitch/anchor/`. Those are hand-written static HTML on purpose
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
- [ ] **The Google review link** — `site.social.googleReview`. The direct
      write-a-review URL from the Business Profile dashboard, not the profile
      URL. The review ask renders a marked blank until it lands
- [ ] **The first cause write-up** — `giving.stories` is empty and
      `/giving/causes` says so honestly. Content comes from her, not from us
- [ ] **Her story** — `app/about/page.tsx`. Comes out of a recorded hour with her,
      in her words. The single most damaging thing on this site to invent
- [ ] **Privacy retention period** — `app/privacy/page.tsx`
- [ ] **Real photographs.** There are none. No stock, on purpose
- [ ] **The domain.** `site.url` assumes `anchorinsurancemi.com` and it is not
      bought, and after the rename the assumption is even softer than it was.
      `site.urlConfirmed` is `false`. It feeds `metadataBase` and the
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

**The mark is the client's own logo, TRACED, not approximated.** She brought
the logo on August 28, 2026, and the first vector attempt simplified it into a
generic anchor, which Kevin rejected on sight (the "it's not MY donut" failure
from glaze.md). `components/Logo.tsx` now carries a trace built with an
overlay-diff harness against the supplied image (Downloads/IMG_6500.jpg):
masks thresholded, landmark rows measured, paths iterated on top of the real
artwork. Every part is hers: the ring's inner highlight, the split shank, the
slit capsule caps, the sail fluke, the swoosh arrow, the layered water. **If a
change makes the mark "cleaner" but less like the image, it is wrong.** If her
original vector file ever lands, lift its paths verbatim and retire the trace.
The slits render in a `gap` color: pass the ground's color on dark grounds.

**The mark has no `id` and no gradient, on purpose.** `components/Logo.tsx`
renders in both the header and the footer. A component that can render twice
cannot own a fixed id, and two instances sharing a gradient id has painted a dark
square before. Color comes from props, which is also how the reversed and
one-color versions work with no duplicated geometry. **The one exception is
`AnchorHero`, which owns two mask ids and renders once, in the hero. Do not put
a second one on a page.**

**The hero's water flows INSIDE her ribbons.** `AnchorHero` never redraws the
gold: each ribbon shape becomes a clipPath and periodic shimmer strokes
translate exactly one period (120 user units) through it, looping invisibly,
while the whole anchor rocks. The animated layers are ~720 user units wide,
far under the ~4096px mobile compositing cap, and `motion-check` verifies
reduced motion leaves the still, complete logo.

**Two cuts, not one artwork at two sizes.** The three ribbons close into a
smear below about 30px, so `Mark` switches to one heavier wave, thicker strokes
and plain triangle flukes under that width. The favicon is built from the small
cut for the same reason.

**Cinzel is the wordmark face only.** The logo sets the name in Trajan-style
capitals; Cinzel (self-hosted, `--font-brand`) is the closest free face and it
appears in exactly two places, the header lockup and the footer wordmark. The
moment it becomes a heading font the lockup stops being the brand's voice.

**No `new Date()` in a rendered page.** It freezes at build time. That is why the
footer copyright has no year: a "dynamic" year that silently stops updating is
worse than no year.

**The palette is sampled from the logo, and the gold needs four tokens
because it is quiet.** `--navy` (#122C4E) and both golds come off the supplied
artwork: `--gold` (#C69F58) is the logo's lower ribbon and a FILL ONLY (as
text it is 2.23 on paper; white on it is 2.47), so **gold surfaces always
carry navy lettering** (5.68) and buttons are navy fills. `--gold-light`
(#D3BB90) is the logo's upper ribbon and gold as text on navy (7.54).
`--gold-ink` (#6F5415) is gold as text on light grounds, 6.43 on paper and
5.01 on sand. `--gold-deep` (#A8813A) is display-size only: 3.24 on paper
clears the 3:1 large-text bar and nothing else. The auditor has already caught
one softened gold (a 4.09 on the closeband) and one unstyled link on navy.
**Fix contrast at the token, never on the flagged element**, and validate
against BOTH light grounds; the sand band is where earlier faults hid.

**The logo has to know where home is.** On a pitch host `/` is the proposal, not
the site, so a brand link pointing at `/` throws the client out of their own
site and back into the sales document. `components/HomeLink.tsx` resolves it
from the hostname, and **its host pattern must stay in sync with `PITCH_HOSTS`
in `next.config.ts`.** Every other link is fine, because `/coverage` and the
rest are not rewritten on that host and Next serves them normally. `/` is the
single path that means something different depending on where you are.

**Ticker rails have a hard width budget.** Mobile GPUs commonly stop
compositing a layer past 4096px and older ones at 2048. The rails were 4,510px
and 11,488px, which is why they sat still on a phone while animating fine in a
desktop browser. They are 3,421px and 3,693px now, measured at 390px wide, and
`lib/ticker.ts` says so. **Adding items to either rail spends that budget.**
Re-measure if you add any.

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

The shape is the client's, chosen August 28, 2026: **no set percentage, no
ledger, no goal bar, no vote.** The site says a percentage of what we earn goes
back, and each supported cause gets a write-up on `/giving/causes` with no
amounts. The write-ups are the program's public face, and `giving.stories` in
`lib/site.ts` is where they live. Never seed a fake one.

Michigan DIFS publishes six conditions on a producer donating commission. They
still apply, because the money is still commission and the giving is still
advertised. Two are load-bearing here:

- The donation must be **offered uniformly** and not tied to specific
  transactions. So the site never says "your policy bought X."
- The insured **must not control** which organization receives the donation.
  The agency picks the causes itself, and there is no choose-your-charity
  control on the quote form. Do not add one.

A third is operational: **the recipient must not be a client of the producer.**
That is published in the footer, because saying it out loud is both good faith
and compliance.

Her attorney or E&O carrier signs off on the program, not us. DIFS closes its own
FAQ recommending counsel.

---

## Done, measured against `glaze/launch.md`

The checklist below is that file's, copied here because launch.md says it is the
handover artifact rather than a private note. Ticked means measured, not assumed.

### Correctness

- [x] Zero accessibility violations at 390px and 1440px on every route. **21 routes, 0 violations.**
- [x] Zero console errors, zero 4xx, on every route.
- [x] `grep -rn PLACEHOLDER` returns only hits that are on the list above. **17, all in `lib/site.ts`, of which three are the marker mechanism itself.**
- [ ] **Every form actually submitted and confirmed arriving in a real inbox.** Not
      done and cannot be: there is no inbox yet. The handler logs the full payload
      and warns. See below.
- [x] Any remote data source verified on the deployment, not locally. **The market
      rail degrades to symbols with no prices if either upstream is down, so a
      failure is visible rather than silent. Re-check it on the deployment.**
- [x] Every heading, button and body run measured for contrast, not glanced at.

### The visitor's experience

- [x] Checked at 320, 390, 768 and 1440. Clean at all four.
- [x] Reduced motion produces a complete page. Rails stop, underline is fully
      drawn, both marks present, no reveal hidden.
- [x] With JavaScript off, every form still submits and every nav link still
      works. **7 of 7 header links reachable at 320, 390 and 1280.**
- [x] Keyboard: focus visible on every interactive element, skip link first in tab order.
- [x] LCP **1.03s** (bar 2.5s), CLS **0.0009** (bar 0.1), first-load JS **139KB
      gzipped** (bar 150KB). Measured on a throttled mobile profile: 4x CPU,
      1.6Mbps, 150ms latency.

### Search and sharing

- [x] Every route has its own title and meta description. No duplicates.
- [x] `og:image` absolute, on an origin that serves it, resolves 200 as an image.
- [x] Canonical points at the client's domain once `site.urlConfirmed` is true,
      and at the deployment host until then. Never at a host that answers nothing.
- [x] `InsuranceAgency` structured data on the homepage, a LocalBusiness subtype.
      **Address, phone and hours are omitted rather than filled with placeholders**,
      and appear automatically when the facts land in `lib/site.ts`.
- [x] `sitemap.xml` and `robots.txt` present, crawling allowed, pitch and preview
      hosts `noindex` by header.

### Security and handover

- [x] HTTPS enforced.
- [x] `npm audit --omit=dev`: **0 vulnerabilities.** Next is pinned at 16.3.1
      because 15.5.4 ships a published CVE and the only clean fix was Next 16.
- [x] No secret in the repo, in a commit, in a README, or in any file here.
- [x] Studio credit placed, plate ground computed with `plate.mjs`. **Telling the
      client it is there is still outstanding and is on the launch list below.**
- [x] README written: what it is, how to run it, where content lives, every trap
      named, decisions with reasoning, and this checklist.

### Faults this pass found

Reading `launch.md` properly turned up four things the earlier passes missed
entirely, and one of them was introduced by the fix for another.

**No structured data at all.** The Griffin Claw proposal makes "no `LocalBusiness`
schema anywhere" one of its findings, so shipping without it would have been us
charging for the thing we were doing.

**No canonical, and `metadataBase` pointed at a domain that does not exist.**
`insuranceforacause.com` is not bought, so every card and canonical resolved to a
host that answers nothing. `lib/url.ts` now resolves the real domain when
`site.urlConfirmed` is true and the deployment host until then, so it is correct
in both states and switches by itself.

**One reachable nav link at 390px with JavaScript off.** The burger was rendered
server-side and inert without React.

**CLS 0.3947, caused by the fix for the line above.** Rendering the mobile list
expanded and collapsing it on hydration shipped a header ~365px taller than it
ends up, so the whole page jumped upward when React arrived. It only appears on a
throttled connection, which is the profile a real phone has and a desktop test
does not. The mobile menu is now a native `<details>`: collapsed in the server's
HTML so nothing moves, open without JavaScript so every link is reachable.
**0.3947 to 0.0009.**

## The pitch, in this repo

| Path | What it is |
|---|---|
| `public/pitch/anchor/index.html` | The proposal. Self-contained, no build step |
| `public/pitch/anchor/logo.html` | The logo presentation and mockups. **Send this first** |
| `public/pitch/anchor/og.jpg` | The proposal's link card, 1200x630 |
| `public/og.jpg` | The **demo's** link card. Hers, not Glazed's |
| `tools/og-card.html` | The proposal card is rendered from this |
| `tools/demo-og-card.html` | The demo card is rendered from this |

On `anchor.glazedweb.com`: proposal at `/`, logo at `/logo`, the whole
site at `/demo`. Every path on that host sends `X-Robots-Tag: noindex, nofollow`,
and so does any `.vercel.app` host, which is indexable by default and the same
duplicate-content risk.

The proposal is priced **$3,500 build, $150 a month**, and it points at the demo
in six places: the hero button, a band at the top of "What we built", deep links
into `/demo/giving`, `/demo/quote` and `/demo/tools/michigan-pip`, and the
closing ask.

**The pitch host is matched by pattern, not by name: any `*.glazedweb.com`
subdomain, plus any `*.vercel.app` preview.** It started as the single literal
`insuranceforacause.glazedweb.com` and that was wrong twice. The subdomain
actually created was **`anchor.glazedweb.com`**, named for the repo rather than
the DBA, so nothing matched. And scoping to the custom domain alone left `/logo`
and `/demo` returning 404 on the preview URL, which is the host you open before
DNS is pointed. **On any pitch host the root is the proposal, not the site**; the
site is at `/demo`.

**`vercel.json` declares `framework: nextjs` and nulls `outputDirectory` on
purpose.** This repo began life as a static-only pitch with
`"outputDirectory": "public"`, and Vercel saved that into the *project settings*
when it was first imported. Dashboard settings survive deleting the file, so the
project kept serving `public/` as a flat directory: `next build` ran and
succeeded, the pitch's `index.html` returned 200, and every route
that needed the Next app returned Vercel&rsquo;s own `NOT_FOUND`. **A green build
proves nothing about what is being served.** `vercel.json` takes precedence over
project settings, which is what clears it from in here.

---

## What is not in this repo

The research behind the content: the Michigan DIFS conditions, the eight-agency
survey of giving pages, the PIP and market research, and the discovery work on how
a new agency actually gets found in 2026. Ask Kevin.
