-- CreateEnum
CREATE TYPE "InquiryMessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "InquiryMessageAuthorType" AS ENUM ('GUEST', 'OWNER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "InquiryDraftStatus" AS ENUM ('DRAFT', 'PENDING_OWNER_APPROVAL', 'APPROVED', 'SENT');

-- CreateTable
CREATE TABLE "InquiryMessage" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "direction" "InquiryMessageDirection" NOT NULL,
    "authorType" "InquiryMessageAuthorType" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "emailMessageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InquiryMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InquiryReplyDraft" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" "InquiryDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByType" "InquiryMessageAuthorType" NOT NULL DEFAULT 'ASSISTANT',
    "approvedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InquiryReplyDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InquiryMessage_inquiryId_createdAt_idx" ON "InquiryMessage"("inquiryId", "createdAt");

-- CreateIndex
CREATE INDEX "InquiryReplyDraft_inquiryId_status_updatedAt_idx" ON "InquiryReplyDraft"("inquiryId", "status", "updatedAt");

-- AddForeignKey
ALTER TABLE "InquiryMessage" ADD CONSTRAINT "InquiryMessage_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryReplyDraft" ADD CONSTRAINT "InquiryReplyDraft_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
