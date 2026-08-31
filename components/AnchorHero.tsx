import { MARK_SRC } from "./Logo";

/**
 * The hero mark: the client's logo, hanging and swinging.
 *
 * Per the client on August 31, 2026: use the logo they have, and have it
 * swing. So: the real artwork on a paper plate, hung from a line, swinging
 * about the point it hangs from, because an anchor on a line rotates about
 * where it is held. One motion, one schedule; the negative delay means it is
 * already mid-swing on arrival rather than starting from a pose.
 *
 * The plate is not decoration: the artwork is navy-on-light and this hero is
 * navy, so the bare PNG would vanish into the ground (see Logo.tsx).
 *
 * Reduced motion is handled in globals.css: the sign simply hangs still,
 * which is the finished state.
 */
export default function AnchorHero() {
  return (
    <div className="ahero" aria-hidden="true">
      <div className="ahero-swing">
        <span className="ahero-rope" />
        <div className="ahero-plate">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MARK_SRC} width={228} height={270} alt="" />
        </div>
      </div>
    </div>
  );
}
