#!/usr/bin/env node

import fs from "node:fs";
import { PrismaClient, ExternalReservationSourceStatus } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL && fs.existsSync(".env.local")) {
  const match = fs.readFileSync(".env.local", "utf8").match(/^DATABASE_URL=(.*)$/m);
  if (match?.[1]) process.env.DATABASE_URL = match[1].replace(/^['\"]|['\"]$/g, "");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for purge-expired-missing-external-reservations.mjs");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
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
  await pool.end();
}
