import Gate from "@/components/workroom/Gate";
import Book from "@/components/workroom/Book";
import { isWorkroomAuthed } from "@/lib/workroom/auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Book" };

export default async function WorkroomBookPage() {
  return (
    <Gate initialAuthed={await isWorkroomAuthed()}>
      <Book />
    </Gate>
  );
}
