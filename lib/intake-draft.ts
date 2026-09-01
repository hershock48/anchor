/**
 * The localStorage key for the intake sheet's draft, in one place because two
 * components must agree on it: IntakeForm saves and restores under it, and
 * the /intake/sent page clears it. If they drift apart, either drafts never
 * clear (stale answers restore into a sheet she already sent) or never
 * restore (the protection silently does nothing).
 *
 * Version suffix so a future change to the field set can abandon old drafts
 * cleanly instead of restoring them into renamed fields.
 */
export const INTAKE_DRAFT_KEY = "anchor-intake-draft-v1";
