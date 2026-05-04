ALTER TABLE "Reservation" ADD COLUMN "sourceInquiryId" TEXT;

ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_sourceInquiryId_fkey"
  FOREIGN KEY ("sourceInquiryId") REFERENCES "Inquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Reservation_sourceInquiryId_idx" ON "Reservation"("sourceInquiryId");
