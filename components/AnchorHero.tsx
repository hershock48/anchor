import { MARK_REVERSE_SRC } from "./Logo";

/**
 * The hero mark: the client's anchor, hanging from a line, swinging.
 *
 * Just the anchor, per the client on August 31, 2026: no plate, no card. The
 * hero ground is navy, so this is the reversed cut, her artwork recolored
 * pixel for pixel (see Logo.tsx). The line runs into the ring, and the whole
 * thing swings about the point it hangs from, because an anchor on a line
 * rotates about where it is held. The negative delay means it is already
 * mid-swing on arrival rather than starting from a pose.
 *
 * Reduced motion is handled in globals.css: the anchor simply hangs still,
 * which is the finished state.
 */
export default function AnchorHero() {
  return (
    <div className="ahero" aria-hidden="true">
      <div className="ahero-swing">
        <span className="ahero-rope" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK_REVERSE_SRC} width={264} height={313} alt="" />
      </div>
    </div>
  );
}
