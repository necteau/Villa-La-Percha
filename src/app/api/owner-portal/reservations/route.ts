import { NextResponse } from "next/server";
import { createReservation, listReservations, updateReservation } from "@/lib/reservations";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  const reservations = await listReservations();
  return NextResponse.json({ ok: true, reservations });
}

export async function POST(req: Request) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();

    if (body?.id) {
      const reservation = await updateReservation(String(body.id), body);
      if (!reservation) {
        return NextResponse.json({ ok: false, error: "Reservation not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, reservation });
    }

    const reservation = await createReservation(body);
    return NextResponse.json({ ok: true, reservation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to create/update reservation" },
      { status: 400 }
    );
  }
}
