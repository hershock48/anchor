import Link from "next/link";
import { giving, ph, isPlaceholder } from "@/lib/site";

/**
 * The active goal.
 *
 * There is no lifetime counter on this site yet and that is deliberate. A
 * counter reading $0 is worse than no counter, and a "$X donated" placeholder
 * that ships is how invented numbers reach real people. So the homepage
 * carries one cause, one target and one deadline instead, and the total moves
 * to the ledger once there is one.
 *
 * When `target` is still 0 the component renders the honest pre-launch state
 * rather than a bar at 0%, because an empty progress bar reads as a stalled
 * program rather than a new one.
 */
export default function GoalBar() {
  const { goal } = giving;
  const ready = goal.target > 0;
  const pct = ready ? Math.min(100, Math.round((goal.raised / goal.target) * 100)) : 0;

  return (
    <div className="goal">
      <p className="kicker">Right now we are raising for</p>
      <h2 className="goal-org">
        {isPlaceholder(goal.org) ? <span className="ph">{ph(goal.org)}</span> : goal.org}
      </h2>

      {ready ? (
        <>
          <div className="goal-nums">
            <span className="goal-raised">${goal.raised.toLocaleString()}</span>
            <span className="goal-target">of ${goal.target.toLocaleString()}</span>
          </div>
          <div
            className="goal-track"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress toward the goal for ${goal.org}`}
          >
            <span className="goal-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="goal-foot">
            <span>Every policy we write moves this.</span>
            <span>
              by{" "}
              {isPlaceholder(goal.deadline) ? (
                <span className="ph">{ph(goal.deadline)}</span>
              ) : (
                goal.deadline
              )}
            </span>
          </p>
        </>
      ) : (
        <p className="goal-pre">
          We are new, so this is honestly at zero. The first goal, the amount and the deadline
          go here the day the program opens, and every dollar after that lands in the ledger
          with a date on it.
        </p>
      )}

      <Link className="goal-link" href="/giving">
        How the giving works
      </Link>
    </div>
  );
}
