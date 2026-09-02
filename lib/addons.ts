import { lines } from "@/lib/site";

/**
 * The little things by the register.
 *
 * Devine's cart shows three small add-ons at the last moment, the way a
 * flower shop keeps chocolates by the till. The insurance version is the
 * endorsements that cost little and matter a lot: the water backup nobody
 * has until the basement floods, the rental car while yours is in the
 * shop. A customer paying a bill is already thinking about the policy, so
 * this is the moment to ask.
 *
 * NOTHING HERE IS SOLD OR ADDED, and the strip says so in its own words. An
 * endorsement is written by the agent and priced by the carrier, so the
 * customer ticks "ask us" and the interest lands in the workroom's leads
 * queue with the agency emailed; the agent calls. Prompts, never advice:
 * every line says what the coverage IS and what it is for, never that this
 * customer needs it, and no price is quoted, because the site has no idea
 * what anyone's policy says and is built not to know (README, the
 * cross-sell rule).
 *
 * COPY SHAPE, per Kevin (September 2, 2026): the first line is the benefit
 * in plain words, what the customer gets out of it. The plus opens what it
 * actually does and when it matters. Nothing about price beyond "usually
 * small", and only where that is reliably true.
 *
 * Client-safe: no server imports. The cross-line prompts come from the
 * `pairs` the client curated on each line in lib/site.ts, so the two lists
 * agree with the coverage pages.
 */

export type AddOn = {
  key: string;
  name: string;
  /** The benefit, one line, shown closed. */
  short: string;
  /** What it does and when it matters, shown when the customer opens it. */
  more: string;
};

const BY_LINE: Record<string, AddOn[]> = {
  auto: [
    {
      key: "roadside",
      name: "Roadside assistance",
      short: "A breakdown becomes one phone call.",
      more: "Adds towing, jump starts, lockouts and flat tires to the policy, on the same number you already call. It usually costs less for the year than a motor club charges, and the number to call is on your insurance ID card.",
    },
    {
      key: "rental",
      name: "Rental car after a claim",
      short: "You keep driving while yours is in the shop.",
      more: "After a covered accident, the policy pays for a rental car for the days the repair takes. Without it, a two-week repair is two weeks of asking for rides.",
    },
    {
      key: "glass",
      name: "Full glass",
      short: "A cracked windshield is fixed with no deductible.",
      more: "Glass repair and replacement without your collision deductible applying, so a rock on I-94 is a phone call instead of a $500 decision. Michigan winters are why this exists.",
    },
    {
      key: "gap",
      name: "Loan or lease payoff",
      short: "A totaled car does not leave you owing on a car you no longer have.",
      more: "If the car is totaled, this pays the gap between what it was worth and what you still owe on the loan or lease. Matters most in the first two or three years of a new car, when the loan is ahead of the value.",
    },
  ],
  home: [
    {
      key: "water-backup",
      name: "Water and sewer backup",
      short: "A flooded basement is covered. Without this, it usually is not.",
      more: "A standard homeowners policy excludes water that backs up through drains or a sump pump that fails. This endorsement covers the cleanup and what was ruined. It is the claim we see most often that people assumed they already had.",
    },
    {
      key: "service-line",
      name: "Service line",
      short: "A collapsed sewer or water line to the house is paid for, not dug out of savings.",
      more: "Covers the underground water, sewer, power and data lines you own between the street and the house. The utility's responsibility stops at the property line, and a sewer lateral replacement is a five-figure dig.",
    },
    {
      key: "equipment",
      name: "Equipment breakdown",
      short: "A furnace or AC that dies is covered like a fire would be.",
      more: "Homeowners covers fire and storms, not a compressor or a control board that fails. This covers sudden mechanical and electrical breakdown of the systems and appliances in the house, usually for a small amount a year.",
    },
    {
      key: "scheduled",
      name: "Scheduled valuables",
      short: "The ring, the tools or the collection are covered for what they are actually worth.",
      more: "Standard policies cap jewelry, tools and collections at modest amounts. Scheduling an item covers it for its appraised value, usually with no deductible and including loss, not just theft.",
    },
  ],
  renters: [
    {
      key: "replacement-cost",
      name: "Replacement cost on your things",
      short: "You get what a new one costs, not what the old one was worth.",
      more: "Without it, a five-year-old TV pays out as a five-year-old TV. With it, the payout is what it costs to buy one today. A small change to the premium for a big change on the day you need it.",
    },
    {
      key: "scheduled",
      name: "Scheduled valuables",
      short: "A ring, an instrument or a bike is covered for its full value.",
      more: "Renters policies cap the expensive single items. Scheduling one covers it for its value, usually with no deductible and including loss, not just theft.",
    },
  ],
  life: [
    {
      key: "waiver",
      name: "Waiver of premium",
      short: "If you cannot work, the policy keeps itself in force.",
      more: "If a disability keeps you from working, the premiums are waived and the coverage stays exactly as it was. It is the rider that keeps a policy alive at the moment it could not be replaced.",
    },
    {
      key: "child-rider",
      name: "Child term rider",
      short: "A small amount of coverage on each child, on your policy.",
      more: "Adds a modest benefit for each child under one rider, and can usually be converted to their own policy later without a medical exam.",
    },
  ],
  business: [
    {
      key: "hnoa",
      name: "Hired and non-owned auto",
      short: "An employee's fender-bender on a work errand is the business's claim, covered.",
      more: "Covers the business when an employee drives their own car, or a rental, on company business. The employee's personal policy does not cover the business, and the business is who gets sued.",
    },
    {
      key: "cyber",
      name: "Cyber liability",
      short: "A ransomware note or a spoofed invoice does not close the business.",
      more: "Covers the costs after a data breach or a ransomware attack, including notifying customers, restoring systems and the money lost to a fraudulent transfer. Small businesses are the usual target because they are the softest.",
    },
    {
      key: "tools",
      name: "Tools and equipment away from the shop",
      short: "What is in the truck and on the job site is covered, not just what is in the building.",
      more: "Property coverage usually stops at the building's door. This covers tools and equipment while they are in the truck, on a job, or stolen from either.",
    },
  ],
  umbrella: [],
};

/**
 * What to show on a bill for this line: its own endorsements, then the other
 * lines the client marked as worth pricing on the same call. At most four,
 * because a strip is not a catalog, and the client's pairs keep their slots
 * (they are her curated cross-sell), so the endorsements fill what is left.
 */
export function addOnsFor(line: string): AddOn[] {
  const pairs = (lines.find((l) => l.slug === line)?.pairs ?? []).map((p) => {
    const other = lines.find((l) => l.slug === p.line)!;
    return {
      key: `line-${p.line}`,
      name: `${other.name} coverage`,
      short: other.short,
      more: p.reason,
    };
  });
  const own = (BY_LINE[line] ?? []).slice(0, Math.max(0, 4 - pairs.length));
  return [...own, ...pairs];
}

/** Resolve submitted keys back to names, dropping anything not offered. */
export function addOnNames(line: string, keys: string[]): string[] {
  const offered = addOnsFor(line);
  return keys.map((k) => offered.find((a) => a.key === k)?.name).filter((n): n is string => !!n);
}
