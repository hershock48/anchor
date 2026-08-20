# Doc updates for the `glazedweb` repo

`glazedweb-docs.patch` in this folder edits five files in `hershock48/glazedweb`.
It is here because the PAT this session had could read that repo and not write to
it.

## Apply it

```bash
cd ~/Desktop/glazedweb
git pull
git am ../anchor/glazedweb-docs.patch      # adjust the path
git push
```

`git am` keeps the commit message, which carries the reasoning for each entry. If
it conflicts because those files moved on since, `git apply --3way` instead, or
just read the patch and paste the sections in by hand. Then delete this file and
the patch from this repo.

## What it changes

| File | What goes in |
|---|---|
| `glaze.md` | Three CSS failure-log entries (4096px composited layer cap on mobile, rotation amplitude scaling with size, a token validated against one ground is not validated), three Next.js entries (server-open/client-collapsed is a layout shift, `/` is the proposal on a pitch host, a dashboard build setting survives deleting the file that set it), and one rule under the quality bar: a guess written as a plain value is worse than a blank |
| `glaze/launch.md` | Favicon lines in the done list, a 404 line, do not put a 404 route in the auditor's list, measure CLS on a throttled connection not just a throttled CPU |
| `glaze/brand.md` | A **Client favicons** section: two cuts, full bleed with no corner radius, three sizes inside the `.ico` |
| `glaze/link-cards.md` | A **One host, one favicon** section, plus a checklist line. The file already covers the two cards; it did not cover the one favicon |
| `glaze/intake.md` | A new question five, "what town are they actually in, and which county", and the Grass Lake story. List renumbered to stay valid markdown |

Every entry came out of something that cost time on this build. Nothing here is
speculative.
