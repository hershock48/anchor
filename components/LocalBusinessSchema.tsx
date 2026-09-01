import { site, isPlaceholder } from "@/lib/site";
import { getFacts } from "@/lib/content";
import { siteOrigin } from "@/lib/url";

/**
 * InsuranceAgency structured data.
 *
 * launch.md requires LocalBusiness data with hours and address on the homepage,
 * and the Griffin Claw proposal makes "no LocalBusiness schema anywhere" one of
 * its findings, so shipping without it would be us doing the thing we charge
 * other people for.
 *
 * BUT: every field it wants is a placeholder right now. Address, phone and
 * hours are all unknown, and structured data is a machine-readable claim to
 * Google about a real business. Emitting "[phone]" as a telephone number is not
 * a placeholder any more, it is a false fact published in the one format that
 * gets believed without a human looking at it.
 *
 * So this emits only what is actually known and OMITS the rest. When the facts
 * arrive, in lib/site.ts or through the workroom, they appear here automatically, because every field is
 * gated on the same isPlaceholder check the visible pages use. The missing ones
 * are on the README checklist.
 *
 * InsuranceAgency rather than LocalBusiness: it is a subtype of LocalBusiness,
 * so it satisfies anything expecting the parent while being more specific.
 */
export default async function LocalBusinessSchema() {
  const origin = siteOrigin();
  const facts = await getFacts();

  const hours = facts.hours
    .filter((h) => !isPlaceholder(h.open) && h.open.toLowerCase() !== "closed")
    .map((h) => ({ "@type": "OpeningHoursSpecification", description: `${h.days}: ${h.open}` }));

  const address: Record<string, string> = { "@type": "PostalAddress" };
  if (!isPlaceholder(facts.contact.street)) address.streetAddress = facts.contact.street;
  address.addressLocality = facts.contact.city;
  address.addressRegion = facts.contact.state;
  if (!isPlaceholder(facts.contact.zip)) address.postalCode = facts.contact.zip;
  address.addressCountry = "US";

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    name: site.name,
    legalName: site.legalName,
    // The former DBA, kept as an alternate name so anything that indexed the
    // agency under it before the August 2026 rename still resolves here.
    alternateName: "Insurance for a Cause",
    url: origin,
    logo: `${origin}/icon.png`,
    image: `${origin}/og.jpg`,
    slogan: site.tagline,
    description:
      "An independent Michigan insurance agency. We compare several carriers instead of selling one company’s product, and a percentage of what we earn goes back to local causes.",
    address,
    areaServed: { "@type": "State", name: "Michigan" },
    knowsAbout: [
      "Auto insurance",
      "Homeowners insurance",
      "Renters insurance",
      "Umbrella insurance",
      "Life insurance",
      "Commercial insurance",
      "Michigan no-fault personal injury protection",
    ],
  };

  // Only real values. A placeholder in structured data is a false fact in the
  // one format nobody eyeballs before believing it.
  if (!isPlaceholder(facts.contact.phone)) data.telephone = facts.contact.phone;
  if (!isPlaceholder(facts.contact.email)) data.email = facts.contact.email;
  if (hours.length) data.openingHoursSpecification = hours;

  return (
    <script
      type="application/ld+json"
      // Server-rendered from a literal object we built, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
