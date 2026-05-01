import { getPrismaClient } from "@/lib/db";

export async function getAdminDashboardData() {
  const prisma = await getPrismaClient();
  const [ownerCount, propertyCount, livePropertyCount, leadCustomerCount, openInquiryCount, reservationCount, owners, properties] = await Promise.all([
    prisma.owner.count(),
    prisma.property.count(),
    prisma.property.count({ where: { status: "LIVE" } }),
    prisma.customer.count({ where: { status: "LEAD" } }),
    prisma.inquiry.count({ where: { status: { in: ["NEEDS_REPLY", "AWAITING_GUEST"] } } }),
    prisma.reservation.count(),
    prisma.owner.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { properties: { select: { id: true, name: true, slug: true, status: true } }, primaryUser: { select: { email: true, fullName: true } } },
    }),
    prisma.property.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { owner: { select: { id: true, displayName: true } } },
    }),
  ]);

  return { ownerCount, propertyCount, livePropertyCount, leadCustomerCount, openInquiryCount, reservationCount, owners, properties };
}

export async function getAdminOwners() {
  const prisma = await getPrismaClient();
  return prisma.owner.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      primaryUser: { select: { email: true, fullName: true } },
      properties: { select: { id: true, name: true, slug: true, status: true } },
      _count: { select: { customers: true, properties: true } },
    },
  });
}

export async function getAdminOwner(ownerId: string) {
  const prisma = await getPrismaClient();
  return prisma.owner.findUnique({
    where: { id: ownerId },
    include: {
      primaryUser: { select: { email: true, fullName: true } },
      members: { include: { user: { select: { email: true, fullName: true, role: true } } } },
      properties: { orderBy: { createdAt: "desc" }, select: { id: true, name: true, slug: true, status: true, publicDomain: true, inquiryEmail: true } },
      customers: { orderBy: { updatedAt: "desc" }, take: 10, select: { id: true, fullName: true, email: true, status: true, updatedAt: true } },
      _count: { select: { customers: true, properties: true } },
    },
  });
}

export async function getAdminProperties() {
  const prisma = await getPrismaClient();
  return prisma.property.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { id: true, displayName: true, supportEmail: true } },
      _count: { select: { reservations: true, inquiries: true, pricingRules: true } },
    },
  });
}

export async function getAdminProperty(propertyId: string) {
  const prisma = await getPrismaClient();
  return prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      owner: { select: { id: true, displayName: true, supportEmail: true, supportPhone: true } },
      content: true,
      reservations: { orderBy: { checkIn: "desc" }, take: 10, select: { id: true, guestName: true, checkIn: true, checkOut: true, status: true, source: true } },
      inquiries: { orderBy: { createdAt: "desc" }, take: 10, select: { id: true, fullName: true, email: true, status: true, createdAt: true } },
      pricingRules: { orderBy: [{ platform: "asc" }, { startDate: "asc" }], take: 12 },
      _count: { select: { reservations: true, inquiries: true, pricingRules: true } },
    },
  });
}
