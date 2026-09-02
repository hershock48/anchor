import Gate from "@/components/workroom/Gate";
import CustomerDetail from "@/components/workroom/CustomerDetail";
import { isWorkroomAuthed } from "@/lib/workroom/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Customer" };

export default async function WorkroomCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Gate initialAuthed={await isWorkroomAuthed()}>
      <CustomerDetail id={id} />
    </Gate>
  );
}
