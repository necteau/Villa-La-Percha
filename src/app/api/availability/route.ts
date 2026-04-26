import { NextResponse } from "next/server";
import { listReservations } from "@/lib/reservations";

export async function GET() {
  const reservations = await listReservations();
  return NextResponse.json({
    ok: true,
    reservations: reservations.map((reservation) => ({
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      status: reservation.status,
      isOwnerWeek: reservation.isOwnerWeek,
    })),
  });
}
