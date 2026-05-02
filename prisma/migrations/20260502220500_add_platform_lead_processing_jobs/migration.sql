CREATE TYPE "PlatformLeadProcessingJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

CREATE TABLE "PlatformLeadProcessingJob" (
    "id" TEXT NOT NULL,
    "platformLeadId" TEXT NOT NULL,
    "status" "PlatformLeadProcessingJobStatus" NOT NULL DEFAULT 'PENDING',
    "kind" TEXT NOT NULL DEFAULT 'INTAKE',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformLeadProcessingJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlatformLeadProcessingJob_status_createdAt_idx" ON "PlatformLeadProcessingJob"("status", "createdAt");
CREATE INDEX "PlatformLeadProcessingJob_platformLeadId_createdAt_idx" ON "PlatformLeadProcessingJob"("platformLeadId", "createdAt");

ALTER TABLE "PlatformLeadProcessingJob" ADD CONSTRAINT "PlatformLeadProcessingJob_platformLeadId_fkey" FOREIGN KEY ("platformLeadId") REFERENCES "PlatformLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
