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

export interface ExternalReservationInput {
  source: string;
  externalReservationId?: string;
  sourceStatus?: "ACTIVE" | "CANCELLED" | "MISSING";
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  totalAmount?: number;
  currency?: string;
  notes?: string;
}

const DEFAULT_PROPERTY_SLUG = "villa-la-percha";

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function parseDate(value: string, field: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!value || Number.isNaN(date.getTime())) throw new Error(`${field} is required.`);
  return date;
}

function normalizeSource(value: string): string {
  const source = value.trim();
  if (!source) throw new Error("Source is required.");
  return source.length > 40 ? source.slice(0, 40) : source;
}

function toSourceStatus(value?: ExternalReservationInput["sourceStatus"]): ExternalReservationSourceStatus {
  if (value === "CANCELLED") return ExternalReservationSourceStatus.CANCELLED;
  if (value === "MISSING") return ExternalReservationSourceStatus.MISSING;
  return ExternalReservationSourceStatus.ACTIVE;
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

async function getDefaultProperty() {
  const prisma = await getPrismaClient();
  const property = await prisma.property.findUnique({ where: { slug: DEFAULT_PROPERTY_SLUG }, include: { owner: true } });
  if (!property) throw new Error("Villa La Percha property is not configured.");
  return property;
}

export async function listExternalReservations(): Promise<ExternalReservationRecord[]> {
  if (!canUseDatabaseSync()) return [];
  const prisma = await getPrismaClient();
  const property = await getDefaultProperty();
  const records = await prisma.externalReservation.findMany({
    where: { propertyId: property.id },
    orderBy: [{ checkIn: "asc" }, { source: "asc" }],
  });
  return records.map(mapRecord);
}

export async function createExternalReservation(input: ExternalReservationInput): Promise<ExternalReservationRecord> {
  if (!canUseDatabaseSync()) throw new Error("External reservations require the database connection.");
  const prisma = await getPrismaClient();
  const property = await getDefaultProperty();
  const checkIn = parseDate(input.checkIn, "Check-in date");
  const checkOut = parseDate(input.checkOut, "Check-out date");
  if (checkOut <= checkIn) throw new Error("Check-out must be after check-in.");
  const source = normalizeSource(input.source);
  const now = new Date();
  const created = await prisma.externalReservation.create({
    data: {
      ownerId: property.ownerId,
      propertyId: property.id,
      source,
      externalReservationId: input.externalReservationId?.trim() || `manual-${source.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      sourceStatus: toSourceStatus(input.sourceStatus),
      guestName: input.guestName?.trim() || null,
      guestEmail: input.guestEmail?.trim() || null,
      guestPhone: input.guestPhone?.trim() || null,
      checkIn,
      checkOut,
      totalAmount: input.totalAmount ?? null,
      currency: input.currency || property.currency || "USD",
      rawPayload: input.notes ? { manualEntry: true, notes: input.notes } : { manualEntry: true },
      lastSeenAt: now,
      lastSyncedAt: now,
    },
  });
  return mapRecord(created);
}

export async function updateExternalReservation(id: string, input: Partial<ExternalReservationInput>): Promise<ExternalReservationRecord | null> {
  if (!canUseDatabaseSync()) throw new Error("External reservations require the database connection.");
  const prisma = await getPrismaClient();
  const existing = await prisma.externalReservation.findUnique({ where: { id } });
  if (!existing) return null;
  const checkIn = input.checkIn ? parseDate(input.checkIn, "Check-in date") : existing.checkIn;
  const checkOut = input.checkOut ? parseDate(input.checkOut, "Check-out date") : existing.checkOut;
  if (checkOut <= checkIn) throw new Error("Check-out must be after check-in.");
  const raw = existing.rawPayload && typeof existing.rawPayload === "object" && !Array.isArray(existing.rawPayload) ? existing.rawPayload as Record<string, unknown> : {};
  const updated = await prisma.externalReservation.update({
    where: { id },
    data: {
      source: input.source ? normalizeSource(input.source) : undefined,
      externalReservationId: input.externalReservationId?.trim() || undefined,
      sourceStatus: input.sourceStatus ? toSourceStatus(input.sourceStatus) : undefined,
      guestName: input.guestName !== undefined ? input.guestName.trim() || null : undefined,
      guestEmail: input.guestEmail !== undefined ? input.guestEmail.trim() || null : undefined,
      guestPhone: input.guestPhone !== undefined ? input.guestPhone.trim() || null : undefined,
      checkIn,
      checkOut,
      totalAmount: input.totalAmount !== undefined ? input.totalAmount : undefined,
      currency: input.currency || undefined,
      rawPayload: input.notes !== undefined ? { ...raw, manualEntry: true, notes: input.notes } : undefined,
      lastSeenAt: input.sourceStatus === "ACTIVE" ? new Date() : undefined,
      missingSince: input.sourceStatus === "MISSING" ? new Date() : input.sourceStatus === "ACTIVE" ? null : undefined,
    },
  });
  return mapRecord(updated);
}

export async function deleteExternalReservation(id: string): Promise<boolean> {
  if (!canUseDatabaseSync()) throw new Error("External reservations require the database connection.");
  const prisma = await getPrismaClient();
  try {
    await prisma.externalReservation.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
