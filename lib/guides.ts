/**
 * Local explainers.
 *
 * These exist because nobody else in the market is writing them, and because
 * the gap they fill is real: only about 58% of drivers say they fully
 * understand their own policy, and a third of shoppers now ask a chatbot to
 * explain coverage. An agency that answers the question properly is the one
 * that gets remembered, and this is the shape of page that gets cited when a
 * machine answers the question instead.
 *
 * Body is an array of blocks so the page can render headings and paragraphs
 * without a markdown dependency. Facts here are cross-checked against lib/pip.ts
 * where they overlap; that file is the source of truth for PIP numbers.
 */

export type Block = { h?: string; p?: string; note?: string };

export type Guide = {
  slug: string;
  title: string;
  dek: string;
  description: string;
  body: Block[];
};

export const guides: Guide[] = [
  {
    slug: "mini-tort",
    title: "Mini-tort, and the four limits nobody mentions",
    dek: "The most asked and least understood coverage in Michigan.",
    description:
      "Michigan mini-tort explained: the $3,000 cap, the fault rule, what it covers and what it does not.",
    body: [
      {
        p: "Somebody hits your car, it is clearly their fault, and your collision deductible is $500. Mini-tort is the piece of Michigan law that lets you recover that from the other driver. It is genuinely useful and it is much narrower than most people assume.",
      },
      { h: "It caps at $3,000" },
      {
        p: "That is the maximum, per accident, and it went up from $1,000 in the 2019 reform. If the damage exceeds it, mini-tort does not stretch.",
      },
      { h: "You have to be 50% at fault or less" },
      {
        p: "If you are more than half responsible you recover nothing. And if you are partly at fault, what you recover drops by your share, so a driver 30% at fault recovers 70% of what they would otherwise get.",
      },
      { h: "It only covers the vehicle" },
      {
        p: "Vehicle damage, and the deductible on it. Not injuries, which is what personal injury protection is for. Not a rental car. Not time off work.",
      },
      { h: "You claim it from the other driver, not from a policy that pays automatically" },
      {
        p: "Your carrier can pursue it for you, and most will, but it is a claim against the at-fault driver’s mini-tort coverage, and it does not simply arrive.",
      },
      {
        note: "Worth knowing before you need it: if your collision deductible is $1,000, mini-tort still caps at $3,000 total but you can only recover the deductible you actually paid.",
      },
    ],
  },
  {
    slug: "excess-attendant-care",
    title: "The $15 coverage almost nobody in Michigan buys",
    dek: "Excess attendant care costs about the same as two coffees a year.",
    description:
      "Excess attendant care in Michigan costs roughly $14 to $18 a year and only about 5% of drivers carry it. What it does and why the take-up is so low.",
    body: [
      {
        p: "If you are badly hurt in a car accident and need someone at home to help you eat, dress or move, that is attendant care. Michigan’s 2019 reform capped what an auto policy pays a family member providing it at 56 hours a week.",
      },
      { h: "The gap that creates" },
      {
        p: "Fifty-six hours is eight hours a day. A catastrophic injury does not stop needing care at hour nine. Past that cap the family either pays out of pocket, hires an agency, or provides the care unpaid.",
      },
      { h: "The coverage that fills it" },
      {
        p: "Excess attendant care buys back the hours above the cap. Priced across Michigan carriers it generally runs in the range of $14 to $18 a year. Not a month.",
      },
      { h: "Roughly one driver in twenty has it" },
      {
        p: "Take-up sits around 5%. That is not a pricing problem. It is a nobody-mentioned-it problem, which describes a good deal of insurance.",
      },
      {
        note: "If you carry limited personal injury protection, this matters more, not less, because your total medical pot is already capped.",
      },
    ],
  },
  {
    slug: "storm-claims-after-march-6",
    title: "After March 6: what a wind and hail claim actually involves",
    dek: "The strongest tornado in Michigan since 1977 touched down fifteen miles from here.",
    description:
      "The March 6, 2026 tornadoes hit Branch, St. Joseph, Cass and Calhoun counties. What a wind and hail deductible really costs, what replacement cost means, and how to spot a storm chaser.",
    body: [
      {
        p: "On March 6, 2026 four tornadoes touched down across southwest Michigan. The Union City tornado was rated EF-3 with peak winds of 160 mph and killed three people, injuring twelve. The National Weather Service recorded it as the strongest tornado in Michigan since the F4 that struck Kalamazoo and Eaton counties on April 2, 1977. A fourth tornado, an EF-0 with 85 mph winds, touched down in Clarendon Township, in Calhoun County.",
      },
      {
        p: "We are writing this because it happened here, not to frighten anybody into buying something. Three things about storm claims are worth understanding before you need them, and all three are easier to fix in February than in March.",
      },
      { h: "Your wind and hail deductible is probably not a dollar figure" },
      {
        p: "Many Michigan homeowners policies carry a separate wind and hail deductible set as a percentage of the dwelling amount, not as a flat number. On a house insured for $300,000, a 2% wind and hail deductible is $6,000, not the $1,000 you may have in mind from the rest of the policy. People find this out at the worst possible moment.",
      },
      { h: "Replacement cost and actual cash value are not close to each other" },
      {
        p: "Actual cash value pays what the roof was worth the day before the storm, depreciation subtracted. Replacement cost pays what it costs to put a new one on. On a fifteen year old roof that difference can be most of the claim. Check which one you have.",
      },
      { h: "The contractors arrive before the adjuster does" },
      {
        p: "After a storm of any size, crews from out of state show up in the neighborhoods that were hit. Some are fine. The ones that are not ask you to sign something on the spot, offer to cover your deductible, or want money before work starts. Michigan licenses residential builders, and the license is checkable in about a minute.",
      },
      {
        note: "Waiving or covering a customer’s deductible is not a discount, it is generally insurance fraud, and it is the clearest signal that the person on your porch is not the one to hire.",
      },
      { h: "What to do in the first day" },
      {
        p: "Photograph everything before anything is moved or covered. Make the temporary repairs that stop further damage and keep the receipts, because that is covered. Call your agent before you call a contractor. And do not throw anything away until the adjuster has seen it.",
      },
    ],
  },
  {
    slug: "why-your-rate-depends-on-where-you-live",
    title: "ZIP codes were banned in 2020. So why does your address still matter?",
    dek: "Because the rating factor changed shape instead of going away.",
    description:
      "Michigan banned ZIP code and credit score as auto insurance rating factors in 2020. Territories drawn from census tracts replaced them, which is why Marshall, Battle Creek and Albion still quote differently.",
    body: [
      {
        p: "The 2019 reform banned a specific list of rating factors from Michigan auto insurance, ZIP code and credit score among them, and the ban took effect in 2020. People reasonably concluded that where they live stopped mattering. Two quotes from two sides of the same county say otherwise.",
      },
      { h: "What replaced it" },
      {
        p: "Carriers moved to territories built from census tracts, grid systems and other geographic units that are not ZIP codes. The prohibited factor is gone. Geography is not, because claims genuinely do cluster.",
      },
      { h: "What that means for you" },
      {
        p: "Marshall, Battle Creek and Albion can quote differently on identical drivers and identical cars, and the difference between carriers in the same town can be larger than the difference between towns. Which is the actual argument for shopping it instead of renewing.",
      },
      {
        note: "If a quote seems out of line with a neighbor’s, it is more often a different carrier’s territory map than a mistake on your record. Worth asking about before you assume.",
      },
    ],
  },
];
