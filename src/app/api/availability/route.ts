import { NextResponse } from "next/server";
import { listReservations } from "@/lib/reservations";
import { listPricingEntries } from "@/lib/pricingData";
import { getPrismaClient } from "@/lib/db";
import { canUseDatabaseSync } from "@/lib/fallbackOrchestrator";
import { listAvailabilityBlocks } from "@/lib/externalReservationReconciliation";

async function listAvailabilityReservations() {
  if (!canUseDatabaseSync()) return listReservations();

  try {
    const prisma = await getPrismaClient();
    const property = await prisma.property.findUnique({ where: { slug: "villa-la-percha" }, select: { id: true } });
    if (!property) return listReservations();
    const blocks = await listAvailabilityBlocks(property.id);
    return blocks.map((block) => ({
      checkIn: block.checkIn.toISOString().slice(0, 10),
      checkOut: block.checkOut.toISOString().slice(0, 10),
      status: String(block.status),
      isOwnerWeek: block.isOwnerWeek,
    }));
  } catch {
    return listReservations();
  }
}

export async function GET() {
  const [reservations, pricingEntries] = await Promise.all([listAvailabilityReservations(), listPricingEntries()]);
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
