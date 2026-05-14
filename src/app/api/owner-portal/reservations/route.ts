import { NextResponse } from "next/server";
import { createReservation, listReservations, updateReservation } from "@/lib/reservations";
import { requireOwnerPortalSession, requireOwnerPortalWriteAccess } from "@/lib/ownerPortalApi";
import { getOwnerPortalPropertyScope } from "@/lib/ownerPortalScope";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  const property = await getOwnerPortalPropertyScope();
  const reservations = await listReservations({ propertyId: property.id });
  return NextResponse.json({ ok: true, reservations });
}

export async function POST(req: Request) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const writeBlocked = await requireOwnerPortalWriteAccess();
  if (writeBlocked) return writeBlocked;

  try {
    const body = await req.json();

    const property = await getOwnerPortalPropertyScope();

    if (body?.id) {
      const reservation = await updateReservation(String(body.id), body, { propertyId: property.id });
      if (!reservation) {
        return NextResponse.json({ ok: false, error: "Reservation not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, reservation });
    }

    const reservation = await createReservation(body, { propertyId: property.id });
    return NextResponse.json({ ok: true, reservation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to create/update reservation" },
      { status: 400 }
    );
  }
}
