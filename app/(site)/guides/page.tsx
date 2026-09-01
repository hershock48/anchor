import Link from "next/link";
import { guides } from "@/lib/guides";

export const metadata = {
  title: "Guides",
  description:
    "Plain explanations of the Michigan coverage rules people actually ask about: mini-tort, attendant care, and why your address still affects your rate.",
};

export default function GuidesIndex() {
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Guides</p>
          <h1>The questions we get asked</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            Written out properly, so you can read the answer at eleven at night without calling
            anybody.
          </p>
        </div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <ul className="guide-list">
            {guides.map((g) => (
              <li key={g.slug} className="reveal">
                <Link href={`/guides/${g.slug}`}>
                  <h2>{g.title}</h2>
                  <p>{g.dek}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
