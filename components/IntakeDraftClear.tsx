"use client";

import { useEffect } from "react";
import { INTAKE_DRAFT_KEY } from "@/lib/intake-draft";

/**
 * Rendered on /intake/sent. Arriving here means the server accepted the
 * sheet, so the device-local draft has done its job and must go, or the next
 * visit to /intake restores answers she already sent and she sends them
 * twice thinking something failed.
 *
 * The fetch path in IntakeForm clears the draft itself before navigating;
 * this covers the plain-POST path, which only happens when scripts were off
 * for the SUBMIT but may be on for this page (a script that failed to load,
 * then loaded here). Clearing an already-cleared key is a no-op.
 */
export default function IntakeDraftClear() {
  useEffect(() => {
    try {
      localStorage.removeItem(INTAKE_DRAFT_KEY);
    } catch {}
  }, []);
  return null;
}
