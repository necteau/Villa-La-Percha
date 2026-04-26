import { PrismaClient, InquiryStatus, PricingPlatform, ChargeCategory, ChargeType, ChargeBasis, ReservationStatus, ReservationSource, PropertyStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database");
}
const pool = new pg.Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const ownerName = "DirectStay Demo Owner";
const propertySlug = "villa-la-percha";

function toReservationStatus(value) {
  switch (value) {
    case "Checked In":
      return ReservationStatus.CHECKED_IN;
    case "Cancelled":
      return ReservationStatus.CANCELLED;
    case "Tentative":
      return ReservationStatus.TENTATIVE;
    default:
      return ReservationStatus.CONFIRMED;
  }
}

function toReservationSource(type, isOwnerWeek) {
  const normalized = String(type || "").toLowerCase();
  if (isOwnerWeek || normalized === "owner") return ReservationSource.OWNER;
  if (normalized.includes("airbnb")) return ReservationSource.AIRBNB;
  if (normalized.includes("vrbo")) return ReservationSource.VRBO;
  if (normalized.includes("direct")) return ReservationSource.DIRECT;
  return ReservationSource.MANUAL;
}

function toInquiryStatus(value) {
  switch (String(value || "new").toLowerCase()) {
    case "replied":
      return InquiryStatus.REPLIED;
    case "approved":
      return InquiryStatus.APPROVED;
    case "declined":
      return InquiryStatus.DECLINED;
    case "converted":
      return InquiryStatus.CONVERTED;
    default:
      return InquiryStatus.NEW;
  }
}

function toChargeCategory(value) {
  return String(value).toLowerCase() === "tax" ? ChargeCategory.TAX : ChargeCategory.FEE;
}

function toChargeType(value) {
  return String(value).toLowerCase() === "percent" ? ChargeType.PERCENT : ChargeType.FIXED;
}

function toChargeBasis(value) {
  switch (String(value || "base").toLowerCase()) {
    case "base_plus_fees":
      return ChargeBasis.BASE_PLUS_FEES;
    case "subtotal_before_tax":
      return ChargeBasis.SUBTOTAL_BEFORE_TAX;
    default:
      return ChargeBasis.BASE;
  }
}

async function loadJson(relativePath) {
  const raw = await readFile(path.join(root, relativePath), "utf8");
  return JSON.parse(raw);
}

async function main() {
  const reservations = await loadJson("src/data/owner-portal-reservations.json");
  const pricing = await loadJson("src/data/pricing-table.json");
  const inquiries = await loadJson("src/data/inquiries.json");

  const owner = await prisma.owner.upsert({
    where: { id: "directstay-demo-owner" },
    update: { displayName: ownerName },
    create: {
      id: "directstay-demo-owner",
      displayName: ownerName,
    },
  });

  const property = await prisma.property.upsert({
    where: { slug: propertySlug },
    update: {
      ownerId: owner.id,
      name: "Villa La Percha",
      status: PropertyStatus.LIVE,
      currency: "USD",
      timezone: "America/New_York",
      minimumStayNights: 5,
      inquiryEnabled: true,
      inquiryEmail: "VillaLaPercha@gmail.com",
      publicDomain: "directstay.app/villa-la-percha",
    },
    create: {
      slug: propertySlug,
      ownerId: owner.id,
      name: "Villa La Percha",
      status: PropertyStatus.LIVE,
      currency: "USD",
      timezone: "America/New_York",
      minimumStayNights: 5,
      inquiryEnabled: true,
      inquiryEmail: "VillaLaPercha@gmail.com",
      publicDomain: "directstay.app/villa-la-percha",
    },
  });

  await prisma.$transaction(async (tx) => {
    await tx.pricingCharge.deleteMany({ where: { pricingRule: { propertyId: property.id } } });
    await tx.pricingRule.deleteMany({ where: { propertyId: property.id } });
    await tx.reservation.deleteMany({ where: { propertyId: property.id } });
    await tx.inquiry.deleteMany({ where: { propertyId: property.id } });

    for (const entry of pricing.entries) {
      await tx.pricingRule.create({
        data: {
          id: entry.id,
          propertyId: property.id,
          platform: PricingPlatform[entry.platform.toUpperCase()],
          startDate: new Date(entry.startDate),
          endDate: new Date(entry.endDate),
          nightlyRate: entry.nightlyRate,
          minimumStayNights: entry.minimumStayNights ?? null,
          notes: entry.notes ?? null,
          charges: {
            create: (entry.charges || []).map((charge) => ({
              label: charge.label,
              category: toChargeCategory(charge.category),
              chargeType: toChargeType(charge.type),
              value: charge.value,
              basis: toChargeBasis(charge.basis),
              perNight: Boolean(charge.perNight),
            })),
          },
        },
      });
    }

    if (reservations.length) {
      await tx.reservation.createMany({
        data: reservations.map((reservation) => ({
          id: reservation.id,
          propertyId: property.id,
          status: toReservationStatus(reservation.status),
          source: toReservationSource(reservation.type, reservation.isOwnerWeek),
          bookingType: reservation.type,
          bookedDate: reservation.bookedDate ? new Date(reservation.bookedDate) : null,
          guestName: null,
          guestEmail: null,
          guestPhone: null,
          checkIn: new Date(reservation.checkIn),
          checkOut: new Date(reservation.checkOut),
          nights: reservation.nights,
          totalAmount: reservation.income,
          currency: reservation.currency || "USD",
          isOwnerWeek: Boolean(reservation.isOwnerWeek),
          notes: null,
        })),
      });
    }

    if (inquiries.length) {
      await tx.inquiry.createMany({
        data: inquiries.map((inquiry) => ({
          id: inquiry.id,
          propertyId: property.id,
          fullName: inquiry.fullName,
          email: inquiry.email,
          phone: inquiry.phone ?? null,
          checkIn: inquiry.checkIn ? new Date(inquiry.checkIn) : null,
          checkOut: inquiry.checkOut ? new Date(inquiry.checkOut) : null,
          message: inquiry.message ?? null,
          status: toInquiryStatus(inquiry.status),
          createdAt: inquiry.createdAt ? new Date(inquiry.createdAt) : new Date(),
        })),
      });
    }
  });

  console.log(`Seeded Supabase for ${property.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
