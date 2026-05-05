import { NextRequest, NextResponse } from "next/server";
import { createExternalReservation, listExternalReservations } from "@/lib/externalReservations";
import { requireOwnerPortalSession, requireOwnerPortalWriteAccess } from "@/lib/ownerPortalApi";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const externalReservations = await listExternalReservations();
    return NextResponse.json({ ok: true, externalReservations });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to load external reservations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const writeBlocked = await requireOwnerPortalWriteAccess();
  if (writeBlocked) return writeBlocked;

  try {
    const body = await request.json();
    const externalReservation = await createExternalReservation(body);
    return NextResponse.json({ ok: true, externalReservation });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to create external reservation" }, { status: 400 });
  }
}
