import path from "path";
import { BookingPaymentStatus, ExternalReservationSourceStatus, ReservationSource, ReservationStatus } from "@prisma/client";
import { findOrCreateCustomerLink } from "@/lib/customers";
import { summarizeContractExecution, type ContractSummary } from "@/lib/contracts";
import { getPrismaClient } from "@/lib/db";
import { canUseDatabaseSync, readJsonFallback, writeJsonFallback } from "@/lib/fallbackOrchestrator";

export interface ReservationRecord {
  id: string;
  customerId?: string;
  sourceInquiryId?: string;
  status: "Confirmed" | "Checked In" | "Cancelled" | "Tentative";
  type: string;
  unit: string;
  bookedDate?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  income: number;
  currency: string;
  paymentStatus: "unpaid" | "deposit_requested" | "deposit_received" | "paid_in_full" | "partially_refunded" | "refunded";
  depositAmount?: number;
  amountReceived?: number;
  paymentMethod?: string;
  paymentConfirmedAt?: string;
  paymentNote?: string;
  contracts?: ContractSummary[];
  isOwnerWeek: boolean;
  isTest?: boolean;
}

export interface ReservationInput {
  status: ReservationRecord["status"];
  type: string;
  unit?: string;
  bookedDate?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  income: number;
  currency: string;
  paymentStatus?: ReservationRecord["paymentStatus"];
  depositAmount?: number;
  amountReceived?: number;
  paymentMethod?: string;
  paymentConfirmedAt?: string;
  paymentNote?: string;
  sourceInquiryId?: string;
  isOwnerWeek: boolean;
  isTest?: boolean;
}

const FALLBACK_PATH = path.join(process.cwd(), "src/data/owner-portal-reservations.json");
const DEFAULT_PROPERTY = {
  id: "fallback-villa-la-percha",
  name: "Villa La Percha",
  slug: "villa-la-percha",
};

export interface ReservationListOptions { propertyId?: string }
export interface ReservationWriteOptions { propertyId?: string }

function canUseDatabase(): boolean {
  return canUseDatabaseSync();
}

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
}

function parseDateOnly(value: string, label: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${label} must be a YYYY-MM-DD date.`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error(`${label} is not a valid calendar date.`);
  return date;
}

function validateReservationDates(checkIn: string, checkOut: string) {
  const start = parseDateOnly(checkIn, "Check-in");
  const end = parseDateOnly(checkOut, "Check-out");
  if (end <= start) throw new Error("Check-out must be after check-in.");
  return { start, end };
}

function normalizeStatus(value: string): ReservationRecord["status"] {
  if (value === "Checked In") return "Checked In";
  if (value === "Cancelled") return "Cancelled";
  if (value === "Tentative") return "Tentative";
  return "Confirmed";
}

function toDbStatus(value: ReservationRecord["status"]): ReservationStatus {
  switch (value) {
    case "Checked In":
      return ReservationStatus.CHECKED_IN;
    case "Cancelled":
      return ReservationStatus.CANCELLED;
    case "Tentative":
      return ReservationStatus.TENTATIVE;
    case "Confirmed":
    default:
      return ReservationStatus.CONFIRMED;
  }
}

function fromDbStatus(value: ReservationStatus): ReservationRecord["status"] {
  switch (value) {
    case ReservationStatus.CHECKED_IN:
      return "Checked In";
    case ReservationStatus.CANCELLED:
      return "Cancelled";
    case ReservationStatus.TENTATIVE:
      return "Tentative";
    case ReservationStatus.CONFIRMED:
    case ReservationStatus.COMPLETED:
    case ReservationStatus.OWNER_HOLD:
    default:
      return "Confirmed";
  }
}

function toDbPaymentStatus(value?: ReservationRecord["paymentStatus"]): BookingPaymentStatus {
  switch (value) {
    case "deposit_requested": return BookingPaymentStatus.DEPOSIT_REQUESTED;
    case "deposit_received": return BookingPaymentStatus.DEPOSIT_RECEIVED;
    case "paid_in_full": return BookingPaymentStatus.PAID_IN_FULL;
    case "partially_refunded": return BookingPaymentStatus.PARTIALLY_REFUNDED;
    case "refunded": return BookingPaymentStatus.REFUNDED;
    case "unpaid":
    default: return BookingPaymentStatus.UNPAID;
  }
}

function fromDbPaymentStatus(value?: BookingPaymentStatus | null): ReservationRecord["paymentStatus"] {
  switch (value) {
    case BookingPaymentStatus.DEPOSIT_REQUESTED: return "deposit_requested";
    case BookingPaymentStatus.DEPOSIT_RECEIVED: return "deposit_received";
    case BookingPaymentStatus.PAID_IN_FULL: return "paid_in_full";
    case BookingPaymentStatus.PARTIALLY_REFUNDED: return "partially_refunded";
    case BookingPaymentStatus.REFUNDED: return "refunded";
    case BookingPaymentStatus.UNPAID:
    default: return "unpaid";
  }
}

function toDbSource(type: string, isOwnerWeek: boolean): ReservationSource {
  if (isOwnerWeek || type.toLowerCase() === "owner") return ReservationSource.OWNER;
  if (type.toLowerCase().includes("airbnb")) return ReservationSource.AIRBNB;
  if (type.toLowerCase().includes("vrbo")) return ReservationSource.VRBO;
  if (type.toLowerCase().includes("direct")) return ReservationSource.DIRECT;
  return ReservationSource.MANUAL;
}

function mapDbReservation(record: {
  id: string;
  customerId: string | null;
  status: ReservationStatus;
  bookingType: string | null;
  bookedDate: Date | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  totalAmount: { toString(): string } | number | null;
  currency: string;
  paymentStatus?: BookingPaymentStatus | null;
  depositAmount?: { toString(): string } | number | null;
  amountReceived?: { toString(): string } | number | null;
  paymentMethod?: string | null;
  paymentConfirmedAt?: Date | null;
  paymentNote?: string | null;
  sourceInquiryId?: string | null;
  contractExecutions?: Parameters<typeof summarizeContractExecution>[0][];
  isOwnerWeek: boolean;
  isTest?: boolean;
}, unit = DEFAULT_PROPERTY.name): ReservationRecord {
  return {
    id: record.id,
    customerId: record.customerId ?? undefined,
    sourceInquiryId: record.sourceInquiryId ?? undefined,
    status: fromDbStatus(record.status),
    type: record.bookingType || (record.isOwnerWeek ? "Owner" : "Manual"),
    unit,
    bookedDate: record.bookedDate ? record.bookedDate.toISOString().slice(0, 10) : undefined,
    guestName: record.guestName ?? undefined,
    guestEmail: record.guestEmail ?? undefined,
    guestPhone: record.guestPhone ?? undefined,
    checkIn: record.checkIn.toISOString().slice(0, 10),
    checkOut: record.checkOut.toISOString().slice(0, 10),
    nights: record.nights,
    income: record.totalAmount ? Number(record.totalAmount) : 0,
    currency: record.currency,
    paymentStatus: fromDbPaymentStatus(record.paymentStatus),
    depositAmount: record.depositAmount ? Number(record.depositAmount) : undefined,
    amountReceived: record.amountReceived ? Number(record.amountReceived) : undefined,
    paymentMethod: record.paymentMethod ?? undefined,
    paymentConfirmedAt: record.paymentConfirmedAt?.toISOString(),
    paymentNote: record.paymentNote ?? undefined,
    contracts: record.contractExecutions?.map(summarizeContractExecution),
    isOwnerWeek: record.isOwnerWeek,
    isTest: record.isTest || undefined,
  };
}

const DEFAULT_RESERVATIONS: ReservationRecord[] = [];

async function readFallbackReservations(): Promise<ReservationRecord[]> {
  return readJsonFallback(FALLBACK_PATH, DEFAULT_RESERVATIONS);
}

async function writeFallbackReservations(records: ReservationRecord[]) {
  await writeJsonFallback(FALLBACK_PATH, records);
}

async function ensureDefaultProperty(propertyId?: string) {
  const prisma = await getPrismaClient();
  if (propertyId) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new Error("Property is not configured.");
    return property;
  }
  const existing = await prisma.property.findUnique({ where: { slug: DEFAULT_PROPERTY.slug } });
  if (existing) return existing;

  const owner = await prisma.owner.create({
    data: {
      displayName: "DirectStay Demo Owner",
      properties: {
        create: {
          slug: DEFAULT_PROPERTY.slug,
          name: DEFAULT_PROPERTY.name,
          status: "LIVE",
          currency: "USD",
          timezone: "America/New_York",
          inquiryEnabled: true,
        },
      },
    },
    include: { properties: true },
  });

  return owner.properties[0];
}

async function assertNoAvailabilityConflict(input: { propertyId: string; checkIn: string; checkOut: string; reservationId?: string }) {
  const prisma = await getPrismaClient();
  const { start, end } = validateReservationDates(input.checkIn, input.checkOut);
  const [internalConflict, externalConflict] = await Promise.all([
    prisma.reservation.findFirst({
      where: {
        propertyId: input.propertyId,
        id: input.reservationId ? { not: input.reservationId } : undefined,
        status: { not: ReservationStatus.CANCELLED },
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
      select: { id: true, checkIn: true, checkOut: true, guestName: true, bookingType: true },
    }),
    prisma.externalReservation.findFirst({
      where: {
        propertyId: input.propertyId,
        sourceStatus: ExternalReservationSourceStatus.ACTIVE,
        reservationId: input.reservationId ? { not: input.reservationId } : undefined,
        checkIn: { lt: end },
        checkOut: { gt: start },
      },
      select: { id: true, source: true, externalReservationId: true, checkIn: true, checkOut: true },
    }),
  ]);

  if (internalConflict) {
    throw new Error(`Dates overlap an existing DirectStay reservation (${internalConflict.bookingType || internalConflict.guestName || internalConflict.id}, ${internalConflict.checkIn.toISOString().slice(0, 10)} → ${internalConflict.checkOut.toISOString().slice(0, 10)}).`);
  }
  if (externalConflict) {
    throw new Error(`Dates overlap an active external block (${externalConflict.source} #${externalConflict.externalReservationId}, ${externalConflict.checkIn.toISOString().slice(0, 10)} → ${externalConflict.checkOut.toISOString().slice(0, 10)}).`);
  }
}

export async function listReservations(options: ReservationListOptions = {}): Promise<ReservationRecord[]> {
  if (!canUseDatabase()) {
    return readFallbackReservations();
  }

  const prisma = await getPrismaClient();
  const property = await ensureDefaultProperty(options.propertyId);
  const records = await prisma.reservation.findMany({
    where: { propertyId: property.id },
    include: { contractExecutions: { include: { template: true }, orderBy: { updatedAt: "desc" } } },
    orderBy: { checkIn: "asc" },
  });

  return records.map((record) => mapDbReservation(record, property.name));
}

export async function createReservation(input: ReservationInput, options: ReservationWriteOptions = {}): Promise<ReservationRecord> {
  const record: ReservationRecord = {
    id: String(Date.now()),
    customerId: undefined,
    status: normalizeStatus(input.status),
    type: input.type,
    unit: input.unit || DEFAULT_PROPERTY.name,
    bookedDate: input.bookedDate,
    guestName: input.guestName,
    guestEmail: input.guestEmail,
    guestPhone: input.guestPhone,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights: nightsBetween(input.checkIn, input.checkOut),
    income: input.isOwnerWeek ? 0 : input.income,
    currency: input.currency,
    paymentStatus: input.paymentStatus || "unpaid",
    depositAmount: input.depositAmount,
    amountReceived: input.amountReceived,
    paymentMethod: input.paymentMethod,
    paymentConfirmedAt: input.paymentConfirmedAt,
    paymentNote: input.paymentNote,
    sourceInquiryId: input.sourceInquiryId,
    contracts: undefined,
    isOwnerWeek: input.isOwnerWeek,
    isTest: input.isTest,
  };

  if (!canUseDatabase()) {
    const current = await readFallbackReservations();
    const next = [record, ...current];
    await writeFallbackReservations(next);
    return record;
  }

  const prisma = await getPrismaClient();
  const property = await ensureDefaultProperty(options.propertyId);
  await assertNoAvailabilityConflict({ propertyId: property.id, checkIn: record.checkIn, checkOut: record.checkOut });
  const customerLink = await findOrCreateCustomerLink({
      propertyId: property.id,
      fullName: record.guestName,
      email: record.guestEmail,
      phone: record.guestPhone,
    });

    const created = await prisma.reservation.create({
      data: {
        propertyId: property.id,
        customerId: customerLink.customerId,
        status: toDbStatus(record.status),
        source: toDbSource(record.type, record.isOwnerWeek),
        bookingType: record.type,
        bookedDate: record.bookedDate ? new Date(record.bookedDate) : null,
        guestName: record.guestName ?? null,
        guestEmail: record.guestEmail ?? null,
        guestPhone: record.guestPhone ?? null,
        checkIn: new Date(record.checkIn),
        checkOut: new Date(record.checkOut),
        nights: record.nights,
        totalAmount: record.income,
        currency: record.currency,
        paymentStatus: toDbPaymentStatus(record.paymentStatus),
        depositAmount: record.depositAmount ?? null,
        amountReceived: record.amountReceived ?? null,
        paymentMethod: record.paymentMethod ?? null,
        paymentConfirmedAt: record.paymentConfirmedAt ? new Date(record.paymentConfirmedAt) : null,
        paymentNote: record.paymentNote ?? null,
        sourceInquiryId: record.sourceInquiryId ?? null,
        isOwnerWeek: record.isOwnerWeek,
        isTest: record.isTest ?? false,
      },
      include: { contractExecutions: { include: { template: true }, orderBy: { updatedAt: "desc" } } },
    });

    if (record.sourceInquiryId) {
      await prisma.contractExecution.updateMany({
        where: { inquiryId: record.sourceInquiryId, reservationId: null },
        data: { reservationId: created.id, customerId: customerLink.customerId },
      });
      const linked = await prisma.reservation.findUnique({
        where: { id: created.id },
        include: { contractExecutions: { include: { template: true }, orderBy: { updatedAt: "desc" } } },
      });
      if (linked) return mapDbReservation(linked, property.name);
    }
  return mapDbReservation(created, property.name);
}

export async function updateReservation(id: string, input: Partial<ReservationInput>, options: ReservationWriteOptions = {}): Promise<ReservationRecord | null> {
  const applyPatch = (existing: ReservationRecord): ReservationRecord => {
    const nextCheckIn = input.checkIn ?? existing.checkIn;
    const nextCheckOut = input.checkOut ?? existing.checkOut;
    const nextIsOwnerWeek = input.isOwnerWeek ?? existing.isOwnerWeek;

    return {
      ...existing,
      ...input,
      status: normalizeStatus((input.status as string) || existing.status),
      checkIn: nextCheckIn,
      checkOut: nextCheckOut,
      isOwnerWeek: nextIsOwnerWeek,
      isTest: input.isTest ?? existing.isTest,
      income: nextIsOwnerWeek ? 0 : (input.income ?? existing.income),
      paymentStatus: input.paymentStatus ?? existing.paymentStatus ?? "unpaid",
      depositAmount: input.depositAmount ?? existing.depositAmount,
      amountReceived: input.amountReceived ?? existing.amountReceived,
      paymentMethod: input.paymentMethod ?? existing.paymentMethod,
      paymentConfirmedAt: input.paymentConfirmedAt ?? existing.paymentConfirmedAt,
      paymentNote: input.paymentNote ?? existing.paymentNote,
      nights: nightsBetween(nextCheckIn, nextCheckOut),
    } as ReservationRecord;
  };

  if (!canUseDatabase()) {
    const current = await readFallbackReservations();
    const existing = current.find((item) => item.id === id);
    if (!existing) return null;
    const updated = applyPatch(existing);
    await writeFallbackReservations(current.map((item) => (item.id === id ? updated : item)));
    return updated;
  }

  const prisma = await getPrismaClient();
  const property = await ensureDefaultProperty(options.propertyId);
  const existing = await prisma.reservation.findFirst({ where: { id, propertyId: property.id } });
  if (!existing) return null;

  const patched = applyPatch(mapDbReservation(existing, property.name));
  await assertNoAvailabilityConflict({ propertyId: property.id, reservationId: id, checkIn: patched.checkIn, checkOut: patched.checkOut });
  const customerLink = await findOrCreateCustomerLink({
      propertyId: property.id,
      fullName: patched.guestName,
      email: patched.guestEmail,
      phone: patched.guestPhone,
    });

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        customerId: customerLink.customerId,
        status: toDbStatus(patched.status),
        source: toDbSource(patched.type, patched.isOwnerWeek),
        bookingType: patched.type,
        bookedDate: patched.bookedDate ? new Date(patched.bookedDate) : null,
        guestName: patched.guestName ?? null,
        guestEmail: patched.guestEmail ?? null,
        guestPhone: patched.guestPhone ?? null,
        checkIn: new Date(patched.checkIn),
        checkOut: new Date(patched.checkOut),
        nights: patched.nights,
        totalAmount: patched.income,
        currency: patched.currency,
        paymentStatus: toDbPaymentStatus(patched.paymentStatus),
        depositAmount: patched.depositAmount ?? null,
        amountReceived: patched.amountReceived ?? null,
        paymentMethod: patched.paymentMethod ?? null,
        paymentConfirmedAt: patched.paymentConfirmedAt ? new Date(patched.paymentConfirmedAt) : null,
        paymentNote: patched.paymentNote ?? null,
        sourceInquiryId: patched.sourceInquiryId ?? null,
        isOwnerWeek: patched.isOwnerWeek,
        isTest: patched.isTest ?? false,
      },
      include: { contractExecutions: { include: { template: true }, orderBy: { updatedAt: "desc" } } },
    });
  return mapDbReservation(updated, property.name);
}

export async function deleteReservation(id: string, options: ReservationWriteOptions = {}): Promise<boolean> {
  if (!canUseDatabase()) {
    const current = await readFallbackReservations();
    const next = current.filter((item) => item.id !== id);
    if (next.length === current.length) return false;
    await writeFallbackReservations(next);
    return true;
  }

  const prisma = await getPrismaClient();
  const property = await ensureDefaultProperty(options.propertyId);
  try {
    const result = await prisma.reservation.deleteMany({ where: { id, propertyId: property.id } });
    if (result.count === 0) return false;
    return true;
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2025") return false;
    throw error;
  }
}
