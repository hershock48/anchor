/**
 * Every business fact on this site lives here.
 *
 * The rule from glaze.md: a correction is one edit. If a surface cannot read
 * from this file, it gets named in the README. Right now there is exactly one
 * such surface and it is named there: the proposal and logo pages under
 * `public/pitch/`, which are hand-written static HTML on purpose so they can be
 * edited on a phone.
 *
 * PLACEHOLDER means the client has not supplied it yet. Every one of these is
 * an unchecked box in the README and must be said out loud at handover.
 * A placeholder that ships silently reads to a visitor as a real number.
 */

export type Placeholder = `PLACEHOLDER:${string}`;
export const isPlaceholder = (v: string): boolean => v.startsWith("PLACEHOLDER:");

/** Strips the marker for display, leaving a visibly bracketed blank. */
export const ph = (v: string): string =>
  isPlaceholder(v) ? `[${v.slice("PLACEHOLDER:".length)}]` : v;

export const site = {
  /**
   * What is on the door and what customers say. The short form of the
   * licensed entity below.
   *
   * This was "Insurance for a Cause" until August 28, 2026, when the client
   * decided at the pitch meeting that everything runs under the Anchor name.
   * The old name is retired outright: it briefly served as the tagline the
   * same day and the client said no to that too. It survives only as the
   * structured-data alternateName. Do not resurrect it anywhere visible.
   */
  name: "Anchor Insurance",
  /** The licensed entity. Has to appear, and is not the same string. */
  legalName: "Anchor Insurance and Risk Management",
  tagline: "Coverage that gives back",
  /**
   * PLACEHOLDER in effect: the domain is not bought yet. This is an assumption,
   * and it is load-bearing because `metadataBase` and the sitemap are both
   * built from it. It changed with the rename (the old assumption was
   * insuranceforacause.com). Confirm the real domain before launch and change
   * it here only; nothing else hardcodes it.
   */
  url: "https://anchorinsurancemi.com" as string,
  urlConfirmed: false,

  owner: {
    name: "PLACEHOLDER:Owner name" as string,
    title: "Agent and owner",
    /** Second producer the client mentioned. Role unconfirmed. */
    second: "PLACEHOLDER:Amanda’s role" as string,
  },

  contact: {
    phone: "PLACEHOLDER:phone" as string,
    /** Digits only, for tel: links. A phone number that is not a link is a
     *  usability finding we make about other people's sites. */
    phoneHref: "PLACEHOLDER:phone-digits" as string,
    email: "PLACEHOLDER:email" as string,
    street: "PLACEHOLDER:street address" as string,
    /**
     * MANCHESTER, WASHTENAW COUNTY.
     *
     * Corrected twice. The first build said Marshall, because that is Kevin's
     * town and nobody asked. The second said Grass Lake. It is Manchester: a
     * city of about 2,000 on the River Raisin with M-52 running through the
     * middle of it, in WASHTENAW county, roughly 70 miles east of Marshall.
     *
     * It is a CITY, not a village. It was a village from 1867 and voted for
     * cityhood in November 2023, which is recent enough that plenty of copy
     * still says village. Do not write village.
     *
     * The lesson from the first miss holds and is why this one was cheap: this
     * field and `nearby` are the only places a town name is allowed to live, so
     * correcting it is one edit instead of a hunt through four guides, the page
     * titles, the structured data and a rendered card image.
     */
    city: "Manchester",
    county: "Washtenaw",
    state: "MI",
    zip: "PLACEHOLDER:ZIP" as string,
    /** The towns a local guide may name. Anything not on this list is not local
     *  to them, however good the story is. */
    nearby: ["Chelsea", "Saline", "Clinton", "Tecumseh", "Ann Arbor"],
    /** True if there is no walk-in office. Changes how the contact page reads. */
    byAppointmentOnly: true,
  },

  /** Seasonal exceptions and the one day that is different go here too. */
  hours: [
    { days: "Monday to Friday", open: "PLACEHOLDER:weekday hours" },
    { days: "Saturday", open: "PLACEHOLDER:Saturday hours" },
    { days: "Sunday", open: "Closed" },
  ] as { days: string; open: string }[],

  /** Michigan DIFS producer licensing. Required on the page, not optional. */
  license: {
    producerNumber: "PLACEHOLDER:Michigan producer license number" as string,
    npn: "PLACEHOLDER:NPN" as string,
    states: ["Michigan"],
  },

  /**
   * Carrier appointments. The logo wall is the biggest trust element on an
   * insurance site and this is the fact we do not have.
   *
   * Do not add a carrier here without confirming the appointment AND the
   * carrier's marketing rules. Several carriers restrict how an agency may use
   * their mark, and a few require marketing review before anything publishes.
   */
  carriers: [] as { name: string; logo?: string }[],

  social: {
    facebook: "PLACEHOLDER:Facebook URL" as string,
    google: "PLACEHOLDER:Google Business Profile URL" as string,
    /**
     * The direct write-a-review link, which is NOT the same string as the
     * profile URL above. Google issues it from the Business Profile dashboard
     * (a g.page/r/…/review URL). Until the profile exists, the review ask on
     * the homepage and contact page renders a marked blank instead of a
     * button, so nothing on the site links to a dead end.
     */
    googleReview: "PLACEHOLDER:Google review link" as string,
  },
} as const;

/**
 * The giving program.
 *
 * RESHAPED ON AUGUST 28, 2026, BY THE CLIENT, and the old shape is worth a
 * paragraph because this file used to forbid the new one. The build shipped
 * with a set percentage, a published ledger, a goal bar and a public vote,
 * and a rule here that read: never "a portion of proceeds." The client chose
 * the opposite: say a percentage of what we earn goes back, do not commit to
 * the number, drop the receipts, and put the effort into content about each
 * donation instead. So the vague phrasing is the program now, on purpose,
 * and the retired rule is recorded rather than silently deleted. If she ever
 * wants the ledger back, it lives in git history before this date.
 *
 * Michigan DIFS publishes six conditions on a producer donating commission.
 * They still apply, because the money is still commission and the giving is
 * still advertised on the site:
 *
 *   - The donation must be offered uniformly to all applicants and not tied to
 *     specific transactions. So the site never says "your policy bought X."
 *   - The insured must not control which organization receives the donation.
 *     The agency picks the causes itself, and there is no pick-your-charity
 *     control on the quote form. Do not add one.
 *
 * A third condition matters operationally: the recipient must not be a client
 * of the producer. That one is published in the footer only. See the note
 * below.
 *
 * None of this is legal advice and the program needs her attorney or E&O
 * carrier to sign off. DIFS closes its own FAQ recommending counsel.
 */
export const giving = {
  /**
   * Deliberately not a number, per the client. Keep the phrase in this one
   * field so a change of heart is one edit.
   */
  share: "a percentage of what we earn",

  /**
   * THE FOOTER ONLY. Michigan DIFS condition six is that the organization
   * receiving the donation may not be a client of the producer, so the
   * recipient list and the book stay disjoint.
   *
   * This was on the site in three places, which was two too many: repeated in
   * the body of the homepage and the giving page it read as explaining a
   * licensing constraint to a customer who never asked. In the footer it sits
   * with the other standing disclosures, where somebody looking for it will
   * find it and nobody else trips over it.
   */
  EXCLUSION_NOTE:
    "We do not donate to organizations we insure. Keeping those two lists separate is a Michigan licensing requirement and we think it is the right way to run this anyway.",

  DISCLOSURE:
    "No purchase necessary. The donation is the same whether or not you buy a policy, and no customer can direct where their own policy’s money goes.",

  /**
   * The causes we support, newest first. Each one is a short write-up rather
   * than a ledger row: who they are, why we picked them, what the gift did.
   * No amounts, per the client. An empty list renders an honest "we are new"
   * state on /giving/causes; never seed it with an invented first story.
   */
  stories: [] as {
    /** Prose-friendly, e.g. "March 2027". Rendered as written. */
    date: string;
    title: string;
    org: string;
    orgUrl?: string;
    city: string;
    body: string;
  }[],
} as const;

/** Lines she writes. Each one gets its own page: still the strongest local
 *  search factor there is, and a single "coverage" page will not rank. */
export const lines = [
  {
    slug: "auto",
    name: "Auto",
    short: "Cars, trucks, motorcycles and the Michigan rules nobody explains.",
    blurb:
      "Michigan is the only state that still offers unlimited lifetime medical on an auto policy, and the choice you make about it is the most consequential one on the whole form. We walk you through it instead of reading you the levels.",
    points: [
      "Personal injury protection, explained in dollars, not in tiers",
      "Mini-tort, which covers your vehicle damage and almost nothing else",
      "Uninsured and underinsured motorist",
      "Multi-car and multi-policy",
    ],
  },
  {
    slug: "home",
    name: "Home",
    short: "Houses, condos and the coverage that quietly stops keeping up.",
    blurb:
      "Most homeowners policies are underinsured for the same reason: the amount was right the year it was written. We check the rebuild figure against what building actually costs now, and we go through the wind and hail deductible before a storm makes it interesting.",
    points: [
      "Replacement cost against actual cash value",
      "Wind and hail deductibles, in dollars",
      "Water backup, service line and other things people find out about late",
      "Scheduled items for the ring, the tools, the collection",
    ],
  },
  {
    slug: "renters",
    name: "Renters",
    short: "The cheapest policy we sell and the one people skip.",
    blurb:
      "A renters policy is usually a small monthly number and it covers your things anywhere, not just in the apartment. It also carries liability, which is the part that actually matters and the part nobody thinks about.",
    points: [
      "Your belongings, including away from home",
      "Liability if somebody is hurt",
      "Loss of use if you cannot live there for a while",
      "Bundles with auto, which usually pays for itself",
    ],
  },
  {
    slug: "umbrella",
    name: "Umbrella",
    short: "Liability above what your auto and home policies stop at.",
    blurb:
      "An umbrella sits on top of the liability you already have and picks up where those limits end. It is inexpensive relative to what it does, and it is the coverage most people are underweight on.",
    points: [
      "Extra liability across auto, home and boat at once",
      "Defense costs",
      "Usually requires certain underlying limits, which we set up first",
    ],
  },
  {
    slug: "life",
    name: "Life",
    short: "Term, mostly, and an honest conversation about how much.",
    blurb:
      "Most people need term and are sold something more complicated. We start from what would actually need to be paid for if you were gone, then work back to a number and a length.",
    points: ["Term", "Whole and universal where it fits", "Coverage through work, and its gaps"],
  },
  {
    slug: "business",
    name: "Business",
    short: "Small commercial, and the nonprofits and churches nobody will quote.",
    blurb:
      "Small business, contractors, and the organizations in the middle of a hard market right now. Churches and nonprofits are seeing large increases and non-renewals with short deadlines, and a lot of them cannot get anyone to return a call.",
    points: [
      "General liability and property",
      "Commercial auto",
      "Workers compensation",
      "Nonprofits, churches and schools",
    ],
  },
] as const;

export type Line = (typeof lines)[number];
