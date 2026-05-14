CREATE TYPE "ReservationEmailTemplateKind" AS ENUM ('FINAL_PAYMENT_REMINDER', 'UPCOMING_TRIP_DETAILS', 'CHECK_IN_INSTRUCTIONS', 'POST_STAY_THANK_YOU');
CREATE TYPE "ReservationEmailJobStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'SENT', 'CANCELLED', 'FAILED');

ALTER TABLE "Reservation"
  ADD COLUMN "needsReplyAt" TIMESTAMP(3),
  ADD COLUMN "lastGuestMessageAt" TIMESTAMP(3),
  ADD COLUMN "lastGuestMessageId" TEXT;

ALTER TABLE "InquiryMessage"
  ADD COLUMN "reservationId" TEXT;

CREATE TABLE "ReservationEmailTemplate" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "kind" "ReservationEmailTemplateKind" NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReservationEmailTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReservationEmailJob" (
  "id" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "templateId" TEXT,
  "kind" "ReservationEmailTemplateKind" NOT NULL,
  "status" "ReservationEmailJobStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3),
  "emailMessageId" TEXT,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReservationEmailJob_pkey" PRIMARY KEY ("id")
);

UPDATE "InquiryMessage" m
SET "reservationId" = r."id"
FROM "Reservation" r
WHERE r."sourceInquiryId" = m."inquiryId"
  AND (SELECT COUNT(*) FROM "Reservation" r2 WHERE r2."sourceInquiryId" = m."inquiryId") = 1;

CREATE UNIQUE INDEX "ReservationEmailTemplate_propertyId_kind_key" ON "ReservationEmailTemplate"("propertyId", "kind");
CREATE INDEX "ReservationEmailTemplate_propertyId_active_idx" ON "ReservationEmailTemplate"("propertyId", "active");
CREATE UNIQUE INDEX "ReservationEmailJob_reservationId_kind_key" ON "ReservationEmailJob"("reservationId", "kind");
CREATE INDEX "ReservationEmailJob_status_scheduledFor_idx" ON "ReservationEmailJob"("status", "scheduledFor");
CREATE INDEX "ReservationEmailJob_reservationId_status_idx" ON "ReservationEmailJob"("reservationId", "status");
CREATE INDEX "Reservation_propertyId_needsReplyAt_idx" ON "Reservation"("propertyId", "needsReplyAt");
CREATE INDEX "InquiryMessage_reservationId_createdAt_idx" ON "InquiryMessage"("reservationId", "createdAt");
CREATE INDEX "InquiryMessage_reservationId_direction_createdAt_idx" ON "InquiryMessage"("reservationId", "direction", "createdAt");

ALTER TABLE "InquiryMessage" ADD CONSTRAINT "InquiryMessage_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReservationEmailTemplate" ADD CONSTRAINT "ReservationEmailTemplate_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReservationEmailJob" ADD CONSTRAINT "ReservationEmailJob_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReservationEmailJob" ADD CONSTRAINT "ReservationEmailJob_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ReservationEmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
