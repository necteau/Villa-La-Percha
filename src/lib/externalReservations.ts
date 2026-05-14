import { ExternalReservationSourceStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/db";
import { canUseDatabaseSync } from "@/lib/fallbackOrchestrator";

export interface ExternalReservationRecord {
  id: string;
  source: string;
  externalReservationId: string;
  sourceStatus: "ACTIVE" | "CANCELLED" | "MISSING";
  matchStatus: string;
  reservationId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  totalAmount?: number;
  currency: string;
  notes?: string;
  blocksAvailability: boolean;
  lastSeenAt: string;
  updatedAt: string;
}

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function mapRecord(record: {
  id: string;
  source: string;
  externalReservationId: string;
  sourceStatus: ExternalReservationSourceStatus;
  matchStatus: string;
  reservationId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  checkIn: Date;
  checkOut: Date;
  totalAmount: { toString(): string } | number | null;
  currency: string;
  rawPayload: unknown;
  lastSeenAt: Date;
  updatedAt: Date;
}): ExternalReservationRecord {
  const raw = record.rawPayload && typeof record.rawPayload === "object" && !Array.isArray(record.rawPayload) ? record.rawPayload as { notes?: unknown } : {};
  return {
    id: record.id,
    source: record.source,
    externalReservationId: record.externalReservationId,
    sourceStatus: record.sourceStatus,
    matchStatus: record.matchStatus,
    reservationId: record.reservationId ?? undefined,
    guestName: record.guestName ?? undefined,
    guestEmail: record.guestEmail ?? undefined,
    guestPhone: record.guestPhone ?? undefined,
    checkIn: dateOnly(record.checkIn),
    checkOut: dateOnly(record.checkOut),
    totalAmount: record.totalAmount ? Number(record.totalAmount) : undefined,
    currency: record.currency,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    blocksAvailability: record.sourceStatus === ExternalReservationSourceStatus.ACTIVE,
    lastSeenAt: record.lastSeenAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listExternalReservations(options: { propertyId: string }): Promise<ExternalReservationRecord[]> {
  if (!canUseDatabaseSync()) return [];
  const prisma = await getPrismaClient();
  const records = await prisma.externalReservation.findMany({
    where: { propertyId: options.propertyId },
    orderBy: [{ checkIn: "asc" }, { source: "asc" }],
  });
  return records.map(mapRecord);
}
