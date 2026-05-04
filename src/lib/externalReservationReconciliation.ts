import { ExternalReservationMatchStatus, ExternalReservationSourceStatus, Prisma, ReservationStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/db";

export interface ExternalReservationImport {
  ownerId: string;
  propertyId: string;
  source: string;
  externalReservationId: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  checkIn: string | Date;
  checkOut: string | Date;
  totalAmount?: number | null;
  currency?: string;
  sourceStatus?: "active" | "cancelled";
  rawPayload?: unknown;
}

export type ExternalReviewCategory =
  | "pendingMatches"
  | "conflicts"
  | "dataMismatches"
  | "agedUnmatchedDirectStay"
  | "missingExternalReservations";

export interface ExternalReviewItem {
  category: ExternalReviewCategory;
  reservationId?: string;
  externalReservationId?: string;
  reason: string;
}

function toSourceStatus(value?: ExternalReservationImport["sourceStatus"]): ExternalReservationSourceStatus {
  return value === "cancelled" ? ExternalReservationSourceStatus.CANCELLED : ExternalReservationSourceStatus.ACTIVE;
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function toJsonInput(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function sameDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function hasDataMismatch(external: { guestName: string | null; guestEmail: string | null; checkIn: Date; checkOut: Date }, reservation: { guestName: string | null; guestEmail: string | null; checkIn: Date; checkOut: Date }): boolean {
  const namesDiffer = Boolean(external.guestName && reservation.guestName && external.guestName.trim().toLowerCase() !== reservation.guestName.trim().toLowerCase());
  const emailsDiffer = Boolean(external.guestEmail && reservation.guestEmail && external.guestEmail.trim().toLowerCase() !== reservation.guestEmail.trim().toLowerCase());
  return namesDiffer || emailsDiffer || !sameDay(external.checkIn, reservation.checkIn) || !sameDay(external.checkOut, reservation.checkOut);
}

export async function upsertExternalReservations(imports: ExternalReservationImport[], syncedAt = new Date()) {
  const prisma = await getPrismaClient();

  return Promise.all(imports.map((item) => prisma.externalReservation.upsert({
    where: {
      ownerId_propertyId_source_externalReservationId: {
        ownerId: item.ownerId,
        propertyId: item.propertyId,
        source: item.source,
        externalReservationId: item.externalReservationId,
      },
    },
    create: {
      ownerId: item.ownerId,
      propertyId: item.propertyId,
      source: item.source,
      externalReservationId: item.externalReservationId,
      sourceStatus: toSourceStatus(item.sourceStatus),
      guestName: item.guestName ?? null,
      guestEmail: item.guestEmail ?? null,
      guestPhone: item.guestPhone ?? null,
      checkIn: toDate(item.checkIn),
      checkOut: toDate(item.checkOut),
      totalAmount: item.totalAmount ?? null,
      currency: item.currency ?? "USD",
      rawPayload: toJsonInput(item.rawPayload),
      lastSeenAt: syncedAt,
      lastSyncedAt: syncedAt,
      missingSince: null,
    },
    update: {
      sourceStatus: toSourceStatus(item.sourceStatus),
      guestName: item.guestName ?? null,
      guestEmail: item.guestEmail ?? null,
      guestPhone: item.guestPhone ?? null,
      checkIn: toDate(item.checkIn),
      checkOut: toDate(item.checkOut),
      totalAmount: item.totalAmount ?? null,
      currency: item.currency ?? "USD",
      rawPayload: toJsonInput(item.rawPayload),
      lastSeenAt: syncedAt,
      lastSyncedAt: syncedAt,
      missingSince: null,
    },
  })));
}

export async function markMissingExternalReservations(propertyId: string, seenExternalIds: string[], source: string, syncedAt = new Date()) {
  const prisma = await getPrismaClient();
  return prisma.externalReservation.updateMany({
    where: {
      propertyId,
      source,
      sourceStatus: ExternalReservationSourceStatus.ACTIVE,
      externalReservationId: { notIn: seenExternalIds },
    },
    data: {
      sourceStatus: ExternalReservationSourceStatus.MISSING,
      missingSince: syncedAt,
      lastSyncedAt: syncedAt,
    },
  });
}

export async function confirmExternalReservationMatch(externalReservationId: string, reservationId: string, confirmedByUserId?: string) {
  const prisma = await getPrismaClient();
  return prisma.externalReservation.update({
    where: { id: externalReservationId },
    data: {
      reservationId,
      matchStatus: ExternalReservationMatchStatus.MATCHED,
      confirmedAt: new Date(),
      confirmedByUserId: confirmedByUserId ?? null,
    },
  });
}

export async function listExternalReservationReviewItems(propertyId: string, asOf = new Date()): Promise<ExternalReviewItem[]> {
  const prisma = await getPrismaClient();
  const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { externalMatchReviewDelayDays: true } });
  const delayDays = property?.externalMatchReviewDelayDays ?? 3;
  const cutoff = new Date(asOf.getTime() - delayDays * 24 * 60 * 60 * 1000);

  const [externalReservations, directReservations] = await Promise.all([
    prisma.externalReservation.findMany({
      where: { propertyId },
      include: { reservation: true },
      orderBy: { checkIn: "asc" },
    }),
    prisma.reservation.findMany({
      where: {
        propertyId,
        status: { not: ReservationStatus.CANCELLED },
        source: "DIRECT",
        createdAt: { lte: cutoff },
        externalMatches: { none: {} },
      },
      orderBy: { checkIn: "asc" },
    }),
  ]);

  const items: ExternalReviewItem[] = [];

  for (const external of externalReservations) {
    if (external.sourceStatus === ExternalReservationSourceStatus.MISSING) {
      items.push({
        category: "missingExternalReservations",
        externalReservationId: external.id,
        reservationId: external.reservationId ?? undefined,
        reason: external.reservationId
          ? "Linked external reservation disappeared from the latest integration run."
          : "External reservation disappeared from the latest integration run; it no longer blocks availability and will be removed after one day if it does not reappear.",
      });
      continue;
    }

    if (external.matchStatus === ExternalReservationMatchStatus.PENDING_MATCH) {
      items.push({ category: "pendingMatches", externalReservationId: external.id, reservationId: external.reservationId ?? undefined, reason: "Candidate match needs owner confirmation." });
      continue;
    }

    if (external.matchStatus === ExternalReservationMatchStatus.CONFLICT) {
      items.push({ category: "conflicts", externalReservationId: external.id, reservationId: external.reservationId ?? undefined, reason: "External reservation conflicts with DirectStay availability." });
      continue;
    }

    if (external.matchStatus === ExternalReservationMatchStatus.MATCHED && external.reservation && !external.confirmedAt && hasDataMismatch(external, external.reservation)) {
      items.push({ category: "dataMismatches", externalReservationId: external.id, reservationId: external.reservationId ?? undefined, reason: "Matched reservation has date, guest, or email differences until owner confirms the match." });
    }
  }

  for (const reservation of directReservations) {
    items.push({ category: "agedUnmatchedDirectStay", reservationId: reservation.id, reason: `DirectStay reservation has not matched an external reservation after ${delayDays} days.` });
  }

  return items;
}

export async function listAvailabilityBlocks(propertyId: string) {
  const prisma = await getPrismaClient();
  const [reservations, externalReservations] = await Promise.all([
    prisma.reservation.findMany({ where: { propertyId, status: { not: ReservationStatus.CANCELLED } }, select: { id: true, checkIn: true, checkOut: true, status: true, isOwnerWeek: true } }),
    prisma.externalReservation.findMany({ where: { propertyId, sourceStatus: ExternalReservationSourceStatus.ACTIVE }, select: { id: true, checkIn: true, checkOut: true, reservationId: true } }),
  ]);

  return [
    ...reservations.map((reservation) => ({ source: "directstay" as const, id: reservation.id, checkIn: reservation.checkIn, checkOut: reservation.checkOut, status: reservation.status, isOwnerWeek: reservation.isOwnerWeek })),
    ...externalReservations.map((external) => {
      const match = reservations.find((reservation) => reservation.id === external.reservationId);
      return {
        source: "external" as const,
        id: external.id,
        checkIn: match && !sameDay(match.checkIn, external.checkIn) && overlaps(match.checkIn, match.checkOut, external.checkIn, external.checkOut)
          ? new Date(Math.min(match.checkIn.getTime(), external.checkIn.getTime()))
          : external.checkIn,
        checkOut: match && !sameDay(match.checkOut, external.checkOut) && overlaps(match.checkIn, match.checkOut, external.checkIn, external.checkOut)
          ? new Date(Math.max(match.checkOut.getTime(), external.checkOut.getTime()))
          : external.checkOut,
        status: "Confirmed",
        isOwnerWeek: false,
      };
    }),
  ];
}
