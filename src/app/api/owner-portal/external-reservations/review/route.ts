import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/db";
import { canUseDatabaseSync } from "@/lib/fallbackOrchestrator";
import { listExternalReservationReviewItems } from "@/lib/externalReservationReconciliation";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  if (!canUseDatabaseSync()) {
    return NextResponse.json({ ok: true, reviewItems: [] });
  }

  try {
    const prisma = await getPrismaClient();
    const property = await prisma.property.findUnique({ where: { slug: "villa-la-percha" }, select: { id: true } });
    if (!property) return NextResponse.json({ ok: true, reviewItems: [] });

    const reviewItems = await listExternalReservationReviewItems(property.id);
    return NextResponse.json({ ok: true, reviewItems });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to load external reservation review items" },
      { status: 500 },
    );
  }
}
