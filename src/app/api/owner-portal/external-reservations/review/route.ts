import { NextResponse } from "next/server";
import { canUseDatabaseSync } from "@/lib/fallbackOrchestrator";
import { listExternalReservationReviewItems } from "@/lib/externalReservationReconciliation";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { getOwnerPortalPropertyScope } from "@/lib/ownerPortalScope";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  if (!canUseDatabaseSync()) {
    return NextResponse.json({ ok: true, reviewItems: [] });
  }

  try {
    const property = await getOwnerPortalPropertyScope();
    const reviewItems = await listExternalReservationReviewItems(property.id);
    return NextResponse.json({ ok: true, reviewItems });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to load external reservation review items" },
      { status: 500 },
    );
  }
}
