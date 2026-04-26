-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('LEAD', 'ACTIVE', 'BOOKED', 'REPEAT_GUEST', 'INACTIVE', 'DO_NOT_CONTACT', 'VIP');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "primaryPropertyId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "locationLabel" TEXT,
    "timezone" TEXT,
    "preferredContactMethod" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'LEAD',
    "notes" TEXT,
    "preferencesSummary" TEXT,
    "householdSummary" TEXT,
    "specialOccasions" TEXT,
    "conciergeInterests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN "customerId" TEXT;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN "customerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_ownerId_email_key" ON "Customer"("ownerId", "email");
CREATE INDEX "Customer_ownerId_createdAt_idx" ON "Customer"("ownerId", "createdAt");
CREATE INDEX "Customer_ownerId_status_idx" ON "Customer"("ownerId", "status");
CREATE INDEX "Inquiry_customerId_idx" ON "Inquiry"("customerId");
CREATE INDEX "Reservation_customerId_idx" ON "Reservation"("customerId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_primaryPropertyId_fkey" FOREIGN KEY ("primaryPropertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
