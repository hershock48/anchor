import Gate from "@/components/workroom/Gate";
import PaymentsView from "@/components/workroom/PaymentsView";
import { isWorkroomAuthed } from "@/lib/workroom/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Payments" };

export default async function WorkroomPaymentsPage() {
  return (
    <Gate initialAuthed={await isWorkroomAuthed()}>
      <PaymentsView />
    </Gate>
  );
}
