import "server-only";

import { site, isPlaceholder } from "@/lib/site";
import { getStore } from "@/lib/workroom/store";
import { FACT_KEYS, type FactKey, type FactOverrides } from "@/lib/workroom/facts-def";

/**
 * The content seam: what the customer pages read instead of lib/site.ts
 * directly, for every fact the workroom can edit.
 *
 * lib/site.ts stays exactly what it was: the seed and the safety net. This
 * file reads the workroom's stored edits and lays them over the site.ts
 * values; where no edit exists, the site renders exactly as it did before the
 * editor existed, database or no database. Deleting every edit (or the whole
 * database) can only ever put the site back to its checked-in state, which is
 * what makes "you cannot break the site from this screen" literally true.
 *
 * Pages stay static. This runs at build and revalidate time, not per request:
 * the facts route calls revalidatePath("/", "layout") after a save, so an
 * edit is live within seconds without making any customer route dynamic.
 *
 * The one surface that CANNOT call this is a client component; it takes the
 * effective value as a prop from its server parent instead (Header gets the
 * phone that way from the site layout). Named in the README per the site.ts
 * doctrine, along with the pitch HTML, which reads from nothing.
 *
 * The returned shape mirrors `site` on purpose (facts.contact.phone where a
 * page used to read site.contact.phone), so switching a page over is a word
 * swap and the placeholder gating around each value is untouched.
 */

export const FACTS_KEY = "facts";

const HOURS_ROWS: { key: FactKey; days: string }[] = [
  { key: "hoursWeekday", days: "Monday to Friday" },
  { key: "hoursSaturday", days: "Saturday" },
  { key: "hoursSunday", days: "Sunday" },
];

function hoursDefault(days: string): string {
  return site.hours.find((h) => h.days === days)?.open ?? `PLACEHOLDER:${days} hours`;
}

const DEFAULTS: Record<FactKey, string> = {
  ownerName: site.owner.name,
  phone: site.contact.phone,
  email: site.contact.email,
  street: site.contact.street,
  city: site.contact.city,
  zip: site.contact.zip,
  hoursWeekday: hoursDefault("Monday to Friday"),
  hoursSaturday: hoursDefault("Saturday"),
  hoursSunday: hoursDefault("Sunday"),
  producerNumber: site.license.producerNumber,
  npn: site.license.npn,
  facebook: site.social.facebook,
  googleReview: site.social.googleReview,
};

export type Facts = {
  owner: { name: string; title: string };
  contact: {
    phone: string;
    /** For tel: links. Derived from the phone she typed, never stored twice. */
    phoneHref: string;
    email: string;
    street: string;
    city: string;
    county: string;
    state: string;
    zip: string;
    nearby: readonly string[];
    byAppointmentOnly: boolean;
  };
  hours: { days: string; open: string }[];
  license: { producerNumber: string; npn: string; states: readonly string[] };
  social: { facebook: string; google: string; googleReview: string };
  /** Which fields currently carry a workroom edit. */
  overridden: FactKey[];
};

/**
 * tel: digits from whatever she typed. Ten digits reads as a US number and
 * gets +1; eleven starting with 1 is the same number with the country code
 * typed out. Anything else passes through as digits, which is still a working
 * tel: link even if it is not E.164.
 */
function telFrom(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits;
}

export async function getFactOverrides(): Promise<FactOverrides> {
  const stored = await getStore().getValue<FactOverrides>(FACTS_KEY);
  if (!stored || typeof stored !== "object") return {};
  // Re-filter on read: a value written by an older or newer build only counts
  // if this build's whitelist knows the key.
  const clean: FactOverrides = {};
  for (const key of FACT_KEYS) {
    const v = stored[key];
    if (typeof v === "string" && v !== "") clean[key] = v;
  }
  return clean;
}

export async function getFacts(): Promise<Facts> {
  const overrides = await getFactOverrides();
  const value = (key: FactKey) => overrides[key] ?? DEFAULTS[key];
  const phone = value("phone");
  return {
    owner: { name: value("ownerName"), title: site.owner.title },
    contact: {
      phone,
      phoneHref: overrides.phone ? telFrom(phone) : site.contact.phoneHref,
      email: value("email"),
      street: value("street"),
      city: value("city"),
      county: site.contact.county,
      state: site.contact.state,
      zip: value("zip"),
      nearby: site.contact.nearby,
      byAppointmentOnly: site.contact.byAppointmentOnly,
    },
    hours: HOURS_ROWS.map((r) => ({ days: r.days, open: value(r.key) })),
    license: {
      producerNumber: value("producerNumber"),
      npn: value("npn"),
      states: site.license.states,
    },
    social: {
      facebook: value("facebook"),
      google: site.social.google,
      googleReview: value("googleReview"),
    },
    overridden: FACT_KEYS.filter((k) => k in overrides),
  };
}

/** The checked-in defaults, raw: a PLACEHOLDER marker where nothing is known yet. */
export function factDefaults(): Record<FactKey, string> {
  return { ...DEFAULTS };
}

export type FactEditorState = {
  /** What each box shows: her edit, else the built-in value, else empty. */
  values: Record<FactKey, string>;
  /** The built-in value under each box, or empty where the site has none yet. */
  placeholders: Record<FactKey, string>;
  overridden: FactKey[];
  /** Fields the site is still rendering as a marked blank. */
  blank: FactKey[];
  backend: "postgres" | "memory";
};

/**
 * What the facts screen renders. A PLACEHOLDER default never reaches the
 * form as text: the box is empty and the site keeps showing its marked blank
 * until she types something, which is also how the screen doubles as the
 * handover checklist.
 */
export async function factEditorState(): Promise<FactEditorState> {
  const overrides = await getFactOverrides();
  const values = {} as Record<FactKey, string>;
  const placeholders = {} as Record<FactKey, string>;
  const blank: FactKey[] = [];
  for (const key of FACT_KEYS) {
    const d = DEFAULTS[key];
    const builtIn = isPlaceholder(d) ? "" : d;
    values[key] = overrides[key] ?? builtIn;
    placeholders[key] = builtIn;
    if (isPlaceholder(overrides[key] ?? d)) blank.push(key);
  }
  return {
    values,
    placeholders,
    overridden: FACT_KEYS.filter((k) => k in overrides),
    blank,
    backend: getStore().backend,
  };
}
