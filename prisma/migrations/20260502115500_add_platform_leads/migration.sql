CREATE TYPE "PlatformLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'UNQUALIFIED', 'ARCHIVED');

CREATE TABLE "PlatformLead" (
    "id" TEXT NOT NULL,
    "status" "PlatformLeadStatus" NOT NULL DEFAULT 'NEW',
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "propertyCount" INTEGER,
    "propertyLocation" TEXT,
    "currentWebsite" TEXT,
    "desiredCustomDomain" TEXT,
    "pms" TEXT,
    "launchTimeline" TEXT,
    "goal" TEXT,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'direct',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformLead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlatformLead_status_createdAt_idx" ON "PlatformLead"("status", "createdAt");
CREATE INDEX "PlatformLead_email_idx" ON "PlatformLead"("email");
