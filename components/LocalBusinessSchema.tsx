import { site, isPlaceholder } from "@/lib/site";
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
 * arrive in lib/site.ts they appear here automatically, because every field is
 * gated on the same isPlaceholder check the visible pages use. The missing ones
 * are on the README checklist.
 *
 * InsuranceAgency rather than LocalBusiness: it is a subtype of LocalBusiness,
 * so it satisfies anything expecting the parent while being more specific.
 */
export default function LocalBusinessSchema() {
  const origin = siteOrigin();

  const hours = site.hours
    .filter((h) => !isPlaceholder(h.open) && h.open.toLowerCase() !== "closed")
    .map((h) => ({ "@type": "OpeningHoursSpecification", description: `${h.days}: ${h.open}` }));

  const address: Record<string, string> = { "@type": "PostalAddress" };
  if (!isPlaceholder(site.contact.street)) address.streetAddress = site.contact.street;
  address.addressLocality = site.contact.city;
  address.addressRegion = site.contact.state;
  if (!isPlaceholder(site.contact.zip)) address.postalCode = site.contact.zip;
  address.addressCountry = "US";

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    name: site.name,
    legalName: site.legalName,
    alternateName: site.legalName,
    url: origin,
    logo: `${origin}/icon.png`,
    image: `${origin}/og.jpg`,
    slogan: site.tagline,
    description:
      "An independent Michigan insurance agency. We compare several carriers rather than selling one company's product, and a share of every commission goes to a local cause chosen by public vote.",
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
  if (!isPlaceholder(site.contact.phone)) data.telephone = site.contact.phone;
  if (!isPlaceholder(site.contact.email)) data.email = site.contact.email;
  if (hours.length) data.openingHoursSpecification = hours;

  return (
    <script
      type="application/ld+json"
      // Server-rendered from a literal object we built, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
