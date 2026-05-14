-- Add explicit test-data flags for safer production hygiene.
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "isTest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "isTest" BOOLEAN NOT NULL DEFAULT false;

-- Backfill/validate before attaching ExternalReservation.ownerId to Owner.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "ExternalReservation" er
    LEFT JOIN "Owner" o ON o."id" = er."ownerId"
    WHERE o."id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot add ExternalReservation.ownerId foreign key: orphan ownerId values exist';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = current_schema()
      AND table_name = 'ExternalReservation'
      AND constraint_name = 'ExternalReservation_ownerId_fkey'
  ) THEN
    ALTER TABLE "ExternalReservation"
      ADD CONSTRAINT "ExternalReservation_ownerId_fkey"
      FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
