import { NextResponse } from "next/server";
import { listReservations } from "@/lib/reservations";
import { listPricingEntries } from "@/lib/pricingData";

export async function GET() {
  const [reservations, pricingEntries] = await Promise.all([listReservations(), listPricingEntries()]);
  const directPricing = pricingEntries
    .filter((entry) => entry.platform === "direct")
    .map((entry) => ({
      startDate: entry.startDate,
      endDate: entry.endDate,
      minimumStayNights: entry.minimumStayNights ?? null,
    }));

  return NextResponse.json({
    ok: true,
    directPricing,
    reservations: reservations.map((reservation) => ({
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      status: reservation.status,
      isOwnerWeek: reservation.isOwnerWeek,
    })),
  });
}
