-- Normalize inquiry lifecycle statuses to owner-facing workflow values.
-- Legacy values:
--   NEW       -> NEEDS_REPLY
--   REPLIED   -> AWAITING_GUEST
--   APPROVED  -> AWAITING_GUEST
--   CONVERTED -> BOOKED
--   DECLINED  -> CLOSED

ALTER TABLE "Inquiry" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "InquiryStatus_new" AS ENUM ('NEEDS_REPLY', 'AWAITING_GUEST', 'BOOKED', 'CLOSED');

ALTER TABLE "Inquiry"
  ALTER COLUMN "status" TYPE "InquiryStatus_new"
  USING (
    CASE "status"::text
      WHEN 'NEW' THEN 'NEEDS_REPLY'
      WHEN 'REPLIED' THEN 'AWAITING_GUEST'
      WHEN 'APPROVED' THEN 'AWAITING_GUEST'
      WHEN 'CONVERTED' THEN 'BOOKED'
      WHEN 'DECLINED' THEN 'CLOSED'
      WHEN 'NEEDS_REPLY' THEN 'NEEDS_REPLY'
      WHEN 'AWAITING_GUEST' THEN 'AWAITING_GUEST'
      WHEN 'BOOKED' THEN 'BOOKED'
      WHEN 'CLOSED' THEN 'CLOSED'
      ELSE 'NEEDS_REPLY'
    END
  )::"InquiryStatus_new";

DROP TYPE "InquiryStatus";
ALTER TYPE "InquiryStatus_new" RENAME TO "InquiryStatus";

ALTER TABLE "Inquiry" ALTER COLUMN "status" SET DEFAULT 'NEEDS_REPLY';
