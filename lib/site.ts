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
  /** The DBA. What is on the door and what customers say. */
  name: "Insurance for a Cause",
  /** The licensed entity. Has to appear, and is not the same string. */
  legalName: "Anchor Insurance and Risk Management",
  tagline: "Coverage that gives back",
  url: "https://insuranceforacause.com" as string,

  owner: {
    name: "PLACEHOLDER:Owner name" as string,
    title: "Agent and owner",
    /** Second producer the client mentioned. Role unconfirmed. */
    second: "PLACEHOLDER:Amanda's role" as string,
  },

  contact: {
    phone: "PLACEHOLDER:phone" as string,
    /** Digits only, for tel: links. A phone number that is not a link is a
     *  usability finding we make about other people's sites. */
    phoneHref: "PLACEHOLDER:phone-digits" as string,
    email: "PLACEHOLDER:email" as string,
    street: "PLACEHOLDER:street address" as string,
    city: "Marshall",
    state: "MI",
    zip: "PLACEHOLDER:ZIP" as string,
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
  },
} as const;

/**
 * The giving program.
 *
 * Michigan DIFS publishes six conditions on a producer donating commission.
 * Two of them shape this code directly and are why the site is built the way
 * it is:
 *
 *   - The donation must be offered uniformly to all applicants and not tied to
 *     specific transactions. So the site never says "your policy bought X."
 *   - The insured must not control which organization receives the donation.
 *     So the cause is chosen by a public vote open to anyone, not by a
 *     pick-your-charity control on the quote form.
 *
 * A third condition matters operationally: the recipient must not be a client
 * of the producer. `EXCLUSION_NOTE` below is published on the giving page
 * because saying it out loud is both good faith and compliance.
 *
 * None of this is legal advice and the program needs her attorney or E&O
 * carrier to sign off. DIFS closes its own FAQ recommending counsel.
 */
export const giving = {
  /** e.g. "10% of every commission we earn". Never "a portion of proceeds". */
  rate: "PLACEHOLDER:percentage" as string,
  /** What the percentage is taken from, in plain words. */
  base: "commission we earn on every policy",
  cadence: "quarterly",

  EXCLUSION_NOTE:
    "We do not donate to organizations we insure. Keeping those two lists separate is a Michigan licensing requirement and we think it is the right way to run this anyway.",

  DISCLOSURE:
    "No purchase necessary. The donation is the same whether or not you buy a policy, and no customer can direct where their own policy's money goes.",

  /**
   * The live ledger. Empty on purpose at launch.
   *
   * An empty ledger with an honest "we opened in <month>" line is a better
   * page than a counter reading $0, and far better than a number nobody can
   * check. Add a row when a check is written, not when one is promised.
   */
  ledger: [] as {
    date: string;
    org: string;
    orgUrl?: string;
    city: string;
    amount: number;
    period: string;
    proof?: string;
  }[],

  /** The one active goal. Small enough to finish. */
  goal: {
    org: "PLACEHOLDER:first cause" as string,
    orgUrl: "" as string,
    city: "PLACEHOLDER:city" as string,
    target: 0,
    raised: 0,
    deadline: "PLACEHOLDER:deadline" as string,
    why: "PLACEHOLDER:why this cause" as string,
  },

  /**
   * The public vote. Open to anyone, which is what keeps it clear of the
   * DIFS condition about the insured directing the donation.
   */
  vote: {
    open: false,
    closes: "" as string,
    options: [] as { org: string; city: string; blurb: string; votes: number }[],
  },
} as const;

/** Lines she writes. Each one gets its own page: still the strongest local
 *  search factor there is, and a single "coverage" page will not rank. */
export const lines = [
  {
    slug: "auto",
    name: "Auto",
    short: "Cars, trucks, motorcycles and the Michigan rules nobody explains.",
    blurb:
      "Michigan is the only state that still offers unlimited lifetime medical on an auto policy, and the choice you make about it is the most consequential one on the whole form. We walk you through it rather than reading you the levels.",
    points: [
      "Personal injury protection, explained in dollars rather than in tiers",
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
