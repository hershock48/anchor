import Gate from "@/components/workroom/Gate";
import BookImport from "@/components/workroom/BookImport";
import { isWorkroomAuthed } from "@/lib/workroom/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Import the book" };

export default async function WorkroomImportPage() {
  return (
    <Gate initialAuthed={await isWorkroomAuthed()}>
      <BookImport />
    </Gate>
  );
}
