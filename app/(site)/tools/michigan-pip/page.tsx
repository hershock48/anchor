import Link from "next/link";
import { pipLevels, pipMisconceptions, PIP_SOURCE } from "@/lib/pip";
import { getFacts } from "@/lib/content";

export const metadata = {
  title: "What each Michigan PIP level actually saves you",
  description:
    "Michigan personal injury protection, all six levels, with the average saving for each one and the eligibility rules most sites get wrong. Dropping to $500,000 saves about 3.6%.",
};

const verdictLabel = {
  default: "What you get by default",
  caution: "Anyone can pick this",
  restricted: "Eligibility rules apply",
} as const;

export default async function PipTool() {
  const facts = await getFacts();
  return (
    <>
      <section className="pagehead">
        <div className="wrap">
          <p className="kicker">Michigan drivers</p>
          <h1>What each PIP level actually saves you</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            Michigan is the only state that still offers unlimited lifetime medical on an auto
            policy, and choosing what to do about it is the most consequential decision on the
            form. Here is what each level saves, and who is allowed to pick it.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="tablewrap" tabIndex={0} role="region" aria-label="PIP levels table, scrolls sideways">
          <table className="pip">
            <caption className="vh">
              Michigan personal injury protection levels, average savings and eligibility
            </caption>
            <thead>
              <tr>
                <th scope="col">Level</th>
                <th scope="col">Average saving</th>
                <th scope="col">Who can pick it</th>
              </tr>
            </thead>
            <tbody>
              {pipLevels.map((l) => (
                <tr key={l.id} className={`pip-${l.verdict}`}>
                  <th scope="row">
                    <span className="pip-name">{l.label}</span>
                    <span className="pip-limit">{l.limit}</span>
                  </th>
                  <td className="pip-save">
                    {l.savings === 0 ? (
                      <span className="pip-base">baseline</span>
                    ) : l.savings === 100 ? (
                      <span>removes the coverage</span>
                    ) : (
                      <span>{l.savings}%</span>
                    )}
                  </td>
                  <td>
                    <span className="pip-flag">{verdictLabel[l.verdict]}</span>
                    <span className="pip-elig">{l.eligibility}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <p className="pip-source">
            {PIP_SOURCE.label}. {PIP_SOURCE.note}
          </p>
        </div>
      </section>

      <section className="band-sand">
        <div className="wrap">
          <h2 className="reveal">The one to look at hardest</h2>
          <div className="pip-detail">
            {pipLevels.map((l) => (
              <div key={l.id} className="card reveal">
                <h3>
                  {l.label}
                  {l.savings > 0 && l.savings < 100 ? (
                    <span className="pip-chip">saves {l.savings}%</span>
                  ) : null}
                </h3>
                <p>{l.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <h2 className="reveal">Three things Michigan sites keep getting wrong</h2>
          <dl className="myths">
            {pipMisconceptions.map((m) => (
              <div key={m.claim} className="reveal">
                <dt>{m.claim}</dt>
                <dd>{m.truth}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="band-navy">
        <div className="wrap close-in">
          <div>
            <h2>Want somebody to go through this with you?</h2>
            <p className="lede" style={{ marginTop: 12 }}>
              This is a decision worth twenty minutes and a real conversation. We are an
              independent agency in {facts.contact.city} and we will walk your household through
              it whether or not you end up buying from us.
            </p>
          </div>
          <div className="close-actions">
            <Link className="btn onnavy" href="/quote?line=auto">Get an auto quote</Link>
            <Link className="btn onnavy ghost-on-navy" href="/coverage/auto">Read about auto</Link>
          </div>
        </div>
      </section>
    </>
  );
}
