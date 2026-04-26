import { NextResponse } from "next/server";
import { deleteReservation, updateReservation } from "@/lib/reservations";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: Context) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const reservation = await updateReservation(id, body);
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

export async function DELETE(_req: Request, context: Context) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const ok = await deleteReservation(id);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Reservation not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
