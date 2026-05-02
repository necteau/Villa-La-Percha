ALTER TYPE "PlatformLeadStatus" ADD VALUE IF NOT EXISTS 'SUSPICIOUS';
ALTER TYPE "PlatformLeadStatus" ADD VALUE IF NOT EXISTS 'SPAM';

CREATE TYPE "PlatformLeadArtifactType" AS ENUM ('LEAD_BRIEF', 'FIRST_RESPONSE_DRAFT', 'PROPOSAL_RATIONALE', 'PROPOSAL_DRAFT', 'ONBOARDING_BRIEF', 'ONBOARDING_EMAIL_DRAFT');
CREATE TYPE "PlatformLeadArtifactStatus" AS ENUM ('DRAFT', 'NEEDS_APPROVAL', 'APPROVED', 'SENT', 'REJECTED', 'SUPERSEDED');
CREATE TYPE "PreviewBuildStatus" AS ENUM ('DRAFT', 'READY_FOR_REVIEW', 'SHARED_WITH_LEAD', 'PROMOTED_TO_SITE', 'ARCHIVED');
CREATE TYPE "ContractExecutionStatus" AS ENUM ('NOT_STARTED', 'DRAFTED', 'SENT', 'SIGNED', 'COUNTERSIGNED', 'VOIDED');

ALTER TABLE "PlatformLead"
  ADD COLUMN "firstRead" TEXT,
  ADD COLUMN "nextAction" TEXT,
  ADD COLUMN "nextFollowUpAt" TIMESTAMP(3),
  ADD COLUMN "assignedToUserId" TEXT,
  ADD COLUMN "spamReason" TEXT,
  ADD COLUMN "spamReviewedAt" TIMESTAMP(3),
  ADD COLUMN "pricingSetupFeeCents" INTEGER,
  ADD COLUMN "pricingMonthlyFeeCents" INTEGER,
  ADD COLUMN "pricingCommissionBps" INTEGER,
  ADD COLUMN "pricingPaymentProcessingBps" INTEGER,
  ADD COLUMN "pricingNotes" TEXT,
  ADD COLUMN "contractStatus" "ContractExecutionStatus" NOT NULL DEFAULT 'NOT_STARTED',
  ADD COLUMN "contractSentAt" TIMESTAMP(3),
  ADD COLUMN "contractSignedAt" TIMESTAMP(3),
  ADD COLUMN "contractStorageUrl" TEXT,
  ADD COLUMN "launchChecklist" JSONB;

CREATE TABLE "PlatformLeadArtifact" (
  "id" TEXT NOT NULL,
  "platformLeadId" TEXT NOT NULL,
  "type" "PlatformLeadArtifactType" NOT NULL,
  "status" "PlatformLeadArtifactStatus" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "metadata" JSONB,
  "createdByEmail" TEXT,
  "approvedByEmail" TEXT,
  "approvedAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformLeadArtifact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PreviewBuild" (
  "id" TEXT NOT NULL,
  "platformLeadId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "PreviewBuildStatus" NOT NULL DEFAULT 'DRAFT',
  "propertyName" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "sourceUrls" TEXT[],
  "heroTitle" TEXT,
  "positioning" TEXT,
  "sections" JSONB,
  "ownerCallouts" JSONB,
  "sharedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PreviewBuild_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PreviewBuild_slug_key" ON "PreviewBuild"("slug");
CREATE INDEX "PlatformLead_assignedToUserId_nextFollowUpAt_idx" ON "PlatformLead"("assignedToUserId", "nextFollowUpAt");
CREATE INDEX "PlatformLeadArtifact_platformLeadId_createdAt_idx" ON "PlatformLeadArtifact"("platformLeadId", "createdAt");
CREATE INDEX "PlatformLeadArtifact_type_status_createdAt_idx" ON "PlatformLeadArtifact"("type", "status", "createdAt");
CREATE INDEX "PreviewBuild_platformLeadId_createdAt_idx" ON "PreviewBuild"("platformLeadId", "createdAt");
CREATE INDEX "PreviewBuild_status_createdAt_idx" ON "PreviewBuild"("status", "createdAt");

ALTER TABLE "PlatformLeadArtifact" ADD CONSTRAINT "PlatformLeadArtifact_platformLeadId_fkey" FOREIGN KEY ("platformLeadId") REFERENCES "PlatformLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PreviewBuild" ADD CONSTRAINT "PreviewBuild_platformLeadId_fkey" FOREIGN KEY ("platformLeadId") REFERENCES "PlatformLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
