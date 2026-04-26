import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { listPricingEntries } from "@/lib/pricingData";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  const entries = await listPricingEntries();
  return NextResponse.json({ ok: true, entries });
}
