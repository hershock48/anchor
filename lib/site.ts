/**
 * Every business fact on this site lives here.
 *
 * The rule from glaze.md: a correction is one edit. If a surface cannot read
 * from this file, it gets named in the README. Right now there is exactly one
 * such surface and it is named there: the proposal and logo pages under
 * `public/pitch/`, which are hand-written static HTML on purpose so they can be
 * edited on a phone.
 *
 * SINCE SEPTEMBER 1, 2026, THE CLIENT CAN EDIT SOME OF THESE HERSELF. The
 * workroom's facts screen stores edits for the fields whitelisted in
 * `lib/workroom/facts-def.ts` (owner name, phone, email, address, hours,
 * license numbers, two links), and `lib/content.ts` lays those over this
 * file for every customer page. This file is still the seed and the safety
 * net: an edit never destroys a value here, and clearing the edit restores
 * it. Read `getFacts()` on a customer page, never this object directly, for
 * any field on that whitelist. Everything else (names, tagline, carriers,
 * the giving program, payments) is still only here, on purpose.
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
   *
   * `payUrl` and `billingPhone` feed /pay: each carrier a customer can be
   * billed by gets a row pointing at that carrier's own payment portal and
   * billing line. Fill them from the carrier's site when the appointment is
   * confirmed; a carrier without them still renders, minus the links.
   *
   * `payableHere` is the pay-at-anchor switch, per carrier: true ONLY when
   * that carrier's agency agreement authorizes the agency to collect its
   * premium. The /pay page then routes that carrier INTO the on-site
   * checkout instead of out to the carrier's portal, and the checkout's
   * carrier selector lists it so every payment names who it is for. Set it
   * from the agreement, never from optimism: where collection is
   * unauthorized, payment to the agency does not count as payment to the
   * insurer and a lapse lands on the customer.
   */
  carriers: [] as {
    name: string;
    logo?: string;
    payUrl?: string;
    billingPhone?: string;
    payableHere?: boolean;
  }[],

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
 * RESHAPED TWICE BY THE CLIENT, and both old shapes are recorded because
 * this file used to forbid each new one.
 *
 * August 28, 2026: the build's original receipts argument (a set percentage,
 * a published ledger, a goal bar, a public vote, and a rule here that read
 * never "a portion of proceeds") was dropped for the opposite: say a
 * percentage of what we earn goes back, commit to no number, and put the
 * effort into a write-up for each cause instead.
 *
 * September 1, 2026: the write-ups went too. The site is the landing page
 * and the business card; the specifics live on her social accounts, posted
 * as they happen. The site states the promise plainly and points at the
 * posts. /giving/causes is deleted and redirects to /giving, and the
 * `stories` field that fed it is retired below. Ledger, goal bar, causes
 * page and write-ups are all in git history if any of them is ever wanted
 * back.
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
   * RETIRED, SEPTEMBER 1, 2026. A `stories` array lived here, one entry per
   * supported cause, feeding write-ups on /giving/causes. The client's
   * direction is simpler: specifics go up on her social accounts, the site
   * just says the promise and points there. The field and the page are in
   * git history before this date if the write-ups ever come back.
   */
} as const;

/**
 * On-site payments, for /pay and /api/pay.
 *
 * THE SWITCH IS OFF ON PURPOSE, the same way Copper's ordering is parked: the
 * page and the API are built, and the card form does not render until the
 * client can lawfully take the money. Premium an agency collects is fiduciary
 * money under Michigan insurance law, and most personal-lines policies are
 * billed by the carrier under agency agreements that say the agent does not
 * collect at all. So the carrier rows above are the live layer, and this
 * checkout exists for AGENCY-BILLED invoices only.
 *
 * Flip `agencyBillCheckout` to true only when all of these are true, and
 * record the date here when you do:
 *
 *   1. She has confirmed which policies are agency-billed. Direct-billed
 *      policies keep routing to the carrier, whatever this flag says.
 *   2. She has a Stripe account settling into a separate premium/trust bank
 *      account, not operating money.
 *   3. She has given a written go-ahead after reading the counsel review
 *      packet (September 1, 2026), which puts the DIFS FAQ's "no producer
 *      processing fees" answer next to the Big I Michigan-endorsed
 *      ePayPolicy structure that passes fees to the payer anyway. The fee
 *      below rides on HER license posture, so the informed yes is hers to
 *      give, and whether counsel reads it first is her call, not a gate.
 *   4. STRIPE_SECRET_KEY and PAY_NOTIFY_TO are set in the Vercel dashboard.
 *
 * There are no customer accounts and no stored balances BY DESIGN: the
 * customer types what their bill says, because the bill is the ledger and
 * the site is only the till.
 */
export const payments = {
  agencyBillCheckout: false,
  /** Above this, the form says call us instead. Typos add zeros. */
  maxOnlineCents: 2_500_000,
  /**
   * The flat online-channel fee, itemized as its own Stripe line item so it
   * is never inside premium, charged by the payment technology provider
   * (Glazed) rather than the producer, disclosed on the form before the
   * customer continues, with the no-fee alternatives named right next to
   * it. Flat-not-percentage on purpose: that is the card networks' own
   * definition of a compliant convenience fee for an optional channel, and
   * it is the structure the association-endorsed processor uses. Set to 0
   * to absorb fees instead; the disclosure line disappears with it.
   *
   * Routing this revenue to Glazed is a Stripe Connect application-fee job
   * later (the Square version of that rail already exists in devine); until
   * then the fee settles with the payment and Glazed's share is handled on
   * the invoice.
   */
  convenienceFeeCents: 99,
} as const;

/**
 * Lines she writes. Each one gets its own page: still the strongest local
 * search factor there is, and a single "coverage" page will not rank.
 *
 * `pairs` is the cross-sell, per the client September 1: each line names up
 * to two other lines worth pricing on the same call, with the reason said
 * plainly. Rendered as ask-us prompts linking into /quote?line=, never as
 * advice about anyone's specific policy, because the site has no idea what
 * anyone's policy says and is built not to know.
 */
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
    pairs: [
      {
        line: "umbrella",
        reason:
          "Your auto liability stops at its limit, and an umbrella is the inexpensive layer above it. It is the coverage most people are underweight on.",
      },
      {
        line: "home",
        reason:
          "Carriers price auto better when the house rides along, and if you rent, a renters policy does the same job for the bundle.",
      },
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
    pairs: [
      {
        line: "umbrella",
        reason:
          "A serious injury on your property can pass your liability limit. The umbrella picks up where the homeowners policy stops.",
      },
      {
        line: "auto",
        reason:
          "The bundle usually pays for itself: same carrier, both policies priced together.",
      },
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
    pairs: [
      {
        line: "auto",
        reason:
          "Bundling renters with auto usually covers the cost of the renters policy outright.",
      },
      {
        line: "life",
        reason:
          "Term life is cheapest while you are young and healthy, which is usually when you are renting.",
      },
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
    pairs: [
      {
        line: "auto",
        reason:
          "An umbrella requires certain underlying auto limits. We set those first, and it sometimes changes the auto price for the better.",
      },
      {
        line: "home",
        reason:
          "Same story on the house: the umbrella sits on top of homeowners liability, so both get looked at together.",
      },
    ],
  },
  {
    slug: "life",
    name: "Life",
    short: "Term, mostly, and an honest conversation about how much.",
    blurb:
      "Most people need term and are sold something more complicated. We start from what would actually need to be paid for if you were gone, then work back to a number and a length.",
    points: ["Term", "Whole and universal where it fits", "Coverage through work, and its gaps"],
    pairs: [
      {
        line: "home",
        reason:
          "The mortgage is the reason most people buy term. While we are at it, we check the rebuild number on the house it protects, because that figure drifts.",
      },
    ],
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
    pairs: [
      {
        line: "life",
        reason:
          "Key-person and buy-sell coverage are life policies wearing work clothes. If the business depends on one person, price it.",
      },
      {
        line: "umbrella",
        reason:
          "A commercial umbrella sits above the general liability the same way a personal one sits above auto, and hard-market limits make it worth pricing.",
      },
    ],
  },
] as const;

export type Line = (typeof lines)[number];
