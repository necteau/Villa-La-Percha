#!/usr/bin/env node

import fs from "node:fs";
import { Pool } from "pg";

if (!process.env.DATABASE_URL && fs.existsSync(".env.local")) {
  const match = fs.readFileSync(".env.local", "utf8").match(/^DATABASE_URL=(.*)$/m);
  if (match?.[1]) process.env.DATABASE_URL = match[1].replace(/^['\"]|['\"]$/g, "");
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const sql = fs.readFileSync("prisma/migrations/20260504220500_add_external_reservation_reconciliation/migration.sql", "utf8")
  .replace(/CREATE TYPE "ExternalReservationSourceStatus" AS ENUM \('ACTIVE', 'CANCELLED', 'MISSING'\);/g, () => "DO $do$ BEGIN CREATE TYPE \"ExternalReservationSourceStatus\" AS ENUM ('ACTIVE', 'CANCELLED', 'MISSING'); EXCEPTION WHEN duplicate_object THEN NULL; END $do$;")
  .replace(/CREATE TYPE "ExternalReservationMatchStatus" AS ENUM \('NOT_MATCHED', 'PENDING_MATCH', 'MATCHED', 'CONFLICT', 'IGNORED'\);/g, () => "DO $do$ BEGIN CREATE TYPE \"ExternalReservationMatchStatus\" AS ENUM ('NOT_MATCHED', 'PENDING_MATCH', 'MATCHED', 'CONFLICT', 'IGNORED'); EXCEPTION WHEN duplicate_object THEN NULL; END $do$;")
  .replace(/CREATE TABLE "ExternalReservation" \(/g, "CREATE TABLE IF NOT EXISTS \"ExternalReservation\" (")
  .replace(/CREATE UNIQUE INDEX /g, "CREATE UNIQUE INDEX IF NOT EXISTS ")
  .replace(/CREATE INDEX /g, "CREATE INDEX IF NOT EXISTS ")
  .replace(/ALTER TABLE "Property"\n  ADD COLUMN "externalMatchReviewDelayDays" INTEGER NOT NULL DEFAULT 3;/g, "ALTER TABLE \"Property\" ADD COLUMN IF NOT EXISTS \"externalMatchReviewDelayDays\" INTEGER NOT NULL DEFAULT 3;")
  .replace(/ALTER TABLE "ExternalReservation"\n  ADD CONSTRAINT "ExternalReservation_propertyId_fkey"[\s\S]*?ON DELETE CASCADE ON UPDATE CASCADE;/g, () => `DO $do$ BEGIN
    ALTER TABLE "ExternalReservation" ADD CONSTRAINT "ExternalReservation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $do$;`)
  .replace(/ALTER TABLE "ExternalReservation"\n  ADD CONSTRAINT "ExternalReservation_reservationId_fkey"[\s\S]*?ON DELETE SET NULL ON UPDATE CASCADE;/g, () => `DO $do$ BEGIN
    ALTER TABLE "ExternalReservation" ADD CONSTRAINT "ExternalReservation_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL; END $do$;`);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(sql);
  console.log("External reservation migration SQL applied or already present.");
} finally {
  await pool.end();
}
