import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isWorkroomAuthed } from "@/lib/workroom/auth";
import { getStore } from "@/lib/workroom/store";
import { FACTS_KEY, factDefaults, factEditorState } from "@/lib/content";
import { FACT_FIELDS, factError, type FactKey, type FactOverrides } from "@/lib/workroom/facts-def";

/**
 * The site's facts. GET is what the screen renders; PUT saves.
 *
 * The form posts EFFECTIVE values. Only a value that differs from the
 * checked-in default is stored as an edit, so a box typed back to (or cleared
 * to) the original drops its edit and its badge together. Deleting every edit
 * always leaves the site exactly as built: that is the whole contract.
 *
 * Validation runs the same factError the form ran. The form's pass is for a
 * fast message; this one is the one that counts.
 *
 * Both methods check the gate themselves, like every workroom route: a route
 * that trusts its caller is a route that lets anyone on the internet change
 * the phone number on her site.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });
  return NextResponse.json(await factEditorState());
}

export async function PUT(req: Request) {
  if (!(await isWorkroomAuthed())) return NextResponse.json({ error: "Locked." }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { values?: unknown } | null;
  if (!body || !body.values || typeof body.values !== "object") {
    return NextResponse.json({ error: "Malformed." }, { status: 400 });
  }
  const raw = body.values as Record<string, unknown>;

  const defaults = factDefaults();
  const overrides: FactOverrides = {};
  const errors: Partial<Record<FactKey, string>> = {};

  // Only whitelisted keys are even looked at; anything else in the payload is
  // dropped without comment.
  for (const field of FACT_FIELDS) {
    const submitted = raw[field.key];
    if (typeof submitted !== "string") continue;
    const value = submitted.trim();
    const err = factError(field, value);
    if (err) {
      errors[field.key] = err;
      continue;
    }
    if (value !== "" && value !== defaults[field.key]) overrides[field.key] = value;
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Check the marked boxes.", errors }, { status: 400 });
  }

  await getStore().setValue(FACTS_KEY, overrides);

  // Everything under the root layout re-renders on its next request. The
  // footer is on every page, so per-path bookkeeping would just be a list
  // that goes stale the day a page is added.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, ...(await factEditorState()) });
}
