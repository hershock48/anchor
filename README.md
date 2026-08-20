# Insurance for a Cause

A Glazed Web pitch repo. **Prospect, not signed.** Nothing here is a client build
yet.

The licensed agency is **Anchor Insurance and Risk Management**, which is where
this repo gets its name. *Insurance for a Cause* is the DBA and the name on the
door.

Read `glaze.md` in the `glazedweb` repo before touching this. The house rules for
what is in here specifically are `glaze/proposal.md` (the six sections and the
host split), `glaze/link-cards.md` (the cards), and `glaze/brand.md` (the palette
and the mark).

---

## What this is

| Path | What it is |
|---|---|
| `public/pitch/insuranceforacause/index.html` | The proposal. One self-contained file, no build step, so it can be hand-edited on a phone if a call goes sideways. |
| `public/pitch/insuranceforacause/logo.html` | The logo presentation and the in-use mockups. Served at `/logo`. |
| `public/pitch/insuranceforacause/og.jpg` | The proposal's link card. 1200x630, 44KB. |
| `tools/og-card.html` | The page the card is rendered from. Not deployed content, but it is what you edit if the card changes. |
| `public/robots.txt` | Allows crawling on purpose. `noindex` is handled by the header, not by `Disallow`. |
| `vercel.json` | Static output from `public/`, root rewritten to the proposal, `/logo` to the logo page, `X-Robots-Tag: noindex, nofollow` on every path. |

## Send the logo page first

This is the one ordering decision in the repo and it is deliberate. `/logo` opens
with the mark, walks through the lockups, the size ladder and the colours, shows
the mark in a browser frame and on a business card, and ends with a button to
`/`, which is the proposal.

A prospect who has just watched somebody draw them a logo reads a price
differently than one who was handed a price first. The proposal does not link
back, because there is nowhere to go back to.

## Deploying

Static. No framework, no build, no dependencies.

1. Import the repo into Vercel. It will detect no framework, which is correct.
2. Add the domain **`insuranceforacause.glazedweb.com`**. Apex form only. Adding
   the `www` form leaves it without a certificate, and that link fails when you
   send it.
3. Confirm `https://insuranceforacause.glazedweb.com/` serves the proposal and
   `/logo` serves the logo page.
4. Confirm both carry `X-Robots-Tag: noindex, nofollow`. Check the `.vercel.app`
   host too. It is indexable by default and is the same duplicate-content risk.

## No demo yet

There is no `/demo` on this host, because there is no concept build. That is a
deliberate scope call, not an omission. The proposal never claims a demo exists.
**Do not add a link to one until it does.**

When one gets built, this repo converts to Next.js and the host-scoped rewrites
in `glaze/proposal.md` go into `next.config`, in `beforeFiles`. A plain
`rewrites()` array is `afterFiles` and the root rewrite silently never fires.
`/logo` moves in there with them.

## Before you send it

- [ ] Every finding links to the page that proves it. **Done**, and the one that
      could not be verified is named on the page rather than dropped: `refacmi.com`
      redirect-loops and would not load, so the Real Estate For A CAUSE figures
      are attributed to a newspaper profile instead of to the company.
- [ ] Proposal card renders. Paste the URL into Messages **and** one non-Apple
      surface and look at it.
- [ ] The pitch host and the `.vercel.app` host are both `noindex`.
- [ ] The price is a number. **$3,500 build, $150 a month.**
- [ ] Read it once as the owner, not as the builder. Cut any sentence that is
      about Glazed Web rather than about her.
- [ ] **Fill the owner's name.** The logo page carries `[Owner name]` as a
      visible placeholder in two places. It ships as a placeholder rather than a
      guess, but it should not ship that way to her.
- [ ] **`kevin@glazedweb.com` is the address on the CTA button.** Confirm that
      mailbox exists and is watched, or change it before sending.

## Verified state, August 20 2026

Audited with `glaze/scripts/audit.mjs` against the served files:

```
axe violations total: 0
horizontal overflow:  none
console errors:       none
4xx/5xx:              none
```

Three real faults were found and fixed rather than noted:

**The mockup was being clipped on mobile.** The browser frame in the logo page
measured 494px inside a 390px viewport. `body { overflow-x: hidden }` meant the
page could not actually be scrolled sideways, so it looked fine and was not.
Grid items default to `min-width: auto`, so the too-wide child was widening the
track. Fixed with `min-width: 0` on the grid and its children, and the mockup's
own nav now drops its links under 760px the way a real one would.

**One contrast fail.** The tagline on the brick-red specimen was a softened
`#F6DED4` at **4.17** on `#C4362B`, under the 4.5 that normal-weight text needs.
Full white is 5.37. Same fault and same fix as `.after` in the Schuler's
proposal: the softness was costing the pass on its own, so it comes off and
hierarchy comes from size instead.

**A third contrast fail, caught by the script and not by hand.** The colour
swatch labels carried `opacity: .85` on `code` and `.8` on `em`. On three
swatches that is invisible; on the brick-red one it drops white to **4.28** and
**3.96**. Both come off. The fix is on the class rather than on the swatch axe
named, because the same opacity was on all four and one of them happened to be
the one that failed. That is the rule from `glaze/brand.md` and this is what it
is for: the hand-checked pass looked clean because it checked the declared
colours, not the rendered ones.

All nine proof links return 200. `vanscoterinsurance.com` answers 403 to `curl`
and 200 to a browser, which is bot filtering rather than a dead link. Worth
knowing before somebody clicks it in front of her.

## Traps in these files

**The Glazed mark is lifted, not redrawn.** The gradients and the `#mark` symbol
are copied verbatim from `components/Logo.jsx` in the `glazedweb` repo, and the
`viewBox` is cropped to `46 16 110 186`, the mark's real painted bounds. No
coordinate moves.

**The client's mark is a different thing and lives here.** The anchor is drawn in
`logo.html` as two `<symbol>` cuts, `#ifac` and `#ifacS`. They are not the same
artwork at two sizes: the rope hole closes below about 30px, so the small cut
fills the heart solid and keeps the mass. Both take `--a-ink` and `--a-accent`,
which is how the reversed and one-colour versions work without duplicated paths.

**Three pinks, on purpose.** `--raspberry` is accents only. `--raspberry-deep`
carries white text. `--raspberry-ink` is link text. Using the wrong one
reintroduces a contrast fault that took a full audit to find.

**The reveal class is added by script.** With JavaScript off nothing is ever
hidden and the page is complete on arrival. Do not move `.reveal`'s opacity out
from under the `.js` selector.

**The card's safe area is the centre 630x630 band**, x 285 to x 915. The crop was
checked and the headline clears it on both sides. If you change the wording,
re-render and look at the crop again.

## What is not in this repo

The research the proposal was cut down from is much larger than what shipped: the
Michigan DIFS conditions on donating commission, the commercial co-venture
question, the eight-agency survey in full, the market and discovery research, and
the differentiation work. Ask Kevin.

Three things from it that should shape any conversation with her:

- **Michigan DIFS says a customer cannot direct where their own policy's donation
  goes.** That is why the design is a public vote and not a pick-your-charity box.
  It also says the recipient cannot be a client of the producer, so the giving
  list and the book have to stay separate. Her attorney or E&O carrier signs off,
  not us.
- **Do not promise expertise she cannot place.** The nonprofit and church market
  is wide open and genuinely underserved, but it is a hard market and a new agency
  will not have the appointments. It belongs in a later conversation.
- **Reviews before pixels.** Roughly half of people will not use a business with
  fewer than twenty reviews. Telling her that first is worth more than a mockup.
