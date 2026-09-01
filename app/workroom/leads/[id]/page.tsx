import Gate from "@/components/workroom/Gate";
import LeadDetail from "@/components/workroom/LeadDetail";
import { isWorkroomAuthed } from "@/lib/workroom/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Lead" };

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Gate initialAuthed={await isWorkroomAuthed()}>
      <LeadDetail id={id} />
    </Gate>
  );
}
