import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { updatePricingEntry } from "@/lib/pricingData";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: Context) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const entry = await updatePricingEntry(id, body);
    if (!entry) return NextResponse.json({ ok: false, error: "Pricing entry not found" }, { status: 404 });
    return NextResponse.json({ ok: true, entry });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to update pricing entry" }, { status: 400 });
  }
}
