import Link from "next/link";
import { giving } from "@/lib/site";

export const metadata = {
  title: "The causes we support",
  description:
    "The local organizations this agency has supported, each with a short write-up: who they are, why we picked them, and what came of it.",
};

/**
 * This page replaced the donation ledger on August 28, 2026, per the client:
 * no amounts and no running total, write-ups instead. The empty state is the
 * honest one. Never seed a fake first story to make the page look started.
 */
export default function Causes() {
  const stories = giving.stories;

  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Our giving</p>
          <h1>The causes we support</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            Each one written up as it happens: who they are, why we picked them, and what
            came of it.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          {stories.length === 0 ? (
            <div className="causes-empty">
              <h2>We are new, and this page is honest about it.</h2>
              <p>
                The first cause we support will be written up here, and the page will be
                short for a while. We would rather show you nothing than something
                invented.
              </p>
              <p className="causes-empty-cta">
                <Link className="btn" href="/giving">How the giving works</Link>
              </p>
            </div>
          ) : (
            <div className="stories">
              {stories.map((s, i) => (
                <article className="story" key={`${s.date}-${i}`}>
                  <p className="story-date">{s.date}</p>
                  <h2>{s.title}</h2>
                  <p className="story-org">
                    {s.orgUrl ? <a href={s.orgUrl}>{s.org}</a> : s.org}, {s.city}
                  </p>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
