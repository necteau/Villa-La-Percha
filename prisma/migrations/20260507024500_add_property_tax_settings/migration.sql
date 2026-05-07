-- Add per-property direct-booking tax display/collection settings.
DO $$ BEGIN
  CREATE TYPE "TaxCollectionMode" AS ENUM ('INCLUSIVE', 'SEPARATE', 'NONE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Property"
  ADD COLUMN IF NOT EXISTS "taxCollectionMode" "TaxCollectionMode" NOT NULL DEFAULT 'INCLUSIVE',
  ADD COLUMN IF NOT EXISTS "taxRate" DECIMAL(7, 6) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "taxLabel" TEXT NOT NULL DEFAULT 'Tax';
