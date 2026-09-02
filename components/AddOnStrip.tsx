import { addOnsFor } from "@/lib/addons";

/**
 * The add-on strip on a bill: up to four small things worth asking about,
 * each with a plus that opens two plain sentences, and a box that means
 * "ask us". Renders inside whatever form surrounds it (the checkout form,
 * or the ask-us form for a bill that is paid elsewhere), so the ticks
 * travel with whatever the customer does next.
 *
 * Native <details> for the plus, so it opens without JavaScript and is
 * keyboard and screen-reader operable for free (the header menu's reason).
 * Nothing is added or priced here; see lib/addons.ts.
 */
export default function AddOnStrip({ line }: { line: string }) {
  const items = addOnsFor(line);
  if (items.length === 0) return null;
  return (
    <fieldset className="addons">
      <legend>
        Worth asking about <span className="addons-opt">optional</span>
      </legend>
      <p className="addons-note">
        Small additions that change a bad day. <strong>Ticking a box adds nothing to your
        policy.</strong> It asks us to call you with a price, and you decide then.
      </p>
      <ul className="addons-list">
        {items.map((a) => (
          <li className="addon" key={a.key}>
            <label className="addon-pick">
              <input type="checkbox" name="interest" value={a.key} aria-label={`Ask us about ${a.name.toLowerCase()}`} />
              <span>
                <strong>{a.name}</strong>
                <span className="addon-short"> {a.short}</span>
              </span>
            </label>
            <details className="addon-more">
              <summary>
                <span className="addon-plus" aria-hidden="true" />
                <span className="addon-sr">What {a.name.toLowerCase()} covers</span>
              </summary>
              <p>{a.more}</p>
            </details>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
