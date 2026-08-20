import Link from "next/link";
import { notFound } from "next/navigation";
import { guides } from "@/lib/guides";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guides.find((x) => x.slug === slug);
  if (!g) return {};
  return { title: g.title, description: g.description };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guides.find((x) => x.slug === slug);
  if (!g) notFound();

  return (
    <>
      <section className="pagehead">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <p className="kicker">
            <Link href="/guides">Guides</Link>
          </p>
          <h1>{g.title}</h1>
          <p className="lede" style={{ marginTop: 14 }}>{g.dek}</p>
        </div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <div className="wrap prose" style={{ maxWidth: 760 }}>
          {g.body.map((b, i) => (
            <div key={i}>
              {b.h ? <h2>{b.h}</h2> : null}
              {b.p ? <p>{b.p}</p> : null}
              {b.note ? <p className="callout">{b.note}</p> : null}
            </div>
          ))}
          <p style={{ marginTop: 32 }}>
            <Link className="btn" href="/quote">Get a quote</Link>
          </p>
        </div>
      </section>
    </>
  );
}
