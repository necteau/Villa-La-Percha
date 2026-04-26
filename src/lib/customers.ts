import path from "path";
import { CustomerStatus, ReservationStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/db";
import { canUseDatabaseSync, readJsonFallback } from "@/lib/fallbackOrchestrator";
import { getOwnerPortalScope } from "@/lib/ownerPortalScope";
import type { InquiryRecord } from "@/lib/inquiries";

const INQUIRIES_FALLBACK_PATH = path.join(process.cwd(), "src/data/inquiries.json");
const RESERVATIONS_FALLBACK_PATH = path.join(process.cwd(), "src/data/owner-portal-reservations.json");

export interface CustomerLinkedInquiry {
  id: string;
  propertyId: string;
  propertyName: string;
  status: InquiryRecord["status"];
  checkIn?: string;
  checkOut?: string;
  createdAt: string;
}

export interface CustomerLinkedReservation {
  id: string;
  propertyId: string;
  propertyName: string;
  status: string;
  source: string;
  checkIn: string;
  checkOut: string;
  totalAmount?: number;
  currency: string;
  createdAt: string;
}

export interface CustomerRecord {
  id: string;
  ownerId: string;
  primaryPropertyId?: string;
  primaryPropertyName?: string;
  fullName: string;
  email: string;
  phone?: string;
  locationLabel?: string;
  timezone?: string;
  preferredContactMethod?: string;
  status: "lead" | "active" | "booked" | "repeat_guest" | "inactive" | "do_not_contact" | "vip";
  notes?: string;
  preferencesSummary?: string;
  householdSummary?: string;
  specialOccasions?: string;
  conciergeInterests?: string;
  totalInquiries: number;
  totalReservations: number;
  totalCompletedStays: number;
  totalRevenue: number;
  firstInquiryAt?: string;
  lastInquiryAt?: string;
  firstStayAt?: string;
  lastStayAt?: string;
  lastContactAt?: string;
  inquiries: CustomerLinkedInquiry[];
  reservations: CustomerLinkedReservation[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUpdateInput {
  id: string;
  status?: CustomerRecord["status"];
  notes?: string;
  phone?: string;
  locationLabel?: string;
  timezone?: string;
  preferredContactMethod?: string;
  preferencesSummary?: string;
  householdSummary?: string;
  specialOccasions?: string;
  conciergeInterests?: string;
}

interface CustomerLinkInput {
  propertyId: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface FallbackInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
  status?: string;
  createdAt?: string;
}

interface FallbackReservation {
  id: string;
  type: string;
  checkIn: string;
  checkOut: string;
  income: number;
  currency: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

function canUseDatabase(): boolean {
  return canUseDatabaseSync();
}

export function normalizeCustomerEmail(value: string | null | undefined): string {
  return String(value || "").trim().toLowerCase();
}

function fromDbStatus(status: CustomerStatus): CustomerRecord["status"] {
  return status.toLowerCase() as CustomerRecord["status"];
}

function toDbStatus(status: CustomerRecord["status"]): CustomerStatus {
  switch (status) {
    case "active":
      return CustomerStatus.ACTIVE;
    case "booked":
      return CustomerStatus.BOOKED;
    case "repeat_guest":
      return CustomerStatus.REPEAT_GUEST;
    case "inactive":
      return CustomerStatus.INACTIVE;
    case "do_not_contact":
      return CustomerStatus.DO_NOT_CONTACT;
    case "vip":
      return CustomerStatus.VIP;
    case "lead":
    default:
      return CustomerStatus.LEAD;
  }
}

function summarizeLinkedActivity(inquiries: CustomerLinkedInquiry[], reservations: CustomerLinkedReservation[]) {
  const inquiryDates = inquiries.map((item) => item.createdAt).sort();
  const stayDates = reservations.map((item) => item.checkIn).sort();
  const completedStays = reservations.filter((item) => item.status === "COMPLETED" || item.status === "Confirmed" || item.status === "Checked In").length;
  const totalRevenue = reservations.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const lastContactAt = [...inquiryDates, ...reservations.map((item) => item.createdAt)].sort().at(-1);

  return {
    totalInquiries: inquiries.length,
    totalReservations: reservations.length,
    totalCompletedStays: completedStays,
    totalRevenue,
    firstInquiryAt: inquiryDates[0],
    lastInquiryAt: inquiryDates.at(-1),
    firstStayAt: stayDates[0],
    lastStayAt: stayDates.at(-1),
    lastContactAt,
  };
}

function mapDbCustomer(record: {
  id: string;
  ownerId: string;
  primaryPropertyId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  locationLabel: string | null;
  timezone: string | null;
  preferredContactMethod: string | null;
  status: CustomerStatus;
  notes: string | null;
  preferencesSummary: string | null;
  householdSummary: string | null;
  specialOccasions: string | null;
  conciergeInterests: string | null;
  createdAt: Date;
  updatedAt: Date;
  primaryProperty: { id: string; name: string } | null;
  inquiries: Array<{
    id: string;
    propertyId: string;
    status: string;
    checkIn: Date | null;
    checkOut: Date | null;
    createdAt: Date;
    property: { name: string };
  }>;
  reservations: Array<{
    id: string;
    propertyId: string;
    status: ReservationStatus;
    source: string;
    checkIn: Date;
    checkOut: Date;
    totalAmount: { toString(): string } | number | null;
    currency: string;
    createdAt: Date;
    property: { name: string };
  }>;
}): CustomerRecord {
  const inquiries = record.inquiries
    .map((item) => ({
      id: item.id,
      propertyId: item.propertyId,
      propertyName: item.property.name,
      status: item.status.toLowerCase() as InquiryRecord["status"],
      checkIn: item.checkIn?.toISOString().slice(0, 10),
      checkOut: item.checkOut?.toISOString().slice(0, 10),
      createdAt: item.createdAt.toISOString(),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const reservations = record.reservations
    .map((item) => ({
      id: item.id,
      propertyId: item.propertyId,
      propertyName: item.property.name,
      status: item.status,
      source: item.source,
      checkIn: item.checkIn.toISOString().slice(0, 10),
      checkOut: item.checkOut.toISOString().slice(0, 10),
      totalAmount: item.totalAmount ? Number(item.totalAmount) : undefined,
      currency: item.currency,
      createdAt: item.createdAt.toISOString(),
    }))
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  return {
    id: record.id,
    ownerId: record.ownerId,
    primaryPropertyId: record.primaryPropertyId ?? undefined,
    primaryPropertyName: record.primaryProperty?.name,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone ?? undefined,
    locationLabel: record.locationLabel ?? undefined,
    timezone: record.timezone ?? undefined,
    preferredContactMethod: record.preferredContactMethod ?? undefined,
    status: fromDbStatus(record.status),
    notes: record.notes ?? undefined,
    preferencesSummary: record.preferencesSummary ?? undefined,
    householdSummary: record.householdSummary ?? undefined,
    specialOccasions: record.specialOccasions ?? undefined,
    conciergeInterests: record.conciergeInterests ?? undefined,
    ...summarizeLinkedActivity(inquiries, reservations),
    inquiries,
    reservations,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function deriveFallbackCustomers(inquiries: FallbackInquiry[], reservations: FallbackReservation[]): CustomerRecord[] {
  const byEmail = new Map<string, CustomerRecord>();

  for (const inquiry of inquiries) {
    const email = normalizeCustomerEmail(inquiry.email);
    if (!email) continue;
    const existing = byEmail.get(email);
    const linkedInquiry: CustomerLinkedInquiry = {
      id: inquiry.id,
      propertyId: "fallback-villa-la-percha",
      propertyName: "Villa La Percha",
      status: (inquiry.status || "new") as InquiryRecord["status"],
      checkIn: inquiry.checkIn,
      checkOut: inquiry.checkOut,
      createdAt: inquiry.createdAt || new Date().toISOString(),
    };

    if (!existing) {
      byEmail.set(email, {
        id: `fallback-customer-${email}`,
        ownerId: "fallback-owner",
        primaryPropertyId: "fallback-villa-la-percha",
        primaryPropertyName: "Villa La Percha",
        fullName: inquiry.fullName,
        email,
        phone: inquiry.phone,
        status: "lead",
        totalInquiries: 0,
        totalReservations: 0,
        totalCompletedStays: 0,
        totalRevenue: 0,
        inquiries: [linkedInquiry],
        reservations: [],
        createdAt: linkedInquiry.createdAt,
        updatedAt: linkedInquiry.createdAt,
      });
    } else {
      existing.inquiries.push(linkedInquiry);
      if (!existing.phone && inquiry.phone) existing.phone = inquiry.phone;
    }
  }

  for (const reservation of reservations) {
    const email = normalizeCustomerEmail(reservation.guestEmail);
    if (!email) continue;
    const linkedReservation: CustomerLinkedReservation = {
      id: reservation.id,
      propertyId: "fallback-villa-la-percha",
      propertyName: "Villa La Percha",
      status: reservation.type,
      source: reservation.type,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      totalAmount: reservation.income,
      currency: reservation.currency,
      createdAt: reservation.checkIn,
    };
    const existing = byEmail.get(email);
    if (!existing) {
      byEmail.set(email, {
        id: `fallback-customer-${email}`,
        ownerId: "fallback-owner",
        primaryPropertyId: "fallback-villa-la-percha",
        primaryPropertyName: "Villa La Percha",
        fullName: reservation.guestName || email,
        email,
        phone: reservation.guestPhone,
        status: "booked",
        totalInquiries: 0,
        totalReservations: 0,
        totalCompletedStays: 0,
        totalRevenue: 0,
        inquiries: [],
        reservations: [linkedReservation],
        createdAt: reservation.checkIn,
        updatedAt: reservation.checkIn,
      });
    } else {
      existing.reservations.push(linkedReservation);
      if (!existing.phone && reservation.guestPhone) existing.phone = reservation.guestPhone;
    }
  }

  return Array.from(byEmail.values())
    .map((item) => ({
      ...item,
      ...summarizeLinkedActivity(item.inquiries, item.reservations),
      status: (item.reservations.length > 1 ? "repeat_guest" : item.reservations.length === 1 ? "booked" : "lead") as CustomerRecord["status"],
    }))
    .sort((a, b) => (b.lastContactAt || "").localeCompare(a.lastContactAt || ""));
}

export async function listCustomers(): Promise<CustomerRecord[]> {
  if (!canUseDatabase()) {
    const [inquiries, reservations] = await Promise.all([
      readJsonFallback<FallbackInquiry[]>(INQUIRIES_FALLBACK_PATH, []),
      readJsonFallback<FallbackReservation[]>(RESERVATIONS_FALLBACK_PATH, []),
    ]);
    return deriveFallbackCustomers(inquiries, reservations);
  }

  try {
    const prisma = await getPrismaClient();
    await backfillCustomerLinks(prisma);
    const scope = await getOwnerPortalScope();
    const where = scope.isAdmin || !scope.ownerIds ? {} : { ownerId: { in: scope.ownerIds } };

    const customers = await prisma.customer.findMany({
      where,
      include: {
        primaryProperty: { select: { id: true, name: true } },
        inquiries: {
          include: { property: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
        reservations: {
          include: { property: { select: { name: true } } },
          orderBy: { checkIn: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return customers.map(mapDbCustomer);
  } catch {
    const [inquiries, reservations] = await Promise.all([
      readJsonFallback<FallbackInquiry[]>(INQUIRIES_FALLBACK_PATH, []),
      readJsonFallback<FallbackReservation[]>(RESERVATIONS_FALLBACK_PATH, []),
    ]);
    return deriveFallbackCustomers(inquiries, reservations);
  }
}

async function backfillCustomerLinks(prisma: Awaited<ReturnType<typeof getPrismaClient>>) {
  const [orphanInquiries, orphanReservations] = await Promise.all([
    prisma.inquiry.findMany({
      where: { customerId: null },
      select: { id: true, propertyId: true, fullName: true, email: true, phone: true },
      take: 200,
    }),
    prisma.reservation.findMany({
      where: { customerId: null, guestEmail: { not: null } },
      select: { id: true, propertyId: true, guestName: true, guestEmail: true, guestPhone: true },
      take: 200,
    }),
  ]);

  for (const inquiry of orphanInquiries) {
    const link = await findOrCreateCustomerLink({
      propertyId: inquiry.propertyId,
      fullName: inquiry.fullName,
      email: inquiry.email,
      phone: inquiry.phone,
    });
    if (link.customerId) {
      await prisma.inquiry.update({ where: { id: inquiry.id }, data: { customerId: link.customerId } });
    }
  }

  for (const reservation of orphanReservations) {
    const link = await findOrCreateCustomerLink({
      propertyId: reservation.propertyId,
      fullName: reservation.guestName,
      email: reservation.guestEmail,
      phone: reservation.guestPhone,
    });
    if (link.customerId) {
      await prisma.reservation.update({ where: { id: reservation.id }, data: { customerId: link.customerId } });
    }
  }
}

export async function getCustomerById(id: string): Promise<CustomerRecord | null> {
  if (!canUseDatabase()) {
    const customers = await listCustomers();
    return customers.find((customer) => customer.id === id) || null;
  }

  const prisma = await getPrismaClient();
  const scope = await getOwnerPortalScope();
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      ...(scope.isAdmin || !scope.ownerIds ? {} : { ownerId: { in: scope.ownerIds } }),
    },
    include: {
      primaryProperty: { select: { id: true, name: true } },
      inquiries: {
        include: { property: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      reservations: {
        include: { property: { select: { name: true } } },
        orderBy: { checkIn: "desc" },
      },
    },
  });

  return customer ? mapDbCustomer(customer) : null;
}

export async function updateCustomer(input: CustomerUpdateInput): Promise<CustomerRecord | null> {
  if (!canUseDatabase()) return null;

  const prisma = await getPrismaClient();
  const scope = await getOwnerPortalScope();
  const existing = await prisma.customer.findFirst({
    where: {
      id: input.id,
      ...(scope.isAdmin || !scope.ownerIds ? {} : { ownerId: { in: scope.ownerIds } }),
    },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  await prisma.customer.update({
    where: { id: input.id },
    data: {
      status: input.status ? toDbStatus(input.status) : undefined,
      notes: input.notes,
      phone: input.phone,
      locationLabel: input.locationLabel,
      timezone: input.timezone,
      preferredContactMethod: input.preferredContactMethod,
      preferencesSummary: input.preferencesSummary,
      householdSummary: input.householdSummary,
      specialOccasions: input.specialOccasions,
      conciergeInterests: input.conciergeInterests,
    },
  });

  return getCustomerById(input.id);
}

export async function findOrCreateCustomerLink(input: CustomerLinkInput): Promise<{ customerId: string | null; ownerId: string | null }> {
  const email = normalizeCustomerEmail(input.email);
  if (!email || !canUseDatabase()) return { customerId: null, ownerId: null };

  const prisma = await getPrismaClient();
  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { id: true, ownerId: true },
  });
  if (!property) return { customerId: null, ownerId: null };

  const customer = await prisma.customer.upsert({
    where: {
      ownerId_email: {
        ownerId: property.ownerId,
        email,
      },
    },
    update: {
      fullName: input.fullName?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      primaryPropertyId: property.id,
      status: undefined,
    },
    create: {
      ownerId: property.ownerId,
      primaryPropertyId: property.id,
      fullName: input.fullName?.trim() || email,
      email,
      phone: input.phone?.trim() || null,
    },
    select: { id: true, ownerId: true },
  });

  return { customerId: customer.id, ownerId: customer.ownerId };
}
