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
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  source?: string;
  externalSourceId?: string;
}

function toSourceStatus(value?: ExternalReservationImport["sourceStatus"]): ExternalReservationSourceStatus {
  return String(value || "active").toLowerCase() === "cancelled" ? ExternalReservationSourceStatus.CANCELLED : ExternalReservationSourceStatus.ACTIVE;
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

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
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

export async function runExternalReservationSync(imports: ExternalReservationImport[], syncedAt = new Date()) {
  if (imports.length === 0) {
    throw new Error("External sync requires at least one import row. To mark a source empty, call markMissingExternalReservations with explicit property/source context.");
  }
  const grouped = new Map<string, { propertyId: string; source: string; externalIds: string[] }>();
  for (const item of imports) {
    const key = `${item.propertyId}:${item.source}`;
    const group = grouped.get(key) ?? { propertyId: item.propertyId, source: item.source, externalIds: [] };
    group.externalIds.push(item.externalReservationId);
    grouped.set(key, group);
  }

  const upserted = await upsertExternalReservations(imports, syncedAt);
  const missingResults = [];
  const reconcileResults = [];

  for (const group of grouped.values()) {
    missingResults.push(await markMissingExternalReservations(group.propertyId, group.externalIds, group.source, syncedAt));
    reconcileResults.push(await reconcileExternalReservationMatches(group.propertyId));
  }

  const purgeResult = await purgeExpiredMissingExternalReservations(syncedAt);

  return {
    upserted: upserted.length,
    markedMissing: missingResults.reduce((sum, result) => sum + result.count, 0),
    reconciled: reconcileResults.reduce((sum, result) => sum + result.updated, 0),
    purgedMissing: purgeResult.count,
  };
}

export async function reconcileExternalReservationMatches(propertyId: string) {
  const prisma = await getPrismaClient();
  const [externalReservations, directReservations] = await Promise.all([
    prisma.externalReservation.findMany({
      where: {
        propertyId,
        sourceStatus: ExternalReservationSourceStatus.ACTIVE,
        matchStatus: { notIn: [ExternalReservationMatchStatus.MATCHED, ExternalReservationMatchStatus.IGNORED] },
      },
      orderBy: { checkIn: "asc" },
    }),
    prisma.reservation.findMany({
      where: { propertyId, status: { not: ReservationStatus.CANCELLED } },
      orderBy: { checkIn: "asc" },
    }),
  ]);

  const updates = [];

  for (const external of externalReservations) {
    const candidates = directReservations.filter((reservation) => overlaps(external.checkIn, external.checkOut, reservation.checkIn, reservation.checkOut));
    if (candidates.length === 0) {
      if (external.matchStatus !== ExternalReservationMatchStatus.NOT_MATCHED || external.reservationId) {
        updates.push(prisma.externalReservation.update({ where: { id: external.id }, data: { matchStatus: ExternalReservationMatchStatus.NOT_MATCHED, reservationId: null } }));
      }
      continue;
    }

    if (candidates.length === 1) {
      updates.push(prisma.externalReservation.update({
        where: { id: external.id },
        data: {
          reservationId: candidates[0].id,
          matchStatus: hasDataMismatch(external, candidates[0]) ? ExternalReservationMatchStatus.PENDING_MATCH : ExternalReservationMatchStatus.MATCHED,
          confirmedAt: hasDataMismatch(external, candidates[0]) ? null : external.confirmedAt,
        },
      }));
      continue;
    }

    updates.push(prisma.externalReservation.update({
      where: { id: external.id },
      data: { matchStatus: ExternalReservationMatchStatus.CONFLICT, reservationId: null, confirmedAt: null, confirmedByUserId: null },
    }));
  }

  await Promise.all(updates);
  return { checked: externalReservations.length, updated: updates.length };
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

export async function confirmExternalReservationMatch(externalReservationId: string, reservationId?: string, confirmedByUserId?: string) {
  const prisma = await getPrismaClient();
  const external = await prisma.externalReservation.findUnique({ where: { id: externalReservationId }, select: { reservationId: true, propertyId: true, checkIn: true, checkOut: true, sourceStatus: true } });
  const targetReservationId = reservationId ?? external?.reservationId;
  if (!targetReservationId) throw new Error("A DirectStay reservation is required to confirm this match.");
  if (!external) throw new Error("External reservation not found.");
  if (external.sourceStatus !== ExternalReservationSourceStatus.ACTIVE) throw new Error("Only active external reservations can be matched.");
  const target = await prisma.reservation.findUnique({ where: { id: targetReservationId }, select: { id: true, propertyId: true, status: true, checkIn: true, checkOut: true } });
  if (!target) throw new Error("DirectStay reservation not found.");
  if (target.propertyId !== external.propertyId) throw new Error("External reservation and DirectStay reservation must belong to the same property.");
  if (target.status === ReservationStatus.CANCELLED) throw new Error("Cannot match an external reservation to a cancelled DirectStay reservation.");
  if (!overlaps(external.checkIn, external.checkOut, target.checkIn, target.checkOut)) throw new Error("External reservation and DirectStay reservation dates do not overlap.");

  return prisma.externalReservation.update({
    where: { id: externalReservationId },
    data: {
      reservationId: targetReservationId,
      matchStatus: ExternalReservationMatchStatus.MATCHED,
      confirmedAt: new Date(),
      confirmedByUserId: confirmedByUserId ?? null,
    },
  });
}

export async function assertExternalReservationPropertyAccess(externalReservationId: string, propertyId: string) {
  const prisma = await getPrismaClient();
  const external = await prisma.externalReservation.findUnique({ where: { id: externalReservationId }, select: { propertyId: true } });
  if (!external) throw new Error("External reservation not found.");
  if (external.propertyId !== propertyId) throw new Error("You do not have access to this external reservation.");
}

export async function ignoreExternalReservationReviewItem(externalReservationId: string, ignoredByUserId?: string) {
  const prisma = await getPrismaClient();
  return prisma.externalReservation.update({
    where: { id: externalReservationId },
    data: {
      matchStatus: ExternalReservationMatchStatus.IGNORED,
      ignoredAt: new Date(),
      ignoredByUserId: ignoredByUserId ?? null,
    },
  });
}

export async function unlinkExternalReservationMatch(externalReservationId: string) {
  const prisma = await getPrismaClient();
  return prisma.externalReservation.update({
    where: { id: externalReservationId },
    data: {
      reservationId: null,
      matchStatus: ExternalReservationMatchStatus.NOT_MATCHED,
      confirmedAt: null,
      confirmedByUserId: null,
    },
  });
}

export async function purgeExpiredMissingExternalReservations(asOf = new Date()) {
  const prisma = await getPrismaClient();
  const cutoff = new Date(asOf.getTime() - 24 * 60 * 60 * 1000);
  return prisma.externalReservation.deleteMany({
    where: {
      sourceStatus: ExternalReservationSourceStatus.MISSING,
      reservationId: null,
      missingSince: { lt: cutoff },
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
        guestName: external.guestName ?? undefined,
        checkIn: dateOnly(external.checkIn),
        checkOut: dateOnly(external.checkOut),
        source: external.source,
        externalSourceId: external.externalReservationId,
      });
      continue;
    }

    if (external.matchStatus === ExternalReservationMatchStatus.PENDING_MATCH) {
      items.push({ category: "pendingMatches", externalReservationId: external.id, reservationId: external.reservationId ?? undefined, reason: "Candidate match needs owner confirmation.", guestName: external.guestName ?? undefined, checkIn: dateOnly(external.checkIn), checkOut: dateOnly(external.checkOut), source: external.source, externalSourceId: external.externalReservationId });
      continue;
    }

    if (external.matchStatus === ExternalReservationMatchStatus.CONFLICT) {
      items.push({ category: "conflicts", externalReservationId: external.id, reservationId: external.reservationId ?? undefined, reason: "External reservation conflicts with DirectStay availability.", guestName: external.guestName ?? undefined, checkIn: dateOnly(external.checkIn), checkOut: dateOnly(external.checkOut), source: external.source, externalSourceId: external.externalReservationId });
      continue;
    }

    if (external.matchStatus === ExternalReservationMatchStatus.MATCHED && external.reservation && !external.confirmedAt && hasDataMismatch(external, external.reservation)) {
      items.push({ category: "dataMismatches", externalReservationId: external.id, reservationId: external.reservationId ?? undefined, reason: "Matched reservation has date, guest, or email differences until owner confirms the match.", guestName: external.guestName ?? undefined, checkIn: dateOnly(external.checkIn), checkOut: dateOnly(external.checkOut), source: external.source, externalSourceId: external.externalReservationId });
    }
  }

  for (const reservation of directReservations) {
    items.push({ category: "agedUnmatchedDirectStay", reservationId: reservation.id, reason: `DirectStay reservation has not matched an external reservation after ${delayDays} days.`, guestName: reservation.guestName ?? undefined, checkIn: dateOnly(reservation.checkIn), checkOut: dateOnly(reservation.checkOut), source: "DirectStay" });
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
