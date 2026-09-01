/**
 * The whitelist of business facts the workroom can edit, one entry per
 * field, in the order the screen shows them.
 *
 * This file is the contract between three things: the facts screen renders
 * FROM it, the save route validates AGAINST it, and lib/content.ts merges BY
 * it. A field not listed here cannot be edited from the workroom at all,
 * which is the fear-proofing: she can change her phone number, she cannot
 * rename the licensed entity by accident. Names, the tagline, the carrier
 * list and the giving program stay in lib/site.ts on purpose; each of those
 * has a rule attached (a carrier needs its appointment and its marketing
 * terms confirmed, the giving copy has DIFS conditions on it) that a text
 * box cannot enforce.
 *
 * CLIENT-SAFE ON PURPOSE. No `server-only`, no `pg`, no store import: the
 * editor is a client component and reads labels and kinds from here, and
 * lib/workroom/leads.ts records what happens when a value import drags a
 * server module into the browser bundle.
 *
 * `kind` drives the keyboard and the save check. "text" is checked for length
 * only; "phone", "email" and "url" get a shape check because a typo there
 * breaks a link, not just a label.
 */

export type FactKind = "text" | "phone" | "email" | "url";

export type FactKey =
  | "ownerName"
  | "phone"
  | "email"
  | "street"
  | "city"
  | "zip"
  | "hoursWeekday"
  | "hoursSaturday"
  | "hoursSunday"
  | "producerNumber"
  | "npn"
  | "facebook"
  | "googleReview";

export type FactGroupId = "agency" | "reach" | "hours" | "license" | "links";

export type FactGroup = {
  id: FactGroupId;
  label: string;
  /** One plain sentence under the heading, saying where these show up. */
  note: string;
};

export type FactField = {
  key: FactKey;
  group: FactGroupId;
  label: string;
  kind: FactKind;
  /** One plain sentence under the input. House voice, no jargon. */
  help: string;
};

/** What the workroom stores: only edited fields, only whitelisted keys. */
export type FactOverrides = Partial<Record<FactKey, string>>;

export const FACT_GROUPS: FactGroup[] = [
  { id: "agency", label: "The agency", note: "Shown on the about page." },
  {
    id: "reach",
    label: "Reach us",
    note: "In the footer of every page, on the contact page, and behind every call-us link.",
  },
  {
    id: "hours",
    label: "Hours",
    note: "Written the way you would say them to a caller. Write Closed for a day you are not open.",
  },
  { id: "license", label: "License", note: "Printed in the footer and on the about page." },
  {
    id: "links",
    label: "Links",
    note: "A button on the site stays hidden until its link is filled in, so nothing points at a dead end.",
  },
];

export const FACT_FIELDS: FactField[] = [
  {
    key: "ownerName",
    group: "agency",
    label: "Owner",
    kind: "text",
    help: "Your name as it should read next to the license.",
  },
  {
    key: "phone",
    group: "reach",
    label: "Phone number",
    kind: "phone",
    help: "Becomes the tap-to-call link in the header, the footer and every call-us line.",
  },
  {
    key: "email",
    group: "reach",
    label: "Email address",
    kind: "email",
    help: "Every email link on the site points here.",
  },
  {
    key: "street",
    group: "reach",
    label: "Street address",
    kind: "text",
    help: "Line one only. The city and ZIP have their own boxes.",
  },
  {
    key: "city",
    group: "reach",
    label: "City",
    kind: "text",
    help: "Named in page titles and all through the site, so change it only if the office moves.",
  },
  { key: "zip", group: "reach", label: "ZIP code", kind: "text", help: "" },
  { key: "hoursWeekday", group: "hours", label: "Monday to Friday", kind: "text", help: "" },
  { key: "hoursSaturday", group: "hours", label: "Saturday", kind: "text", help: "" },
  { key: "hoursSunday", group: "hours", label: "Sunday", kind: "text", help: "" },
  {
    key: "producerNumber",
    group: "license",
    label: "Michigan producer license number",
    kind: "text",
    help: "",
  },
  {
    key: "npn",
    group: "license",
    label: "NPN",
    kind: "text",
    help: "Your National Producer Number.",
  },
  {
    key: "facebook",
    group: "links",
    label: "Facebook page",
    kind: "url",
    help: "The full address, starting with https://. The giving page and the giving card link here.",
  },
  {
    key: "googleReview",
    group: "links",
    label: "Google review link",
    kind: "url",
    help: "The direct write-a-review link from your Business Profile, not the profile page itself. The review button appears once this is in.",
  },
];

export const FACT_KEYS: FactKey[] = FACT_FIELDS.map((f) => f.key);

/** Generous cap; a street address is never 200 characters, a paste-bomb is. */
export const FACT_MAX_LENGTH = 200;

/**
 * Validate one submitted value for one field. Returns an error sentence to
 * show her, or null when the value is fine. Empty string is always valid: it
 * means "clear my edit, go back to what the site was built with".
 */
export function factError(field: FactField, value: string): string | null {
  if (value === "") return null;
  if (value.length > FACT_MAX_LENGTH) return "That looks too long. Please shorten it.";
  if (field.kind === "phone") {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      return "A phone number needs ten digits, like 734 555 0100.";
    }
  }
  if (field.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "That does not look like an email address.";
  }
  if (field.kind === "url" && !/^https:\/\/[^\s]+\.[^\s]+/.test(value)) {
    return "Please paste the full address, starting with https://";
  }
  return null;
}
