# Anchor Insurance

The website for **Anchor Insurance and Risk Management**, an independent agency
in Manchester, Michigan. Customer-facing surfaces say **Anchor Insurance**.

**Three client decisions landed on August 28, 2026, and the build changed
shape.** The third: **she brought her real logo**, a navy anchor with a gold
wave, and the whole visual system now derives from it. The mark is the
artwork itself (see the mark trap below), the palette is sampled from it, the
wordmark is serif capitals via Cinzel, and the motion is a swing: the logo
hangs from a line in the hero. The first two:

First, the name. The site was built as "Insurance for a Cause," which was the
DBA, with Anchor as the legal entity behind it. The client folded everything
under the Anchor name. The old name auditioned as the tagline for a few hours
the same day and the client said no to that too: the tagline is **"Coverage
that gives back"** and the old name survives only as the structured-data
`alternateName`. If you find it anywhere else outside a history note, that is
a bug.

Second, the giving program, which has now simplified TWICE. The build shipped
as a receipts argument: a set percentage, a published ledger, a homepage goal
bar and a public vote. On August 28 the client dropped all of it for plain
words plus a write-up per cause on `/giving/causes`. On September 1 the
write-ups went too: the site is the landing page and the business card, and
**the causes themselves are posted on her social accounts as they happen.**
The site says **a percentage of what we earn goes back** without committing to
the number, and points at the posts; the Facebook pointer is gated on
`site.social.facebook` and renders as plain copy until the real URL lands.
`/giving/causes` is deleted and 308-redirects to `/giving`. Receipts suite,
causes page and `giving.stories` all live in git history if ever wanted back.
There is also a Google-review ask on the homepage and contact page, gated on
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
  --routes /,/coverage,/coverage/auto,/coverage/home,/coverage/renters,/coverage/umbrella,/coverage/life,/coverage/business,/giving,/tools/michigan-pip,/guides,/guides/mini-tort,/guides/excess-attendant-care,/guides/storm-claims-after-march-6,/guides/why-your-rate-depends-on-where-you-live,/about,/contact,/quote,/quote/received,/privacy,/intake,/intake/sent,/workroom
```

The workroom's signed-in screens sit behind the passcode, so audit them with
the auditors' `--cookie` flag. The cookie value is the sha256 hex of
`anchor-workroom-v1:<passcode>` (see `lib/workroom/auth.ts`), and the server
must have been started with that same `WORKROOM_PASSCODE`:

```bash
node ../glazedweb/glaze/scripts/audit.mjs --base http://127.0.0.1:4502 \
  --cookie anchor_workroom=<sha256 hex> --routes /workroom,/workroom/facts
```

---

## Where content lives

**`lib/site.ts` is the one file.** Every business fact is there: the names, the
phone, the address, hours, license numbers, carriers, and the whole giving
program. A correction is one edit.

**Since September 1, 2026, she can make some of those edits herself**, from
the site-facts screen in the workroom (`/workroom/facts`). The fields she can
touch are whitelisted in `lib/workroom/facts-def.ts` (owner name, phone,
email, street, city, ZIP, the three hours rows, producer number, NPN, the
Facebook page and the Google review link) and nothing else. `lib/content.ts`
lays her stored edits over `lib/site.ts`, and **every customer page reads
those fields through `getFacts()`**, never from `site` directly. `site.ts` is
still the seed and the safety net: an edit never destroys a value there, and
clearing a box restores it. A fact that is still a placeholder shows on that
screen as an empty box marked "Blank on the site", which makes the screen the
handover checklist she can work through on her own phone.

| File | What it holds |
|---|---|
| `lib/site.ts` | Agency facts, contact, license, carriers, the giving program |
| `lib/content.ts` | The seam: `site.ts` with her workroom edits laid over it. Read this on customer pages |
| `lib/workroom/facts-def.ts` | Which facts the workroom may edit, with labels, kinds and checks. Client-safe |
| `lib/pip.ts` | Michigan PIP levels and savings. **Source of truth for those numbers** |
| `lib/guides.ts` | The local explainer articles |

**Two surfaces cannot read from `lib/content.ts`.** The pitch, at
`public/pitch/anchor/`, is hand-written static HTML on purpose so it can be
edited on a phone if a call goes sideways; if a fact changes before she signs,
it has to change in both places, and after she signs the pitch gets deleted
and the problem goes away. And `components/Header.tsx` is a client component
(it reads the pathname), so it cannot call the server-only seam: the site
layout resolves the phone and hands it down as props. Any new client
component that shows a fact gets it the same way.

---

## Placeholders: what is not real yet

Everything below renders as a visibly marked blank rather than a guess. **Say
this out loud at handover.** A placeholder that ships silently reads to a visitor
as a real number, and that has already put invented prices in front of real
customers on another build.

Most of these she can now fill in herself at `/workroom/facts` (the ones
marked with a `site.` path below, plus hours and the review link); the rest
still need an edit here. Either way the box stays unticked until the value is
real.

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
- [ ] **The Facebook page URL** — `site.social.facebook`. It is where the giving
      specifics will live now, so the giving page and the giving card point at it
      once it lands; until then they read as plain copy with no link
- [ ] **Her story** — `app/(site)/about/page.tsx`. Comes out of a recorded hour with her,
      in her words. The single most damaging thing on this site to invent
- [ ] **Privacy retention period** — `app/(site)/privacy/page.tsx`
- [ ] **Real photographs.** There are none. No stock, on purpose
- [ ] **The domain.** `site.url` assumes `anchorinsurancemi.com` and it is not
      bought, and after the rename the assumption is even softer than it was.
      `site.urlConfirmed` is `false`. It feeds `metadataBase` and the
      sitemap, so it is load-bearing

---

## Traps

**The host split is in `beforeFiles` and has to stay there.** A plain `rewrites()`
array is `afterFiles`, which only runs once Next has failed to find a page, and
`app/(site)/page.tsx` already answers `/`. Put these in the wrong bucket and the pitch
host silently serves the client's homepage. Host scoping rather than
`basePath: "/demo"`, because basePath is global to a build and would bury the real
site under `/demo` the day the domain goes live.

**Every indexable page sets its own canonical, and the site layout sets
none.** From September 2 to September 16, 2026 the `(site)` layout carried
`alternates: { canonical: "/" }` and `openGraph.url: "/"`. Layout metadata is
inherited by every page beneath it, so every route on the site (about, each
coverage page, each guide) told search engines and link scrapers that it was
the homepage: one duplicated page, and every shared link collapsing to `/`.
Each page now carries `alternates: { canonical: "/its/path" }` in its own
metadata; the noindex pages (intake, the bill, the thank-you pages) set none.
**A new indexable page needs its own line**, or it ships with no canonical at
all, which is the lesser fault but still one. Verify with
`curl -s <url> | grep canonical` on any inner page.

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

**The mark is the client's artwork ITSELF. Do not vectorize it again.** Two
recreations died here in three days: a simplified generic anchor (rejected on
sight, the "it's not MY donut" failure from glaze.md) and then a faithful
trace (still not the thing). The client's call on August 31, 2026: use the
logo they have. `public/brand/anchor-mark.png` is her file
(Downloads/IMG_6500.jpg) cropped with the white background keyed to alpha,
and `components/Logo.tsx` renders that image. Nothing draws the anchor
anywhere in this repo any more.

**Two files, one artwork, and each belongs to its ground.** The original
(`anchor-mark.png`) is navy-on-light. The reversed cut
(`anchor-mark-reverse.png`, `Mark`'s `reverse` prop) exists for dark grounds
and is made by RECOLORING her pixels, navy to white with the gold untouched,
never by redrawing; the keyed slits let the ground show through, which is
what a real reversed logo does. **Never put the navy original on a dark
ground** (it vanishes) **or the reversed cut on a light one.** The favicon
keeps its light tile because launcher and tab grounds are unknowable.

**The motion is a swing, and only a swing.** Per the client, explicitly, and
with no plate behind it, also per the client. The hero hangs the reversed
anchor from a line and rotates it about the top of the line, because an
anchor on a line rotates about where it is held. Reduced motion leaves it
hanging still, which is the finished state. The header mark does not animate
at all.

**The source is a phone-screenshot JPEG, and that is a known limit.** It is
sharp at every size the site renders (the largest is ~230px against a 380px
asset), but print work or anything larger needs her original file. When it
lands, re-key `anchor-mark.png` from it and nothing else changes.

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
VINs. Those come up on the call. What it does collect is logged AND stored as a
lead in the workroom, and `app/(site)/privacy/page.tsx` says so in those words.
The same page has a "Payments" section saying flatly that the site takes
none, holds no card or policy numbers and keeps no customer list; keep all
three in agreement.
**If the handler changes, that page changes with it** — it already had to once:
the page read "logged, not stored" until the leads queue made that untrue, which
is exactly the failure this note exists to catch.

---

## The intake sheet, at /intake

**Every placeholder above has a matching question on `/intake`**, a form the
client fills in herself, linked from the proposal's closing band. Everything on
it is optional except her name, because the intake standard's point is that a
half-filled sheet still unblocks half the site. It is not in the nav, not in the
sitemap, and carries its own robots noindex, because the pitch host's noindex
header stops protecting it the day the real domain goes live.

**The form is a plain POST underneath, with JavaScript layered on for the two
things that protect her time.** With scripts off it submits like any form (no
stepping, so nothing to break). With scripts on: every answer saves to
localStorage on her own device as she types (debounced, flushed on pagehide
because a phone discards backgrounded tabs) and restores into empty fields on
return, so closing the page loses nothing; and submit goes over fetch, so a
network failure shows an error next to the button with her answers still on
screen and still saved, instead of a browser error page. The draft clears only
after a confirmed send, from both the fetch path and `/intake/sent`, and the
key both sides share lives in `lib/intake-draft.ts`. Restore fills EMPTY fields
only, so the browser's own back-forward restore is never clobbered, and the
"saved on this device" promise renders only after a probe write succeeds. Same
honeypot as the quote form.

**Delivery is implemented here, unlike the quote form**, because this form's
destination is Kevin rather than a mailbox that does not exist yet. It sends
over Resend from the verified `glazedweb.com` domain. `INTAKE_TO` and
`RESEND_API_KEY` (a sending-only key scoped to this project) are set in the
Vercel dashboard, and delivery is confirmed: a labeled test submitted through
production on September 1, 2026 arrived in Kevin's inbox. If either variable
is ever removed, submissions are still logged in full, a warning appears in
the log, and the visitor still succeeds, so nothing is lost while it is down.
The subscription rule in glaze.md protects the client from renting
infrastructure; this is studio mail on the studio's account, and she can leave
with her site and never touch it.

On the pitch host `/intake` needs no rewrite: only `/`, `/logo` and `/demo` are
rewritten, so the Next app serves it there like any other route, wrapped in the
site's own header and footer, which is the point. She fills in her site from
inside her site.

## The agreement and the build page live on the studio site

**Since September 10, 2026 the deal is not in this repo.** It follows the
True North shape: an `anchor` row in glazedweb's `lib/customOrders.js`
renders `glazedweb.com/agreement/anchor` (the published v1.1 terms
incorporated by reference, Exhibit A with the scope and the numbers, three
real screens of the build, the card form for the build fee, and the
clickwrap acceptance) and `glazedweb.com/build/anchor`, the project page:
where things stand, the twelve things only she can supply, what happens in
what order, her stuff, and a **try-it-yourself list** (walk a quote, open
the workroom, change a fact). Exhibit A carried online-payment terms as
part 3 until 17 September 2026; they came out with the checkout, and the
registry row is the only place either number is typed by hand. The proposal's one action is the build page
("Launch"), with the agreement, the try-it list, the intake sheet and
Kevin's email as plain links under it.

The in-repo `/agreement` page, its form, its API route and its
`agreement_acceptances` collection were removed the same day;
`next.config.ts` sends the old URL to the new one, and the empty table in
Neon is harmless. The paper twin stays in the private contracts folder.
The two numbers that repeat by hand are named in the registry row: this
proposal's prose, and that paper draft.

## The workroom: her dashboard, at /workroom

**The agency's own tool, not part of the customer site.** Two screens behind a
passcode: the **leads queue** (every quote request, worked through statuses
new → called → quoted → won/lost, with her own notes per lead) and **site
facts** (her phone, email, address, hours, license numbers and two links,
edited in place and live on the site within seconds).

It was four screens until 17 September 2026. The **book** (every customer
and policy she bills, with the pay link, the "email them the bill" button
and the payment history for each) and **payments** (a read-only window onto
Stripe) left with the checkout, because a book whose pay links are dead is
worse than no book at all. Both are on the archive branch.

**The facts screen is a form over a whitelist, and the whitelist is the
safety.** `lib/workroom/facts-def.ts` says which fields exist, what kind each
is and what a bad value looks like; the screen renders from it, the save
route validates against it, and `lib/content.ts` merges by it, so a field
that is not listed cannot be edited from the workroom at all. Saves are
stored as EDITS over `lib/site.ts`, never as replacements: only a value that
differs from the checked-in one is kept, a box cleared back to the original
drops its edit, and deleting the whole table puts the site back exactly as
built. After a save the route calls `revalidatePath("/", "layout")`, so every
customer page stays static and re-renders with the new value on its next
request. On the memory backend the screen says so, because an edit that
vanishes on the next cold start is worse than one that was refused.
**Measured on production, September 1, 2026:** a phone saved through the
API showed on `/demo`, `/demo/contact`, `/demo/about` and `/demo/quote` one
second later (Vercel reporting `REVALIDATED` on that first hit, `HIT` after),
and clearing it emptied all four in the same second. Against her real Neon
database, with the test value cleared afterward.

**The first deploy of this screen failed, and the fix is in the store.** The
customer pages now read the facts at build time, Next prerenders with
several workers, and two of them ran `CREATE TABLE IF NOT EXISTS` in the
same instant on a database with no tables yet; Postgres's `IF NOT EXISTS`
is not atomic against a concurrent creator, so the loser died on the
`pg_type` unique index and took the build with it. The init now takes an
advisory lock in its transaction and treats a duplicate-object error as
"the table is there". If a build ever fails on `23505` or `42P07` again,
look here first.

**It is not in the nav, not in the sitemap, and carries its own noindex.** It
lives outside `/demo` on purpose (devine's reasoning): it is hers, and it does
not move when the site graduates to the real domain.

**Quote requests are now STORED, not just logged.** Before this they existed
only in the Vercel log, which loses nothing but is not a list you can call
through on a Tuesday. `/api/quote` writes a lead row and still logs the full
payload, so a storage failure costs the list, never the submission.

**The gate is `WORKROOM_PASSCODE`, and the minimum is four characters.** It
shipped at eight, on the argument that this guards customer names, phones,
emails and addresses and a four-digit code on the public internet is 10,000
guesses. Kevin set her code at four digits on September 1, 2026, for the
better reason that a code she keeps in her head beats a longer one written on
a sticky note, and the minimum came down to match with the login rate limiter
tightened from ten misses to five per ten minutes per address. Two rules
inherited from devine and one added still hold: an unset (or too short)
variable **closes** the door in production rather than fitting a known lock
(devine's fallback was the shop's own published phone number), the login
route is rate limited, and **the cookie carries a hash rather than the
passcode itself**, so a stolen cookie does not hand over a secret that
outlives the session.

**Nothing behind the gate can move money**, and since the checkout left there
is no money for it to move. The facts screen changes only what the site
already publishes, and the built-in value is one clear-and-save away. If a
screen ever grows a button that charges or refunds, it needs a real login
before it ships, not this passcode.

**Storage is `DATABASE_URL`, or memory.** Postgres when set (Vercel > Storage
> Neon, free tier, part of the hosting she already has, so the "nothing
rented" rule holds); tables create themselves, one for leads and one
key-to-jsonb table for the facts. The store accepts any variable ending in
`_DATABASE_URL` or `_POSTGRES_URL` too, because the Neon integration has
injected prefixed names on other projects and nobody should hand-copy a
secret between env rows. Without it the workroom runs on in-memory storage
and **says so on screen**, because on serverless the queue can then miss
leads that landed on another instance. Ported from devine's store, including
the lesson in its header: a failed schema init must not be cached, or one
unlucky cold start leaves that instance permanently broken.

**`lib/workroom/leads.ts` must stay free of `server-only` and of `pg`.** The
screens import `LEAD_STATUSES` as a value, and a value import reaches through
to the whole module: `pg` followed it into the client bundle and the build
failed on `util/types`. Types alone are erased; a constant is not. Anything
touching a connection belongs in `store.ts`.

**The route group is why the workroom has no shopfront.** `app/(site)/` holds
every customer page and owns the header, footer, skip link, reveal system,
structured data and the `<main>` landmark; the root layout is now the document
and nothing else. Route groups do not appear in URLs, so every path is
unchanged. This was not tidying: rendering the workroom inside the old root
layout gave it the customer header **and** a second nested `<main id="main">`,
which the auditor caught as three landmark violations on every workroom screen
at both widths. **If you add a top-level route that is not part of the
customer site, it belongs beside `(site)`, not inside it.**

## Payments, archived

**This site does not take money.** The client decided on 17 September 2026
that she does not want a checkout for now, "but will maybe eventually add it
again." So the whole payment service came out of the tree rather than staying
parked behind a flag, where it would have gone stale against Stripe's API and
against her own book while nobody looked at it.

**It is whole on the branch `archive/payments-2026-09`**, pushed at commit
`7133091` before a single file was deleted. Restoring it is a merge and her
Stripe account, not a rebuild. Thirty-one files went: every `/pay` route and
its APIs, `lib/pay.ts`, `lib/paylink.ts`, `lib/stripe.ts`, `lib/addons.ts`,
the workroom book and payments screens, and the nightly reminder cron. Eleven
more were unwired in place: the workroom's tabs and gate copy, the header,
the footer, the sitemap, the store, `vercel.json`, `/privacy` and the
proposal.

### What is on that branch

**The book was the only source of an amount.** Her customers and their
policies, with the installment amount and due date, entered in the workroom or
imported from her agency management system's CSV export. The import was an
upsert keyed on customer email and on policy by carrier plus policy number,
never deleting, leaving autopay and payment history alone, so "export again
next month, import again" was how the book stayed current. **The customer
never typed an amount and never had a password**, which was the whole point of
the September 2 reshape: the first version had them copy the figure off their
own bill, because the site had no way to know it.

**The pay link** was an HMAC over the policy id and an expiry, signed with
`PAY_LINK_SECRET`, minted from any policy in the workroom. It opened one bill
already filled in. A customer without a link found the same page with the two
things printed on every bill, a policy number and a ZIP.

**Carrier routing was per carrier, from the agency agreement.** A `payableHere`
flag on the carrier row in `lib/site.ts` decided whether a bill was paid here
or routed out to that carrier's own portal, and it was set from what each
agreement authorized, never from a book entry. Premium an agency collects is
fiduciary money under Michigan insurance law, and where collection is not
authorized, paying the agency is not paying the insurer: the lapse lands on
the customer.

**Autopay** was a Stripe subscription on the policy's own cadence, anchored on
the due date with `billing_cycle_anchor` rather than `trial_end`, because the
trial version showed the customer "40 days free" and "Try it free" on a bill.
An installment on autopay was locked in the book, since nothing in the
workroom rewrote a live subscription and a stale book would have shown one
number while Stripe charged another. **Recording was idempotent by Stripe's
own id** and happened twice on purpose: on the return page and again on the
signed webhook.

**The .99 reached Glazed through Stripe Connect.** Her account was a Standard
connected account under Glazed's platform: her dashboard, her payouts into the
trust account, her tax reporting, the charge under her name, and the flat fee
arriving as an application fee at the moment of payment. Money straight into
Glazed's account would have made Glazed the holder of insurance premium and a
money transmitter. Two charges would have meant two authorizations, two
receipts, and Stripe's 30 cent minimum eating a third of the fee.

**Verified against a Stripe stand-in, 2 September 2026**: 24 checks over the
test key opening the checkout, the session created on her account with both
lines and the flat fee, the return page recording once and rolling the due
date, the subscription percentage that rounds to exactly 99 cents, the Connect
webhook fetching from the event's account, and stop-autopay cancelling on her
account. **Stripe itself was never exercised.** The request shapes are
Stripe's documented ones, and a first run against a real test key and test
connected account is still the step nobody has taken.

### What has to be true before any of it comes back

These are the conditions that kept the switch off, and none of them have
changed:

1. She has confirmed which policies are agency-billed and which carrier
   agreements authorize collection. Everything else routes to the carrier.
2. She has a Stripe account settling into a separate premium or trust bank
   account, not operating money.
3. She has given a written go-ahead on the fee, after Kevin has walked her
   through the research below.
4. `STRIPE_SECRET_KEY`, `STRIPE_ACCOUNT`, `STRIPE_WEBHOOK_SECRET`,
   `PAY_LINK_SECRET`, `PAY_NOTIFY_TO` and `CRON_SECRET` are set in the Vercel
   dashboard. None of them are in this repo's `.env.example` any more; the
   archive branch carries that file with all six and their notes.

**The fee research stands, and it was research, not assumption** (1 September
2026). Michigan DIFS's own compensation-and-rebating FAQ (Sections 1236; 2111,
updated 05/09/16, on michigan.gov/difs) asks the exact question and answers
it: "May a producer charge a processing fee to collect payment of premium via
credit card? No. Although a producer may collect premium via credit card if
allowed by the insurer, an additional processing fee may not be charged.
Insurance rates are filed with DIFS and allowable fees are included in the
premium charged." The vendors that DO pass fees to insureds (ePayPolicy and
that class, roughly $20 a month plus pass-through convenience fees) do it as
the PROCESSOR charging for an optional channel, claim 50-state compliance, and
the states genuinely differ: New York prohibits agents passing the fee,
Georgia recently allowed it, Arizona allows it on commercial only. The finding
that reframes it: **Big I Michigan (the Michigan Association of Insurance
Agents, around 1,300 agencies) endorses ePayPolicy as its preferred payment
processor**, fee pass-through and all, while the DIFS FAQ stands un-tested
against that structure. So the structure is association-endorsed in this state
and still unblessed by the regulator in writing.

That is why the 99 cents was built as a flat fee, disclosed on the form with
the no-fee alternatives named beside it, its own Stripe line item so it was
never inside premium, charged in the name of the payment technology provider
rather than the producer. Kevin's call, 1 September 2026: existing Michigan
use, the MAIA-endorsed processor, stands in for a counsel opinion. The gate
that remained was the CLIENT'S, because the fee rides on her license posture.
**There is no separate "counsel review packet."** An earlier version of this
paragraph called this research a packet she had received; nothing was ever
sent, and the first agreement draft repeated the claim before Kevin caught it
(2 September 2026). The research is this paragraph, and the conversation is
his.

**If the checkout ever comes back, the no-lawyer way to charge for the
plumbing is a payments tier on the monthly**, and `/privacy` changes in the
same commit as the first route, before the first payment rather than after.

## The cross-sell

**The cross-sell, per the client:** each coverage line in `lib/site.ts`
carries `pairs`, up to two other lines worth pricing on the same call with
the reason said plainly, rendered on the coverage pages as ask-us cards
linking into `/quote?line=`. Prompts, never advice: the site has no idea what a
visitor's policy says and is built not to know, so nothing here may ever be
worded as a recommendation about someone's specific coverage.

## The giving program, and why it is shaped this way

The shape is the client's, chosen twice. August 28, 2026: **no set percentage,
no ledger, no goal bar, no vote**, plain words plus a write-up per cause.
September 1, 2026: **no write-ups either.** The site is the landing page and
the business card; the causes are posted on her social accounts as they
happen, and the site says a percentage of what we earn goes back and points
at the posts. `/giving/causes` is deleted (a 308 in `next.config.ts` covers
the old links) and `giving.stories` is retired from `lib/site.ts`. The
Facebook pointer is gated on `site.social.facebook` exactly like the review
ask: plain copy until the real URL lands, one edit to light up.

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

- [x] Zero accessibility violations at 390px and 1440px on every route. **27 routes, 0 violations, re-measured September 1 with the facts screen added; the three signed-in workroom screens audited through the gate with `--cookie`, and the facts screen separately in its typed-error and just-saved states at 320, 390 and 1440, all at 0.**
- [x] Zero console errors, zero 4xx, on every route.
- [x] `grep -rn PLACEHOLDER` returns only hits that are on the list above. **17, all in `lib/site.ts`, of which three are the marker mechanism itself.**
- [ ] **Every form actually submitted and confirmed arriving in a real inbox.**
      Half done. The INTAKE form is confirmed: a labeled test went through the
      production endpoint on September 1, 2026, delivery ran on the deployment
      with `INTAKE_TO` and `RESEND_API_KEY` set (both live in Vercel now), and
      Kevin saw the email land in his inbox. The QUOTE form is still the open
      half for EMAIL: there is no agency inbox yet, so its handler logs the
      full payload and warns. It is no longer the open half for DELIVERY,
      though: every quote request is now a row in the workroom's leads queue,
      which is where she works them. See below.
- [x] Any remote data source verified on the deployment, not locally. **The market
      rail degrades to symbols with no prices if either upstream is down, so a
      failure is visible rather than silent. Re-check it on the deployment.
      The facts editor's full flow (passcode, bad values refused, save, four
      pages fresh within a second, clear, pages blank again) ran against
      production and her Neon database on September 1, 2026.**
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

The proposal is priced **$2,000 build, $100 a month** (repriced from $3,500 and
$150 on September 16, 2026; the registry row on glazedweb.com and the paper
twin in contracts-private carry the same numbers), and it points at the demo
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
