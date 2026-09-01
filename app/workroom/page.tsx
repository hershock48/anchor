import Gate from "@/components/workroom/Gate";
import LeadsQueue from "@/components/workroom/LeadsQueue";
import { isWorkroomAuthed } from "@/lib/workroom/auth";

/**
 * The workroom's front door is the LEADS QUEUE. Server wrapper so the first
 * paint already knows whether the cookie is good, instead of flashing the
 * passcode form at someone who is signed in.
 */
export const dynamic = "force-dynamic";

export default async function WorkroomPage() {
  return (
    <Gate initialAuthed={await isWorkroomAuthed()}>
      <LeadsQueue />
    </Gate>
  );
}
