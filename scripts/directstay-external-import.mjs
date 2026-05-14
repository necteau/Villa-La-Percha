#!/usr/bin/env node

import fs from "node:fs";
import { PrismaClient, ReservationSource } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL && fs.existsSync(".env.local")) {
  const match = fs.readFileSync(".env.local", "utf8").match(/^DATABASE_URL=(.*)$/m);
  if (match?.[1]) process.env.DATABASE_URL = match[1].replace(/^['\"]|['\"]$/g, "");
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const source = process.env.EXTERNAL_IMPORT_SOURCE || "owner-portal-json";
const propertySlug = process.env.PROPERTY_SLUG || "villa-la-percha";
const jsonPath = process.env.EXTERNAL_IMPORT_JSON || "src/data/owner-portal-reservations.json";
const includeTypes = (process.env.EXTERNAL_IMPORT_TYPES || "Rental Guest,Airbnb,VRBO,External Booking,Owner")
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);
const cleanupBookingTypes = (process.env.EXTERNAL_CLEANUP_BOOKING_TYPES || "Rental Guest,Airbnb,VRBO,External Booking")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function nightsBetween(checkIn, checkOut) {
  return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
}

function normalizeStatus(value) {
  return String(value || "").toLowerCase().includes("cancel") ? "CANCELLED" : "ACTIVE";
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function sameDay(a, b) {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function hasDataMismatch(external, reservation) {
  const namesDiffer = Boolean(external.guestName && reservation.guestName && external.guestName.trim().toLowerCase() !== reservation.guestName.trim().toLowerCase());
  const emailsDiffer = Boolean(external.guestEmail && reservation.guestEmail && external.guestEmail.trim().toLowerCase() !== reservation.guestEmail.trim().toLowerCase());
  return namesDiffer || emailsDiffer || !sameDay(external.checkIn, reservation.checkIn) || !sameDay(external.checkOut, reservation.checkOut);
}

async function reconcileMatches(propertyId) {
  const [externals, reservations] = await Promise.all([
    prisma.externalReservation.findMany({ where: { propertyId, sourceStatus: "ACTIVE", matchStatus: { notIn: ["MATCHED", "IGNORED"] } } }),
    prisma.reservation.findMany({ where: { propertyId, status: { not: "CANCELLED" } } }),
  ]);
  let updated = 0;
  for (const external of externals) {
    const candidates = reservations.filter((reservation) => overlaps(external.checkIn, external.checkOut, reservation.checkIn, reservation.checkOut));
    if (candidates.length === 0) {
      if (external.matchStatus !== "NOT_MATCHED" || external.reservationId) {
        await prisma.externalReservation.update({ where: { id: external.id }, data: { matchStatus: "NOT_MATCHED", reservationId: null } });
        updated++;
      }
    } else if (candidates.length === 1) {
      await prisma.externalReservation.update({ where: { id: external.id }, data: { reservationId: candidates[0].id, matchStatus: hasDataMismatch(external, candidates[0]) ? "PENDING_MATCH" : "MATCHED" } });
      updated++;
    } else {
      await prisma.externalReservation.update({ where: { id: external.id }, data: { matchStatus: "CONFLICT", reservationId: null, confirmedAt: null, confirmedByUserId: null } });
      updated++;
    }
  }
  return { checked: externals.length, updated };
}

try {
  const property = await prisma.property.findUnique({ where: { slug: propertySlug }, include: { owner: true } });
  if (!property) throw new Error(`Property not found for slug ${propertySlug}`);

  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const imports = raw
    .filter((item) => includeTypes.includes(String(item.type || "").trim().toLowerCase()))
    .map((item) => ({
      ownerId: property.ownerId,
      propertyId: property.id,
      source,
      externalReservationId: String(item.id),
      guestName: item.guestName || null,
      guestEmail: item.guestEmail || null,
      guestPhone: item.guestPhone || null,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      totalAmount: Number(item.income || 0),
      currency: item.currency || property.currency || "USD",
      sourceStatus: normalizeStatus(item.status),
      rawPayload: item,
    }));

  const oldReservationCandidates = await prisma.reservation.findMany({
    where: {
      OR: [
        { source: { in: [ReservationSource.AIRBNB, ReservationSource.VRBO] } },
        { bookingType: { in: cleanupBookingTypes } },
      ],
    },
    select: { id: true, source: true, bookingType: true, checkIn: true, checkOut: true, guestName: true },
    orderBy: { checkIn: "asc" },
  });

  const oldByDates = new Map(oldReservationCandidates.map((item) => [`${item.checkIn.toISOString().slice(0, 10)}:${item.checkOut.toISOString().slice(0, 10)}`, item]));
  const comparison = imports.map((item) => {
    const key = `${item.checkIn}:${item.checkOut}`;
    const old = oldByDates.get(key);
    return {
      externalReservationId: item.externalReservationId,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      importSource: item.source,
      matchedOldReservationId: old?.id || null,
      matchedOldReservationSource: old?.source || null,
    };
  });

  let result = null;
  if (apply && imports.length > 0) {
    let upserted = 0;
    for (const item of imports) {
      await prisma.externalReservation.upsert({
        where: { ownerId_propertyId_source_externalReservationId: { ownerId: item.ownerId, propertyId: item.propertyId, source: item.source, externalReservationId: item.externalReservationId } },
        create: {
          ownerId: item.ownerId,
          propertyId: item.propertyId,
          source: item.source,
          externalReservationId: item.externalReservationId,
          sourceStatus: item.sourceStatus,
          guestName: item.guestName,
          guestEmail: item.guestEmail,
          guestPhone: item.guestPhone,
          checkIn: new Date(item.checkIn),
          checkOut: new Date(item.checkOut),
          totalAmount: item.totalAmount,
          currency: item.currency,
          rawPayload: item.rawPayload,
          lastSeenAt: new Date(),
          lastSyncedAt: new Date(),
          missingSince: null,
        },
        update: {
          sourceStatus: item.sourceStatus,
          guestName: item.guestName,
          guestEmail: item.guestEmail,
          guestPhone: item.guestPhone,
          checkIn: new Date(item.checkIn),
          checkOut: new Date(item.checkOut),
          totalAmount: item.totalAmount,
          currency: item.currency,
          rawPayload: item.rawPayload,
          lastSeenAt: new Date(),
          lastSyncedAt: new Date(),
          missingSince: null,
        },
      });
      upserted++;
    }
    const seen = imports.map((item) => item.externalReservationId);
    const missing = await prisma.externalReservation.updateMany({ where: { propertyId: property.id, source, sourceStatus: "ACTIVE", externalReservationId: { notIn: seen } }, data: { sourceStatus: "MISSING", missingSince: new Date(), lastSyncedAt: new Date() } });
    const reconciled = await reconcileMatches(property.id);
    result = { upserted, markedMissing: missing.count, reconciled: reconciled.updated };
  }

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    property: { id: property.id, slug: property.slug, ownerId: property.ownerId },
    importSource: source,
    jsonPath,
    includeTypes,
    cleanupBookingTypes,
    importCount: imports.length,
    oldReservationDeleteCandidateCount: oldReservationCandidates.length,
    comparison,
    result,
    note: apply ? "Imported external reservations and reconciled matches." : "Dry run only. Re-run with --apply to import.",
  }, null, 2));

  if (imports.some((item) => nightsBetween(item.checkIn, item.checkOut) <= 0)) {
    process.exitCode = 2;
  }
} finally {
  await prisma.$disconnect();
  await pool.end();
}
