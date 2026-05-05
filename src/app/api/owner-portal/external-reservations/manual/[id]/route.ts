import { NextRequest, NextResponse } from "next/server";
import { deleteExternalReservation, updateExternalReservation } from "@/lib/externalReservations";
import { requireOwnerPortalSession, requireOwnerPortalWriteAccess } from "@/lib/ownerPortalApi";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const writeBlocked = await requireOwnerPortalWriteAccess();
  if (writeBlocked) return writeBlocked;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const externalReservation = await updateExternalReservation(id, body);
    if (!externalReservation) return NextResponse.json({ ok: false, error: "External reservation not found" }, { status: 404 });
    return NextResponse.json({ ok: true, externalReservation });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to update external reservation" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const writeBlocked = await requireOwnerPortalWriteAccess();
  if (writeBlocked) return writeBlocked;

  const { id } = await context.params;

  try {
    const ok = await deleteExternalReservation(id);
    if (!ok) return NextResponse.json({ ok: false, error: "External reservation not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Failed to delete external reservation" }, { status: 500 });
  }
}
