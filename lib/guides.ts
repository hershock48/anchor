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
        p: "Your carrier can pursue it for you, and most will, but it is a claim against the at-fault driver's mini-tort coverage rather than a benefit that simply arrives.",
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
        p: "If you are badly hurt in a car accident and need someone at home to help you eat, dress or move, that is attendant care. Michigan's 2019 reform capped what an auto policy pays a family member providing it at 56 hours a week.",
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
        p: "Take-up sits around 5%. That is not a pricing problem, it is a nobody-mentioned-it problem, which is a fair description of a lot of insurance.",
      },
      {
        note: "If you carry limited personal injury protection, this matters more rather than less, because your total medical pot is already capped.",
      },
    ],
  },
  {
    slug: "why-your-rate-depends-on-where-you-live",
    title: "ZIP codes were banned in 2020. So why does your address still matter?",
    dek: "Because the rating factor changed shape rather than going away.",
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
        p: "Marshall, Battle Creek and Albion can quote differently on identical drivers and identical cars, and the difference between carriers in the same town can be larger than the difference between towns. Which is the actual argument for shopping it rather than renewing.",
      },
      {
        note: "If a quote seems out of line with a neighbor's, it is more often a different carrier's territory map than a mistake on your record. Worth asking about rather than assuming.",
      },
    ],
  },
];
