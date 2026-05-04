#!/usr/bin/env node

import { PrismaClient, ReservationSource } from "@prisma/client";

const prisma = new PrismaClient();

const keepReservationId = process.env.KEEP_DIRECTSTAY_RESERVATION_ID;
const apply = process.argv.includes("--apply");

const externalSources = [ReservationSource.AIRBNB, ReservationSource.VRBO];

try {
  const candidates = await prisma.reservation.findMany({
    where: {
      source: { in: externalSources },
      ...(keepReservationId ? { id: { not: keepReservationId } } : {}),
    },
    select: {
      id: true,
      source: true,
      bookingType: true,
      guestName: true,
      checkIn: true,
      checkOut: true,
    },
    orderBy: { checkIn: "asc" },
  });

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    keepReservationId: keepReservationId || null,
    deleteCount: candidates.length,
    candidates,
  }, null, 2));

  if (apply && candidates.length > 0) {
    await prisma.reservation.deleteMany({ where: { id: { in: candidates.map((item) => item.id) } } });
    console.log(`Deleted ${candidates.length} imported external reservation row(s) from Reservation.`);
  } else if (!apply) {
    console.log("Dry run only. Re-run with --apply after confirming the manually-created DirectStay test reservation is not in the candidate list.");
  }
} finally {
  await prisma.$disconnect();
}
