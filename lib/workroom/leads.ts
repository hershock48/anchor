/**
 * Lead shape and statuses, shared by the server store and the browser screens.
 *
 * THIS FILE MUST STAY FREE OF `server-only` AND OF ANY DATABASE IMPORT, and
 * that is not a style preference. It was split out of store.ts because the
 * screens import LEAD_STATUSES as a value, and a value import reaches through
 * to the whole module: `pg` followed it into the client bundle and the build
 * failed on `util/types`. Types alone would have been erased; the status list
 * is not a type. Keep constants the browser needs here, and keep everything
 * that touches a connection in store.ts.
 */

export type LeadStatus = "new" | "called" | "quoted" | "won" | "lost";

/** Queue order, loudest first: new work, work in progress, then the outcomes. */
export const LEAD_STATUSES: LeadStatus[] = ["new", "called", "quoted", "won", "lost"];

export type Lead = {
  id: string;
  /** When the customer submitted it. The queue sorts on this. */
  createdAt: number;
  updatedAt: number;
  status: LeadStatus;
  /** Coverage line slug from the quote form, e.g. "auto". May be empty. */
  line: string;
  name: string;
  phone: string;
  email: string;
  zip: string;
  /** What they said they need covered. */
  about: string;
  /** Step two of the form, all optional to the customer. */
  address: string;
  currentCarrier: string;
  renewal: string;
  /** The customer's own notes. */
  notes: string;
  /** Whether they ticked the contact consent box. Stored as given. */
  consent: string;
  /** The AGENCY's working notes, typed in the workroom. Never the customer's. */
  workNotes: string;
};
