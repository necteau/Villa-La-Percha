import { NextResponse } from "next/server";
import { listExternalReservations } from "@/lib/externalReservations";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";

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

export async function POST() {
  return NextResponse.json({ ok: false, error: "External reservations are read-only integration records." }, { status: 405 });
}
