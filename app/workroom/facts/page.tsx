import Gate from "@/components/workroom/Gate";
import FactsEditor from "@/components/workroom/FactsEditor";
import { isWorkroomAuthed } from "@/lib/workroom/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Site facts" };

export default async function WorkroomFactsPage() {
  return (
    <Gate initialAuthed={await isWorkroomAuthed()}>
      <FactsEditor />
    </Gate>
  );
}
