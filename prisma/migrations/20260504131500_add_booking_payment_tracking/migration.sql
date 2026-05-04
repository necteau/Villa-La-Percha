CREATE TYPE "BookingPaymentStatus" AS ENUM ('UNPAID', 'DEPOSIT_REQUESTED', 'DEPOSIT_RECEIVED', 'PAID_IN_FULL', 'PARTIALLY_REFUNDED', 'REFUNDED');

ALTER TABLE "Reservation"
  ADD COLUMN "paymentStatus" "BookingPaymentStatus" NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN "depositAmount" DECIMAL(10,2),
  ADD COLUMN "amountReceived" DECIMAL(10,2),
  ADD COLUMN "paymentMethod" TEXT,
  ADD COLUMN "paymentConfirmedAt" TIMESTAMP(3),
  ADD COLUMN "paymentNote" TEXT;

ALTER TABLE "Inquiry"
  ADD COLUMN "quotedAmount" DECIMAL(10,2),
  ADD COLUMN "paymentStatus" "BookingPaymentStatus" NOT NULL DEFAULT 'UNPAID',
  ADD COLUMN "depositAmount" DECIMAL(10,2),
  ADD COLUMN "amountReceived" DECIMAL(10,2),
  ADD COLUMN "paymentMethod" TEXT,
  ADD COLUMN "paymentConfirmedAt" TIMESTAMP(3),
  ADD COLUMN "paymentNote" TEXT;
