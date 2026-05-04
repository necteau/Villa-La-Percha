#!/usr/bin/env node

import fs from "node:fs";
import { PrismaClient, ReservationSource } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL && fs.existsSync(".env.local")) {
  const match = fs.readFileSync(".env.local", "utf8").match(/^DATABASE_URL=(.*)$/m);
  if (match?.[1]) process.env.DATABASE_URL = match[1].replace(/^['\"]|['\"]$/g, "");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for cleanup-imported-external-reservations.mjs");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const keepReservationId = process.env.KEEP_DIRECTSTAY_RESERVATION_ID;
const apply = process.argv.includes("--apply");

const externalSources = [ReservationSource.AIRBNB, ReservationSource.VRBO];
const externalBookingTypes = (process.env.EXTERNAL_CLEANUP_BOOKING_TYPES || "Rental Guest,Airbnb,VRBO,External Booking")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

try {
  const candidates = await prisma.reservation.findMany({
    where: {
      OR: [
        { source: { in: externalSources } },
        { bookingType: { in: externalBookingTypes } },
      ],
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
    externalBookingTypes,
    deleteCount: candidates.length,
    candidates,
  }, null, 2));

  if (apply && candidates.length > 0) {
    const ids = candidates.map((item) => item.id);
    await prisma.externalReservation.updateMany({
      where: { reservationId: { in: ids } },
      data: { reservationId: null, matchStatus: "NOT_MATCHED", confirmedAt: null, confirmedByUserId: null },
    });
    await prisma.reservation.deleteMany({ where: { id: { in: ids } } });
    console.log(`Deleted ${candidates.length} imported external reservation row(s) from Reservation.`);
  } else if (!apply) {
    console.log("Dry run only. Re-run with --apply after confirming the manually-created DirectStay test reservation is not in the candidate list.");
  }
} finally {
  await prisma.$disconnect();
  await pool.end();
}
