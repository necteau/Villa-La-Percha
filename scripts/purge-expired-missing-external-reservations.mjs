#!/usr/bin/env node

import { PrismaClient, ExternalReservationSourceStatus } from "@prisma/client";

const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");
const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

try {
  const candidates = await prisma.externalReservation.findMany({
    where: {
      sourceStatus: ExternalReservationSourceStatus.MISSING,
      reservationId: null,
      missingSince: { lt: cutoff },
    },
    select: {
      id: true,
      source: true,
      externalReservationId: true,
      guestName: true,
      checkIn: true,
      checkOut: true,
      missingSince: true,
    },
    orderBy: { missingSince: "asc" },
  });

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", cutoff, deleteCount: candidates.length, candidates }, null, 2));

  if (apply && candidates.length > 0) {
    await prisma.externalReservation.deleteMany({ where: { id: { in: candidates.map((item) => item.id) } } });
    console.log(`Deleted ${candidates.length} expired missing external reservation row(s).`);
  } else if (!apply) {
    console.log("Dry run only. Re-run with --apply to delete expired, unlinked missing external reservations.");
  }
} finally {
  await prisma.$disconnect();
}
