import { NextResponse } from "next/server";
import { deleteReservation, updateReservation } from "@/lib/reservations";
import { requireOwnerPortalSession, requireOwnerPortalWriteAccess } from "@/lib/ownerPortalApi";
import { getOwnerPortalPropertyScope } from "@/lib/ownerPortalScope";

interface Context {
  params: Promise<{ id: string }>;
}

async function handleUpdate(req: Request, context: Context) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const writeBlocked = await requireOwnerPortalWriteAccess();
  if (writeBlocked) return writeBlocked;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const property = await getOwnerPortalPropertyScope();
    const reservation = await updateReservation(id, body, { propertyId: property.id });
    if (!reservation) {
      return NextResponse.json({ ok: false, error: "Reservation not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, reservation });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update reservation" },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request, context: Context) {
  return handleUpdate(req, context);
}

export async function POST(req: Request, context: Context) {
  return handleUpdate(req, context);
}

export async function DELETE(_req: Request, context: Context) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const writeBlocked = await requireOwnerPortalWriteAccess();
  if (writeBlocked) return writeBlocked;

  const { id } = await context.params;
  const property = await getOwnerPortalPropertyScope();
  const ok = await deleteReservation(id, { propertyId: property.id });
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Reservation not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
