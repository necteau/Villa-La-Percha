CREATE TYPE "ContractTemplateType" AS ENUM ('GUEST_RENTAL_AGREEMENT', 'OWNER_PLATFORM_AGREEMENT');
CREATE TYPE "ContractTemplateStatus" AS ENUM ('DRAFT', 'APPROVED', 'ARCHIVED');
CREATE TYPE "GuestContractExecutionStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'VOIDED', 'SUPERSEDED');

CREATE TABLE "ContractTemplate" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT,
  "type" "ContractTemplateType" NOT NULL,
  "status" "ContractTemplateStatus" NOT NULL DEFAULT 'DRAFT',
  "name" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "bodyMarkdown" TEXT NOT NULL,
  "bodyHash" TEXT NOT NULL,
  "pdfStorageUrl" TEXT,
  "reviewNotes" TEXT,
  "approvedAt" TIMESTAMP(3),
  "approvedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContractExecution" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "inquiryId" TEXT,
  "reservationId" TEXT,
  "customerId" TEXT,
  "status" "GuestContractExecutionStatus" NOT NULL DEFAULT 'DRAFT',
  "signerName" TEXT,
  "signerEmail" TEXT,
  "sentAt" TIMESTAMP(3),
  "viewedAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "voidedAt" TIMESTAMP(3),
  "supersededAt" TIMESTAMP(3),
  "finalPdfUrl" TEXT,
  "acceptedBodyHash" TEXT,
  "acceptanceIp" TEXT,
  "acceptanceUserAgent" TEXT,
  "acceptanceMetadata" JSONB,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContractExecution_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContractTemplate_type_version_propertyId_key" ON "ContractTemplate"("type", "version", "propertyId");
CREATE INDEX "ContractTemplate_propertyId_type_status_idx" ON "ContractTemplate"("propertyId", "type", "status");
CREATE INDEX "ContractTemplate_type_status_createdAt_idx" ON "ContractTemplate"("type", "status", "createdAt");

CREATE INDEX "ContractExecution_propertyId_status_createdAt_idx" ON "ContractExecution"("propertyId", "status", "createdAt");
CREATE INDEX "ContractExecution_inquiryId_status_idx" ON "ContractExecution"("inquiryId", "status");
CREATE INDEX "ContractExecution_reservationId_status_idx" ON "ContractExecution"("reservationId", "status");
CREATE INDEX "ContractExecution_customerId_status_idx" ON "ContractExecution"("customerId", "status");
CREATE INDEX "ContractExecution_templateId_status_idx" ON "ContractExecution"("templateId", "status");

ALTER TABLE "ContractTemplate" ADD CONSTRAINT "ContractTemplate_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractTemplate" ADD CONSTRAINT "ContractTemplate_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContractExecution" ADD CONSTRAINT "ContractExecution_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ContractTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContractExecution" ADD CONSTRAINT "ContractExecution_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractExecution" ADD CONSTRAINT "ContractExecution_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContractExecution" ADD CONSTRAINT "ContractExecution_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContractExecution" ADD CONSTRAINT "ContractExecution_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
