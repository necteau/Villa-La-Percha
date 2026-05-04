-- External reservation reconciliation foundation

CREATE TYPE "ExternalReservationSourceStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'MISSING');
CREATE TYPE "ExternalReservationMatchStatus" AS ENUM ('NOT_MATCHED', 'PENDING_MATCH', 'MATCHED', 'CONFLICT', 'IGNORED');

ALTER TABLE "Property"
  ADD COLUMN "externalMatchReviewDelayDays" INTEGER NOT NULL DEFAULT 3;

CREATE TABLE "ExternalReservation" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "externalReservationId" TEXT NOT NULL,
  "sourceStatus" "ExternalReservationSourceStatus" NOT NULL DEFAULT 'ACTIVE',
  "matchStatus" "ExternalReservationMatchStatus" NOT NULL DEFAULT 'NOT_MATCHED',
  "reservationId" TEXT,
  "guestName" TEXT,
  "guestEmail" TEXT,
  "guestPhone" TEXT,
  "checkIn" TIMESTAMP(3) NOT NULL,
  "checkOut" TIMESTAMP(3) NOT NULL,
  "totalAmount" DECIMAL(10,2),
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "rawPayload" JSONB,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "missingSince" TIMESTAMP(3),
  "confirmedAt" TIMESTAMP(3),
  "confirmedByUserId" TEXT,
  "ignoredAt" TIMESTAMP(3),
  "ignoredByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ExternalReservation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExternalReservation_ownerId_propertyId_source_externalReservationId_key"
  ON "ExternalReservation"("ownerId", "propertyId", "source", "externalReservationId");
CREATE INDEX "ExternalReservation_propertyId_checkIn_checkOut_idx"
  ON "ExternalReservation"("propertyId", "checkIn", "checkOut");
CREATE INDEX "ExternalReservation_propertyId_sourceStatus_matchStatus_idx"
  ON "ExternalReservation"("propertyId", "sourceStatus", "matchStatus");
CREATE INDEX "ExternalReservation_reservationId_idx"
  ON "ExternalReservation"("reservationId");
CREATE INDEX "ExternalReservation_lastSeenAt_idx"
  ON "ExternalReservation"("lastSeenAt");

ALTER TABLE "ExternalReservation"
  ADD CONSTRAINT "ExternalReservation_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExternalReservation"
  ADD CONSTRAINT "ExternalReservation_reservationId_fkey"
  FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
