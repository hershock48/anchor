/**
 * ANCHOR'S DEAL, IN ONE PLACE.
 *
 * glaze.md: every business fact lives in one constant file so a correction
 * is one edit. These are the numbers from the proposal ($3,500 build, half
 * and half, $150 a month) and the Exhibit A terms, including the online
 * payment service that the v1.0 master has no clause for. The acceptance
 * page renders from here, the acceptance email quotes from here, and the
 * paper draft in the private contracts folder is generated from the same
 * facts by hand-copy (named below).
 *
 * SURFACES THAT CANNOT READ FROM HERE: the proposal at
 * public/pitch/anchor/index.html is static HTML and repeats the build fee
 * and monthly fee in prose; the paper draft
 * (contracts-private/build-anchor-agreement.js) carries its own copy of
 * every constant. If a number here changes, both change by hand in the
 * same commit.
 *
 * The general terms are NOT restated here or on the acceptance page. They
 * are the Glazed Web Client Agreement v1.0, published at
 * glazedweb.com/agreement, incorporated by reference the same way the
 * menu-order clickwrap does. One text, one home, no drift.
 *
 * Client-safe: the acceptance form imports from here.
 */

export const agreement = {
  version: "Glazed Web Client Agreement v1.0",
  termsUrl: "https://glazedweb.com/agreement",
  pdfUrl: "https://glazedweb.com/glazed-web-agreement-v1.pdf",
  exhibit: "Exhibit A: Anchor Insurance, prepared 2026-09-02",

  client: "Anchor Insurance",
  /** The licensed entity, as in lib/site.ts. Confirm the registered form
   *  (LLC or otherwise) from her paperwork before acceptance. */
  clientLegal: "Anchor Insurance and Risk Management",
  clientTown: "Manchester, Michigan",
  /** Not bought yet. lib/site.ts carries the same assumption and flags it. */
  domain: "anchorinsurancemi.com (to be confirmed)",
  demo: "anchor.glazedweb.com/demo",

  buildFee: 3500,
  deposit: 1750,
  monthly: 150,
  /**
   * HOUSE NUMBERS FROM THE DEVINE ORDER, the other $150-a-month Custom
   * Order, set by Kevin on 2026-08-31 there. Confirm for Anchor before the
   * link goes to her; they are the two Exhibit A fields the MI Gas draft
   * also left open.
   */
  editAllowance: "2 hours per month",
  hourlyRate: 125,
  /** Customer-paid, per online card payment, shown as its own line item,
   *  collected by Glazed Web as the payment technology provider through
   *  Stripe at the moment of payment. Never charged to the client. */
  onlineFeeCents: 99,

  scope: [
    "The site: home, a page for each coverage line written (auto, home, renters, umbrella, life, business), the about page written from a recorded conversation with the owner in her own words, contact, privacy, the Michigan PIP tool, and four local guides.",
    "The giving page, stating the program plainly and pointing at the agency's social accounts. The agency posts the causes; the site carries no ledger, percentage, or write-ups to maintain.",
    "The quote flow: a two-step form whose submissions land in the workroom's leads queue, with call and text consent language.",
    "Pay your bill: one row per appointed carrier pointing at that carrier's own payment site and billing line, and the online payment service below for what the agency may collect itself.",
    "The workroom, the agency's own tool behind a passcode, included in the monthly fee: the leads queue, the book of customers and policies (with import from the agency management system's export), the payments view, the site facts editor (phone, hours, address, license numbers, links, edited by the agency and live within seconds), and the customer reminder emails.",
    "The logo prepared for the web from the agency's own artwork, in the formats the web asks for; search, maps and link-preview setup; structured data; the small studio credit in the footer.",
    "Email on the agency's own domain, set up at no charge once the domain exists.",
  ],

  notIncluded:
    "Text-message reminders (a paid third-party service you would hear the cost of first); photography; copywriting beyond the recorded-hour story and the pages listed; carrier logos and marketing-review approvals, which the agency obtains from each carrier; and Google Business Profile ownership, which the agency holds and we help set up.",

  /**
   * Part 3 of Exhibit A: the online payment service. These are terms, not
   * scope, and they are the part to show an attorney (glaze.md).
   */
  payments: [
    {
      lead: "Your Stripe account.",
      text: "You open and own your own account with Stripe, the card processor, and connect it under Glazed Web's Stripe platform so the site can create charges on it. Every payment settles to the bank account you designate, on Stripe's schedule. Stripe's processing fees are set by Stripe, shown in your Stripe account, and are your cost. You are responsible for Stripe's terms, for the tax reporting on your own receipts, and for settling premium into a trust or premium account where Michigan law requires it.",
    },
    {
      lead: "The online payment fee.",
      text: "Each successful online payment carries a flat $0.99 online payment fee, paid by the paying customer as its own line item, shown on the bill page before the customer continues and itemized on the checkout page and receipt. Glazed Web, as the payment technology provider, collects it through Stripe at the moment of payment, from that customer's payment and never from you. We do not invoice you for it and you never hold it. The amount changes only by written agreement of both of us, or under the annual adjustment clause (Section 2(f)) applied to the fee the same way it applies to the monthly fee.",
    },
    {
      lead: "Authority to collect, and the fee's posture.",
      text: "You alone decide which premiums you may lawfully collect: your own agency-billed invoices, and premium for carriers whose agency agreements authorize the agency to collect it. You set the per-carrier switch in the site accordingly and keep it current. Premium collected through the site is yours to remit to the carrier. Glazed Web is not an insurance producer, holds no premium, does not give legal advice, and makes no representation that any fee structure is permitted for your license. You have received our counsel review packet of September 1, 2026, which sets the Michigan DIFS guidance beside the processor-charged structure in current use in Michigan, and your acceptance records your own informed decision to offer the online channel with the fee, with or without your attorney's review.",
    },
    {
      lead: "The book, the records, and card data.",
      text: "The book (customer names, contact details, policy numbers, installment amounts and due dates) and the record of each payment made through the site are your content under Section 4(a). Card numbers are never entered on or stored by the site; the card is entered on Stripe's pages. We access the book only to do this work. On termination we give you an export of the book and the payment records in a common file format at no charge, end the platform connection to your Stripe account, and stop the pay links; your Stripe account, its history and its payouts remain yours.",
    },
    {
      lead: "Messages to customers.",
      text: "Reminder and receipt emails go out in your name. Until you have a mailbox on your own domain, we send them from an address we control with replies routed to your email, and move them to your domain when it exists. Text messages are not included.",
    },
    {
      lead: "Availability and responsibility.",
      text: "The service runs on Stripe and on the hosting in Section 2(d), and Section 7 applies to it. Glazed Web is not a party to any insurance contract and is not responsible for a lapse or cancellation caused by a late, failed, or misdirected customer payment, or by an installment amount or due date entered in the book; the site tells customers that a payment is not proof of coverage.",
    },
    {
      lead: "Your part.",
      text: "You keep the book accurate and current, by entering installments or importing your agency system's export, and tell us promptly if a carrier's collection authority changes.",
    },
  ],

  timeline:
    "Target launch date will be agreed in writing after acceptance. The site is built and reviewable at anchor.glazedweb.com/demo; launch waits on the intake sheet (your name, phone, email, address, hours, license numbers, carrier appointments and which permit collection, the Facebook page, the Google review link), the recorded hour for the about page, the domain, and the Stripe setup above.",
} as const;

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;

/**
 * A recorded acceptance, clickwrap style. THE EMAIL IS THE LEGAL RECORD:
 * both parties receive a copy carrying the version, the exhibit, the name
 * typed, and the timestamp. The stored row is the queryable second copy.
 */
export type AgreementAcceptance = {
  id: string;
  createdAt: number;
  business: string;
  name: string;
  title: string;
  email: string;
  /** ISO, stamped by the server at acceptance. */
  acceptedAt: string;
  version: string;
  exhibit: string;
  ip: string;
  userAgent: string;
};
