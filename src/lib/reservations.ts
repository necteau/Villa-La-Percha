import { promises as fs } from "fs";
import path from "path";
import { ReservationSource, ReservationStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/db";

export interface ReservationRecord {
  id: string;
  status: "Confirmed" | "Checked In" | "Cancelled" | "Tentative";
  type: string;
  unit: string;
  bookedDate?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  income: number;
  currency: string;
  isOwnerWeek: boolean;
}

export interface ReservationInput {
  status: ReservationRecord["status"];
  type: string;
  unit?: string;
  bookedDate?: string;
  checkIn: string;
  checkOut: string;
  income: number;
  currency: string;
  isOwnerWeek: boolean;
}

const FALLBACK_PATH = path.join(process.cwd(), "src/data/owner-portal-reservations.json");
const DEFAULT_PROPERTY = {
  id: "fallback-villa-la-percha",
  name: "Villa La Percha",
  slug: "villa-la-percha",
};

function canUseDatabase(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && !url.includes("USER:PASSWORD@HOST");
}

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
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

function toDbSource(type: string, isOwnerWeek: boolean): ReservationSource {
  if (isOwnerWeek || type.toLowerCase() === "owner") return ReservationSource.OWNER;
  if (type.toLowerCase().includes("airbnb")) return ReservationSource.AIRBNB;
  if (type.toLowerCase().includes("vrbo")) return ReservationSource.VRBO;
  if (type.toLowerCase().includes("direct")) return ReservationSource.DIRECT;
  return ReservationSource.MANUAL;
}

function mapDbReservation(record: {
  id: string;
  status: ReservationStatus;
  bookingType: string | null;
  bookedDate: Date | null;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  totalAmount: { toString(): string } | number | null;
  currency: string;
  isOwnerWeek: boolean;
}, unit = DEFAULT_PROPERTY.name): ReservationRecord {
  return {
    id: record.id,
    status: fromDbStatus(record.status),
    type: record.bookingType || (record.isOwnerWeek ? "Owner" : "Manual"),
    unit,
    bookedDate: record.bookedDate ? record.bookedDate.toISOString().slice(0, 10) : undefined,
    checkIn: record.checkIn.toISOString().slice(0, 10),
    checkOut: record.checkOut.toISOString().slice(0, 10),
    nights: record.nights,
    income: record.totalAmount ? Number(record.totalAmount) : 0,
    currency: record.currency,
    isOwnerWeek: record.isOwnerWeek,
  };
}

async function readFallbackReservations(): Promise<ReservationRecord[]> {
  const raw = await fs.readFile(FALLBACK_PATH, "utf8");
  const parsed = JSON.parse(raw) as ReservationRecord[];
  return parsed.map((item) => ({ ...item, status: normalizeStatus(item.status), nights: nightsBetween(item.checkIn, item.checkOut) }));
}

async function writeFallbackReservations(records: ReservationRecord[]) {
  await fs.writeFile(FALLBACK_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

async function ensureDefaultProperty() {
  const prisma = await getPrismaClient();
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

export async function listReservations(): Promise<ReservationRecord[]> {
  if (!canUseDatabase()) {
    return readFallbackReservations();
  }

  try {
    const prisma = await getPrismaClient();
    const property = await ensureDefaultProperty();
    const records = await prisma.reservation.findMany({
      where: { propertyId: property.id },
      orderBy: { checkIn: "asc" },
    });

    if (records.length === 0) {
      const fallback = await readFallbackReservations();
      await prisma.reservation.createMany({
        data: fallback.map((item) => ({
          id: item.id,
          propertyId: property.id,
          status: toDbStatus(item.status),
          source: toDbSource(item.type, item.isOwnerWeek),
          bookingType: item.type,
          bookedDate: item.bookedDate ? new Date(item.bookedDate) : null,
          checkIn: new Date(item.checkIn),
          checkOut: new Date(item.checkOut),
          nights: nightsBetween(item.checkIn, item.checkOut),
          totalAmount: item.income,
          currency: item.currency,
          isOwnerWeek: item.isOwnerWeek,
        })),
        skipDuplicates: true,
      });

      const seeded = await prisma.reservation.findMany({ where: { propertyId: property.id }, orderBy: { checkIn: "asc" } });
      return seeded.map((record) => mapDbReservation(record, property.name));
    }

    return records.map((record) => mapDbReservation(record, property.name));
  } catch {
    return readFallbackReservations();
  }
}

export async function createReservation(input: ReservationInput): Promise<ReservationRecord> {
  const record: ReservationRecord = {
    id: String(Date.now()),
    status: normalizeStatus(input.status),
    type: input.type,
    unit: input.unit || DEFAULT_PROPERTY.name,
    bookedDate: input.bookedDate,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights: nightsBetween(input.checkIn, input.checkOut),
    income: input.isOwnerWeek ? 0 : input.income,
    currency: input.currency,
    isOwnerWeek: input.isOwnerWeek,
  };

  if (!canUseDatabase()) {
    const current = await readFallbackReservations();
    const next = [record, ...current];
    await writeFallbackReservations(next);
    return record;
  }

  try {
    const prisma = await getPrismaClient();
    const property = await ensureDefaultProperty();
    const created = await prisma.reservation.create({
      data: {
        propertyId: property.id,
        status: toDbStatus(record.status),
        source: toDbSource(record.type, record.isOwnerWeek),
        bookingType: record.type,
        bookedDate: record.bookedDate ? new Date(record.bookedDate) : null,
        checkIn: new Date(record.checkIn),
        checkOut: new Date(record.checkOut),
        nights: record.nights,
        totalAmount: record.income,
        currency: record.currency,
        isOwnerWeek: record.isOwnerWeek,
      },
    });
    return mapDbReservation(created, property.name);
  } catch {
    const current = await readFallbackReservations();
    const next = [record, ...current];
    await writeFallbackReservations(next);
    return record;
  }
}

export async function updateReservation(id: string, input: Partial<ReservationInput>): Promise<ReservationRecord | null> {
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
      income: nextIsOwnerWeek ? 0 : (input.income ?? existing.income),
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

  try {
    const prisma = await getPrismaClient();
    const property = await ensureDefaultProperty();
    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) return null;

    const patched = applyPatch(mapDbReservation(existing, property.name));

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status: toDbStatus(patched.status),
        source: toDbSource(patched.type, patched.isOwnerWeek),
        bookingType: patched.type,
        bookedDate: patched.bookedDate ? new Date(patched.bookedDate) : null,
        checkIn: new Date(patched.checkIn),
        checkOut: new Date(patched.checkOut),
        nights: patched.nights,
        totalAmount: patched.income,
        currency: patched.currency,
        isOwnerWeek: patched.isOwnerWeek,
      },
    });
    return mapDbReservation(updated, property.name);
  } catch {
    const current = await readFallbackReservations();
    const existing = current.find((item) => item.id === id);
    if (!existing) return null;
    const updated = applyPatch(existing);
    await writeFallbackReservations(current.map((item) => (item.id === id ? updated : item)));
    return updated;
  }
}

export async function deleteReservation(id: string): Promise<boolean> {
  if (!canUseDatabase()) {
    const current = await readFallbackReservations();
    const next = current.filter((item) => item.id !== id);
    if (next.length === current.length) return false;
    await writeFallbackReservations(next);
    return true;
  }

  try {
    const prisma = await getPrismaClient();
    await prisma.reservation.delete({ where: { id } });
    return true;
  } catch {
    const current = await readFallbackReservations();
    const next = current.filter((item) => item.id !== id);
    if (next.length === current.length) return false;
    await writeFallbackReservations(next);
    return true;
  }
}
