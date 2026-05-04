import { NextRequest, NextResponse } from "next/server";
import { confirmExternalReservationMatch, ignoreExternalReservationReviewItem, unlinkExternalReservationMatch } from "@/lib/externalReservationReconciliation";
import { requireOwnerPortalSession, requireOwnerPortalWriteAccess } from "@/lib/ownerPortalApi";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const writeBlocked = await requireOwnerPortalWriteAccess();
  if (writeBlocked) return writeBlocked;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "confirm-match") {
      const externalReservation = await confirmExternalReservationMatch(id, body.reservationId ? String(body.reservationId) : undefined);
      return NextResponse.json({ ok: true, externalReservation });
    }

    if (action === "ignore") {
      const externalReservation = await ignoreExternalReservationReviewItem(id);
      return NextResponse.json({ ok: true, externalReservation });
    }

    if (action === "unlink") {
      const externalReservation = await unlinkExternalReservationMatch(id);
      return NextResponse.json({ ok: true, externalReservation });
    }

    return NextResponse.json({ ok: false, error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update external reservation" },
      { status: 500 },
    );
  }
}
