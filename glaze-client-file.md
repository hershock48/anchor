# Insurance for a Cause

**Copy this to `glaze/clients/insuranceforacause.md` in the `glazedweb` repo.**
It lives here only because the git proxy in the session that wrote it could push
to `hershock48/anchor` and not to `hershock48/glazedweb`. Move it and delete this
copy.

---

Independent insurance agency, Grass Lake, Michigan. **Prospect, not signed** as of
August 2026.

| | |
|---|---|
| Repo | `hershock48/anchor` |
| Pitch host | `insuranceforacause.glazedweb.com` |
| Proposal | `/` |
| Logo presentation | `/logo` |
| Demo | `/demo` |
| Client domain | Not bought. `lib/site.ts` assumes `insuranceforacause.com` and flags it |
| Price quoted | $3,500 build, $150 a month |

## The names, which are not the same string

**Anchor Insurance and Risk Management** is the licensed entity. **Insurance for
a Cause** is the DBA and the name on the door. Both have to appear. The repo is
named for the licensed entity; everything customer-facing uses the DBA.

The mark is an anchor for that reason, so one logo serves both names.

## The people

The owner is a woman; **we do not have her name.** There is a second person named
**Amanda** whose role is unconfirmed. Both are visible placeholders on the site
and in the logo page. Do not guess either.

## The giving program, and the rule that shapes the build

Michigan DIFS publishes six conditions on a producer donating commission. Three
matter here:

1. **Offered uniformly, not tied to specific transactions.** The site never says
   "your policy bought X."
2. **The insured must not control which organization receives it.** This is why
   the cause is chosen by a **public vote open to anyone** and why there is no
   choose-your-charity control on the quote form. **Do not add one**, however
   good an idea it looks.
3. **The recipient must not be a client of the producer.** In the footer only.
   It was on the homepage and the giving page too and Kevin pulled it: in the
   body of a page it explains a licensing constraint to a customer who never
   asked.

Her attorney or E&O carrier signs the program off. DIFS closes its own FAQ
recommending counsel. **We do not give the legal opinion**, we hand over a written
description of the mechanic so that conversation is short.

## Permission

**No photo or logo permission on file.** There are no photographs on the site at
all and no stock, on purpose. Carrier logos are absent for the same reason:
`site.carriers` is an empty array and the homepage says the list is coming rather
than showing marks the agency may not be entitled to display. Several carriers
restrict use of their mark and a few require marketing review before anything
publishes. **Ask before adding any.**

## Voice

Warm, plain, and willing to say the unflattering thing. The whole brand rests on
being checkable, so anything on this site that cannot be verified undercuts the
product. Two lines that set the register:

- "We are new, so this is honestly at zero."
- "We will tell you if we cannot beat what you have."

The about page is the one that cannot be written without her. It needs a recorded
hour, in her words. **Inventing it would be the most damaging thing available on
this site.**

## Retired

**"Marshall, Michigan."** The entire first build said Marshall, in page titles,
the hero, the structured data and four local guides. Nobody asked, and it was the
one contact field that was NOT written as a placeholder, so it read as a
confirmed fact and propagated. **They are in Grass Lake**, a village of about
1,100 in Jackson County, just south of I-94 and roughly 48 miles east of
Marshall. Different county, different school district, different neighbours.

Two pieces of local content died with it, and it is worth knowing why so they do
not come back:

- **The BlueOval hook.** Ford's battery plant is a Marshall story. It is about 40
  miles from Grass Lake and has nothing to do with their book.
- **"An EF-3 fifteen miles away."** The March 6 2026 tornadoes hit Branch, St
  Joseph, Cass and Calhoun counties. Jackson County is not among them, and Union
  City is about 48 miles from Grass Lake. The storm guide keeps the event,
  because it is the strongest Michigan tornado since 1977 and that is a statewide
  fact, but the proximity claim is gone.

**The towns a local guide may name are Jackson, Chelsea, Michigan Center,
Napoleon and Munith.** They are in `site.contact.nearby` so this is checkable
instead of remembered.

**"The giving program is the differentiator."** Researched and dropped. 96% of
independent agents already donate, only about 34% of Americans say a charitable
tie makes them more likely to buy, and personal auto is decided on price. The
giving is not what makes her different. **Publishing the number is.** Almost no
agency does, and the one that does has a first-year total of $1,940 and the most
convincing giving page in the category.

**"Let the giving pick a nonprofit niche."** Strategically sound and explicitly
rejected by Kevin: she is a paying client who is excited about her own model, and
the job is to make her version excellent rather than to redirect it. It survives
in the proposal as one short paragraph labelled as a thought for later, not as a
recommendation. **Do not reopen it unless she does.**

**A lifetime donation counter on the homepage.** Replaced by a single active goal.
A counter reading $0 is worse than no counter, and a "$X donated" placeholder is
how invented numbers reach real people.

## Traps carried in this repo's README

The no-JS quote form, the `beforeFiles` host split, the two mark cuts, the
three-token color system validated against both light grounds, and `Reveal`
re-arming on navigation. All written up there with the reasoning.

## Still unknown

Everything in the README's placeholder list. The big ones: her name, the giving
percentage, the carrier appointments, the license numbers, and whether there is a
walk-in office.
