import Link from "next/link";
import { notFound } from "next/navigation";
import { lines, site, ph, isPlaceholder } from "@/lib/site";

export function generateStaticParams() {
  return lines.map((l) => ({ slug: l.slug }));
}

/** Every route gets its own title and description. A shared one is a finding
 *  we make about other people's sites. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const line = lines.find((l) => l.slug === slug);
  if (!line) return {};
  return {
    title: `${line.name} insurance in ${site.contact.city}, Michigan`,
    description: line.short,
  };
}

export default async function CoveragePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const line = lines.find((l) => l.slug === slug);
  if (!line) notFound();

  const others = lines.filter((l) => l.slug !== slug);

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Coverage</p>
          <h1>{line.name}</h1>
          <p className="lede" style={{ marginTop: 14 }}>{line.blurb}</p>
          <p style={{ marginTop: 22 }}>
            <Link className="btn" href={`/quote?line=${line.slug}`}>
              Get a {line.name.toLowerCase()} quote
            </Link>
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap prose-2">
          <div>
            <h2>What we go through with you</h2>
            <ul className="ticks">
              {line.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {line.slug === "auto" ? (
              <p className="callout">
                Before you pick a personal injury protection level, look at what each one
                actually saves. <Link href="/tools/michigan-pip">We built a tool for it.</Link>
              </p>
            ) : null}

            {/* The cross-sell, per the client: prompts to ask, never advice
                about anyone's specific policy. The site has no idea what a
                visitor's policy says, and is built not to know, so every card
                is an invitation into the quote flow with the line preselected. */}
            {line.pairs.length > 0 && (
              <>
                <h2 style={{ marginTop: 34 }}>Worth pricing on the same call</h2>
                <div className="rules" style={{ marginTop: 18 }}>
                  {line.pairs.map((p) => {
                    const other = lines.find((l) => l.slug === p.line);
                    if (!other) return null;
                    return (
                      <div className="card" key={p.line}>
                        <h3>{other.name}</h3>
                        <p>{p.reason}</p>
                        <p style={{ marginTop: 10 }}>
                          <Link href={`/quote?line=${other.slug}`}>
                            Ask for {/^[aeiou]/i.test(other.name) ? "an" : "a"}{" "}
                            {other.name.toLowerCase()} price too
                          </Link>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <aside className="side">
            <h2>Ask a person</h2>
            <p>
              Send the declarations page from your current policy and we will read it and tell
              you plainly what is missing and what is overbought.
            </p>
            {!isPlaceholder(site.contact.phone) ? (
              <p><a className="btn ghost" href={`tel:${site.contact.phoneHref}`}>Call {site.contact.phone}</a></p>
            ) : (
              <p>Phone: <span className="ph">{ph(site.contact.phone)}</span></p>
            )}
            <h2 style={{ marginTop: 26 }}>Other coverage</h2>
            <ul className="sidelist">
              {others.map((o) => (
                <li key={o.slug}><Link href={`/coverage/${o.slug}`}>{o.name}</Link></li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
