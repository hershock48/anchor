import { NextResponse } from "next/server";
import { isWorkroomAuthed } from "@/lib/workroom/auth";
import { getStore } from "@/lib/workroom/store";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/workroom/leads";

/**
 * The leads queue. GET lists them, or with ?id= returns one. PUT moves a
 * lead's status and saves the agency's working notes.
 *
 * Every method checks the gate itself. The screens check too, but a route that
 * trusts its caller is a route that serves a customer list to anyone who types
 * the URL.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const store = getStore();
  const id = new URL(req.url).searchParams.get("id");

  if (id) {
    const lead = await store.getLead(id);
    if (!lead) return NextResponse.json({ error: "No such lead." }, { status: 404 });
    return NextResponse.json({ lead, backend: store.backend });
  }
  return NextResponse.json({ leads: await store.listLeads(), backend: store.backend });
}

export async function PUT(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  const p = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!p || typeof p.id !== "string") {
    return NextResponse.json({ error: "Malformed." }, { status: 400 });
  }

  const patch: { status?: LeadStatus; workNotes?: string } = {};
  if (typeof p.status === "string" && LEAD_STATUSES.includes(p.status as LeadStatus)) {
    patch.status = p.status as LeadStatus;
  }
  if (typeof p.workNotes === "string") patch.workNotes = p.workNotes.slice(0, 4000);

  const lead = await getStore().updateLead(p.id, patch);
  if (!lead) return NextResponse.json({ error: "No such lead." }, { status: 404 });
  return NextResponse.json({ ok: true, lead });
}
