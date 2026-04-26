import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { listPricingEntries, updatePricingEntry } from "@/lib/pricingData";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  const entries = await listPricingEntries();
  return NextResponse.json({ ok: true, entries });
}

export async function POST(req: Request) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const id = String(body?.id || "");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing pricing entry id" }, { status: 400 });
    }

    const entry = await updatePricingEntry(id, body);
    if (!entry) {
      return NextResponse.json({ ok: false, error: "Pricing entry not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update pricing entry" },
      { status: 400 }
    );
  }
}
