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
 * NOTHING HERE IS SOLD OR ADDED. An endorsement is written by the agent and
 * priced by the carrier, so the customer ticks "ask us" and the interest
 * lands in the workroom's leads queue with the agency emailed; the agent
 * calls. Prompts, never advice: every line says what the coverage IS, never
 * that this customer needs it, and no price is quoted, because the site has
 * no idea what anyone's policy says and is built not to know (README, the
 * cross-sell rule).
 *
 * Client-safe: no server imports. The cross-line prompts come from the
 * `pairs` the client curated on each line in lib/site.ts, so the two lists
 * agree with the coverage pages.
 */

export type AddOn = {
  key: string;
  name: string;
  /** One line, shown closed. */
  short: string;
  /** Two plain sentences, shown when the customer opens it. */
  more: string;
};

const BY_LINE: Record<string, AddOn[]> = {
  auto: [
    {
      key: "roadside",
      name: "Roadside assistance",
      short: "Tow, jump, lockout, flat.",
      more: "Adds roadside help to the policy, so a breakdown is a phone call instead of a search. Usually far less than a motor club membership for the same calls.",
    },
    {
      key: "rental",
      name: "Rental car while yours is in the shop",
      short: "A car to drive after a covered claim.",
      more: "Pays for a rental while your car is being repaired after a covered loss. Without it, a two-week repair is two weeks of rides.",
    },
    {
      key: "glass",
      name: "Full glass",
      short: "Windshield repair or replacement, no deductible.",
      more: "Covers glass repair and replacement without your collision deductible applying. Michigan roads in March are why this exists.",
    },
    {
      key: "gap",
      name: "Loan or lease payoff",
      short: "The gap between what you owe and what the car is worth.",
      more: "If the car is totaled, this pays the difference between its value and what is still owed on the loan or lease. Matters most in the first few years of a new car.",
    },
  ],
  home: [
    {
      key: "water-backup",
      name: "Water and sewer backup",
      short: "The flooded basement a standard policy does not cover.",
      more: "A standard homeowners policy excludes water that backs up through drains or a failed sump pump. This endorsement covers it, and it is the claim we see most often that people assumed they had.",
    },
    {
      key: "service-line",
      name: "Service line",
      short: "The pipes and wires between the street and the house.",
      more: "Covers the underground water, sewer, power and data lines you own between the property line and the house, which the utility does not. A collapsed sewer lateral is a five-figure dig.",
    },
    {
      key: "equipment",
      name: "Equipment breakdown",
      short: "Furnace, AC, appliances that fail electrically or mechanically.",
      more: "Homeowners covers fire and storms, not a compressor that dies. This covers sudden mechanical and electrical breakdown of the systems and appliances in the house.",
    },
    {
      key: "scheduled",
      name: "Scheduled valuables",
      short: "The ring, the tools, the collection, above the standard limits.",
      more: "Standard policies cap jewelry, tools and collections at modest amounts. Scheduling an item covers it for its appraised value, usually with no deductible.",
    },
  ],
  renters: [
    {
      key: "replacement-cost",
      name: "Replacement cost on your things",
      short: "New for old, instead of depreciated value.",
      more: "Without it, a five-year-old TV pays out as a five-year-old TV. With it, you get what a new one costs.",
    },
    {
      key: "scheduled",
      name: "Scheduled valuables",
      short: "A ring, an instrument, a bike, above the standard limits.",
      more: "Renters policies cap the expensive single items. Scheduling one covers it for its value, usually with no deductible.",
    },
  ],
  life: [
    {
      key: "waiver",
      name: "Waiver of premium",
      short: "The policy pays for itself if you are disabled.",
      more: "If a disability keeps you from working, the premiums are waived and the coverage stays in force. It is the rider that keeps a policy alive exactly when it cannot be replaced.",
    },
    {
      key: "child-rider",
      name: "Child term rider",
      short: "A small amount of coverage on each child, on your policy.",
      more: "Adds a modest death benefit for each child under one rider, usually convertible to their own policy later without a medical exam.",
    },
  ],
  business: [
    {
      key: "hnoa",
      name: "Hired and non-owned auto",
      short: "Employees running errands in their own cars.",
      more: "Covers the business when an employee drives their own car, or a rental, on company business. The employee's personal policy does not cover the business.",
    },
    {
      key: "cyber",
      name: "Cyber liability",
      short: "A breach, a ransomware note, a spoofed invoice.",
      more: "Covers the costs after a data breach or a ransomware attack, including notifying customers and restoring systems. Small businesses are the usual target because they are the softest.",
    },
    {
      key: "tools",
      name: "Tools and equipment away from the shop",
      short: "What is in the truck and on the job site.",
      more: "Property coverage usually stops at the building. This covers tools and equipment while they are in the truck or on a job.",
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
