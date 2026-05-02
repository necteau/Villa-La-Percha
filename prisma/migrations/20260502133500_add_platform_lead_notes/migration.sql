CREATE TABLE "PlatformLeadNote" (
    "id" TEXT NOT NULL,
    "platformLeadId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "authorEmail" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformLeadNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlatformLeadNote_platformLeadId_createdAt_idx" ON "PlatformLeadNote"("platformLeadId", "createdAt");
CREATE INDEX "PlatformLeadNote_authorUserId_createdAt_idx" ON "PlatformLeadNote"("authorUserId", "createdAt");

ALTER TABLE "PlatformLeadNote" ADD CONSTRAINT "PlatformLeadNote_platformLeadId_fkey" FOREIGN KEY ("platformLeadId") REFERENCES "PlatformLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlatformLeadNote" ADD CONSTRAINT "PlatformLeadNote_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
