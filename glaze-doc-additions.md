# Proposed additions to the glaze docs

Two gaps found while building `anchor`. Both cost real time, and neither is
covered anywhere in `glaze.md`, `brand.md`, `link-cards.md`, `launch.md`,
`proposal.md` or `intake.md`.

Fold these in and delete this file. It lives here only because the git proxy will
not push to `hershock48/glazedweb` from a Cowork task.

---

## 1. `glaze/launch.md` — add to "Search and sharing"

The definition of done has no favicon line at all, so a build can tick every box
and still ship the Next.js default or a broken icon.

```md
- [ ] Favicon set present and it is the **client's** mark: `favicon.ico`,
      `icon.png`, `apple-icon.png`. Rendered from the real artwork, never
      redrawn.
- [ ] The icon is **full bleed with no corner radius**, and the corners are the
      icon's own background colour, not white and not transparent-rendered-white.
- [ ] Checked at **48, 32 and 16**, at true size, on a light and a dark tab.
```

### The story, for the indented part

The first icon on `anchor` was a rounded rect screenshotted on a white page, so
the four corners were pure `#FFFFFF` pixels baked into the PNG. On any tab,
launcher or bookmark bar that is not white it read as a white frame around a blue
blob. It also double-rounds on iOS, which masks an apple-touch-icon itself and
expects a full square to mask.

---

## 2. `glaze/brand.md` — extend the favicon note

`brand.md` lists `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`,
`icon-192.png` and `icon-512.png` for **glazedweb.com's own** mark, and says
nothing about a client site's. Suggested addition under **Raster copies**:

```md
### Client favicons

A client site gets the **client's** mark, cut the same way the header mark is:
the detailed version above roughly 32px and a simplified one below it. One
source scaled to 16px is how a mark turns to mush. On `anchor` the heart's
counter closed up completely, and the fix was a second cut with a filled heart
and heavier strokes, which is the same rule `components/Logo.tsx` already
applies on the page.

Build the `.ico` with all three sizes inside it, 48, 32 and 16, taking 48 from
the detailed cut and the smaller two from the simplified one.
```

---

## 3. `glaze/link-cards.md` — add a section

This file already explains that a pitch host serves **two link cards** and that
getting them backwards is the most common mistake. It does not mention that the
same host serves **one favicon**, which is the same class of problem and bit us
the same way.

```md
## One host, one favicon

A pitch host serves the proposal at `/`, the logo page at `/logo` and the whole
client site at `/demo`. Those are three pages with one origin, and **a favicon is
cached per origin**. Two different icons on one origin means whichever loaded
first tends to stay in the tab, and the order somebody actually browses is
proposal, then demo.

So the Glazed donut on the proposal sticks in the tab while the client is looking
at their own site. That is the wrong way round in front of a prospect.

**Every page on a pitch host declares the client's mark**, including the
proposal. Glazed is carried on that document by the header lockup and the footer
plate, both of which are considerably more visible than a 16px tab icon.

Unlike the two cards, which are deliberately different files doing different
jobs, the favicon is one asset and it belongs to the client.
```

---

## 4. Smaller, optional

Two more things worth a line somewhere, both found the same way.

**`launch.md`, "The visitor's experience".** Add a 404 line. Without an
`app/not-found.tsx`, Next serves its own bare error page inside the client's
header and footer, matching neither and offering nowhere to go.

```md
- [ ] A real 404 in the site's own design, with links out. Not the framework default.
```

**`launch.md`, the auditor note.** Worth saying out loud: do **not** put a 404
route in the auditor's route list. It correctly reports a 4xx and every run then
looks like a failure.
