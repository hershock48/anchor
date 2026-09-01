/**
 * Shared formatting for the workroom screens.
 *
 * Client side on purpose: every date here comes from fetched data, so it is
 * formatted after mount and there is no server render to mismatch. This is
 * also why the "no new Date() in a rendered page" trap in the README does not
 * bite: nothing below runs at build time.
 */

/** "Sep 1, 2:14 PM", or the year too when it is not this year. */
export function when(ms: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "3 days ago", for the queue's at-a-glance column. */
export function ago(ms: number): string {
  if (!ms) return "";
  const mins = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

export function money(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** Digits only, for tel: links. A phone number that is not a link is a
 *  usability finding we make about other people's sites. */
export function telHref(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}
