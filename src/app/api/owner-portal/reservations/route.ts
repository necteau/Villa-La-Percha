import { NextResponse } from "next/server";
import { createReservation, listReservations } from "@/lib/reservations";
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
    const reservation = await createReservation(body);
    return NextResponse.json({ ok: true, reservation }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to create reservation" }, { status: 400 });
  }
}
