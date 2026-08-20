/**
 * Michigan personal injury protection levels.
 *
 * The savings percentages are from the Milliman report commissioned by the
 * Michigan Department of Insurance and Financial Services, published December
 * 2025, measured at July 2025 rates. They are statewide averages against the
 * unlimited level and they are the whole reason this tool is worth building:
 * the gap between what people assume the savings are and what they actually
 * are is enormous.
 *
 * These are averages. An individual quote will differ, and the page says so
 * rather than implying the number is a person's own.
 *
 * SOURCE OF TRUTH. If a figure here is corrected, it is corrected once.
 */

export const PIP_SOURCE = {
  label: "Milliman report for Michigan DIFS, December 2025, at July 2025 rates",
  note: "Statewide averages against the unlimited level. Your own quote will differ.",
} as const;

export type PipLevel = {
  id: string;
  label: string;
  limit: string;
  /** Average percent saved on the PIP portion versus unlimited. */
  savings: number;
  /** Who is allowed to pick it. Most sites get this part wrong. */
  eligibility: string;
  /** The honest read. */
  verdict: "default" | "caution" | "restricted";
  detail: string;
};

export const pipLevels: PipLevel[] = [
  {
    id: "unlimited",
    label: "Unlimited",
    limit: "No dollar cap on medical",
    savings: 0,
    eligibility: "Anyone. This is what you get if you do not choose at all.",
    verdict: "default",
    detail:
      "Michigan is the only state that still offers this. If nobody makes a choice on the form, this is the level that applies, which is the one piece of good news in the whole system.",
  },
  {
    id: "500k",
    label: "$500,000",
    limit: "$500,000 per person, per accident",
    savings: 3.6,
    eligibility: "Anyone.",
    verdict: "caution",
    detail:
      "This is the one to look at hardest. Giving up unlimited lifetime medical saves about three and a half percent of the PIP portion of your premium. Not thirty. Three and a half. Most people who pick this level believe they are saving far more than they are.",
  },
  {
    id: "250k",
    label: "$250,000",
    limit: "$250,000 per person, per accident",
    savings: 18.1,
    eligibility: "Anyone.",
    verdict: "caution",
    detail:
      "A real saving, and a real cap. A serious brain or spinal injury runs past $250,000 quickly, and after that the bills are yours. Worth choosing on purpose, not by accident.",
  },
  {
    id: "250k-optout",
    label: "$250,000 with an exclusion",
    limit: "$250,000, excluding household members covered elsewhere",
    savings: 25.4,
    eligibility:
      "Only if the people you are excluding have qualified health coverage that pays for auto injuries. Medicare alone does not count for this one.",
    verdict: "restricted",
    detail:
      "You are declining PIP for specific people in the household because their own health plan will cover them. If that plan turns out to exclude auto injuries, and many do, there is nothing underneath.",
  },
  {
    id: "50k",
    label: "$50,000",
    limit: "$50,000 per person, per accident",
    savings: 41.1,
    eligibility:
      "Only if you are enrolled in Medicaid, and everyone else in the household has Medicaid, other qualified coverage, or their own auto policy.",
    verdict: "restricted",
    detail:
      "The largest saving on the list and the tightest eligibility. If the Medicaid enrollment lapses, so does the basis for this selection.",
  },
  {
    id: "optout",
    label: "No PIP medical",
    limit: "None",
    savings: 100,
    eligibility:
      "Only if you have Medicare Parts A and B, and everyone else in the household has qualified coverage or their own policy.",
    verdict: "restricted",
    detail:
      "A full opt out of the medical portion. It is available to a narrow group and it removes the coverage entirely instead of capping it.",
  },
];

/** Things the state does not do, that Michigan agency sites routinely claim. */
export const pipMisconceptions = [
  {
    claim: "The state runs a rate comparison tool.",
    truth:
      "It does not. Michigan DIFS publishes complaint records by company, which is genuinely useful and almost nobody links to it, but there is no official price comparison.",
  },
  {
    claim: "Picking a lower PIP level cuts your whole premium by that percent.",
    truth:
      "The savings apply to the PIP portion, not the whole bill. The percentage you see quoted is not the percentage off your total.",
  },
  {
    claim: "Your ZIP code sets your rate.",
    truth:
      "ZIP code and credit score were banned as rating factors in 2020. Carriers moved to territories drawn from census tracts and grid systems instead, which is why Grass Lake, Jackson and Chelsea still quote differently.",
  },
];
