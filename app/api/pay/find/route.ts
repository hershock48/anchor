import { NextResponse } from "next/server";
import { getStore } from "@/lib/workroom/store";
import { normalizePolicyNumber, normalizeZip } from "@/lib/workroom/book";
import { mintPayLink, payLinkPath, payLinkSecret } from "@/lib/paylink";
import { clientKey, limiter } from "@/lib/ratelimit";

/**
 * Find your bill: policy number plus ZIP, the two things a customer knows.
 *
 * A hit mints a one-hour pay link and sends the browser there; a miss lands
 * on the static no-match page and counts against the caller's address, so
 * a script cannot sweep policy numbers. The response never says which of
 * the two fields was wrong. Plain form POST, so it works with scripts off.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const finds = limiter("find-bill", { windowMs: 10 * 60 * 1000, max: 8 });

export async function POST(req: Request) {
  const back = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return back("/pay");
  }
  const str = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v.trim().slice(0, 100) : "";
  };
  if (str("company")) return back("/pay"); // honeypot
  if (!payLinkSecret()) return back("/pay");

  const key = clientKey(req);
  if (!finds.allowed(key)) return back("/pay/no-match");

  const policyNumberKey = normalizePolicyNumber(str("policy"));
  const zip = normalizeZip(str("zip"));
  if (policyNumberKey.length < 3 || zip.length !== 5) {
    finds.fail(key);
    return back("/pay/no-match");
  }

  const store = getStore();
  const candidates = (await store.policies.list({ policyNumberKey })).filter((p) => p.status === "active");
  for (const policy of candidates) {
    const customer = await store.customers.get(policy.customerId);
    if (customer && normalizeZip(customer.zip) === zip) {
      finds.clear(key);
      const token = mintPayLink(policy.id, 60 * 60);
      if (token) return back(payLinkPath(token));
    }
  }
  finds.fail(key);
  return back("/pay/no-match");
}
