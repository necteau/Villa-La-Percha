import { promises as fs } from "fs";
import path from "path";
import { InquiryStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/db";

export interface InquiryRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
  message?: string;
  status: "new" | "replied" | "approved" | "declined" | "converted";
  createdAt: string;
}

export interface InquiryInput {
  fullName: string;
  email: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
  message?: string;
}

const FALLBACK_PATH = path.join(process.cwd(), "src/data/inquiries.json");
const PROPERTY_SLUG = "villa-la-percha";

function canUseDatabase(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && !url.includes("USER:PASSWORD@HOST");
}

async function readFallback(): Promise<InquiryRecord[]> {
  const raw = await fs.readFile(FALLBACK_PATH, "utf8");
  return JSON.parse(raw) as InquiryRecord[];
}

async function writeFallback(records: InquiryRecord[]) {
  await fs.writeFile(FALLBACK_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

function fromDbStatus(status: InquiryStatus): InquiryRecord["status"] {
  return status.toLowerCase() as InquiryRecord["status"];
}

function toDbStatus(status: InquiryRecord["status"]): InquiryStatus {
  switch (status) {
    case "replied":
      return InquiryStatus.REPLIED;
    case "approved":
      return InquiryStatus.APPROVED;
    case "declined":
      return InquiryStatus.DECLINED;
    case "converted":
      return InquiryStatus.CONVERTED;
    case "new":
    default:
      return InquiryStatus.NEW;
  }
}

function mapDbInquiry(record: {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  checkIn: Date | null;
  checkOut: Date | null;
  message: string | null;
  status: InquiryStatus;
  createdAt: Date;
}): InquiryRecord {
  return {
    id: record.id,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone ?? undefined,
    checkIn: record.checkIn?.toISOString().slice(0, 10),
    checkOut: record.checkOut?.toISOString().slice(0, 10),
    message: record.message ?? undefined,
    status: fromDbStatus(record.status),
    createdAt: record.createdAt.toISOString(),
  };
}

async function getPropertyId(): Promise<string | null> {
  const prisma = await getPrismaClient();
  const property = await prisma.property.findUnique({ where: { slug: PROPERTY_SLUG } });
  return property?.id ?? null;
}

export async function listInquiries(): Promise<InquiryRecord[]> {
  if (!canUseDatabase()) {
    return readFallback();
  }

  try {
    const prisma = await getPrismaClient();
    const propertyId = await getPropertyId();
    if (!propertyId) return readFallback();

    const records = await prisma.inquiry.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
    });

    if (records.length === 0) {
      return readFallback();
    }

    return records.map(mapDbInquiry);
  } catch {
    return readFallback();
  }
}

export async function updateInquiryStatus(id: string, status: InquiryRecord["status"]): Promise<InquiryRecord | null> {
  if (!canUseDatabase()) {
    const current = await readFallback();
    const existing = current.find((inquiry) => inquiry.id === id);
    if (!existing) return null;
    const updated = { ...existing, status };
    await writeFallback(current.map((inquiry) => (inquiry.id === id ? updated : inquiry)));
    return updated;
  }

  try {
    const prisma = await getPrismaClient();
    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status: toDbStatus(status) },
    });
    return mapDbInquiry(updated);
  } catch {
    const current = await readFallback();
    const existing = current.find((inquiry) => inquiry.id === id);
    if (!existing) return null;
    const updated = { ...existing, status };
    await writeFallback(current.map((inquiry) => (inquiry.id === id ? updated : inquiry)));
    return updated;
  }
}

export async function createInquiry(input: InquiryInput): Promise<InquiryRecord> {
  const base: InquiryRecord = {
    id: String(Date.now()),
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    message: input.message,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  if (!canUseDatabase()) {
    const current = await readFallback();
    await writeFallback([base, ...current]);
    return base;
  }

  try {
    const prisma = await getPrismaClient();
    const propertyId = await getPropertyId();
    if (!propertyId) throw new Error("Missing property");
    const created = await prisma.inquiry.create({
      data: {
        propertyId,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        checkIn: input.checkIn ? new Date(input.checkIn) : null,
        checkOut: input.checkOut ? new Date(input.checkOut) : null,
        message: input.message,
      },
    });
    return mapDbInquiry(created);
  } catch {
    const current = await readFallback();
    await writeFallback([base, ...current]);
    return base;
  }
}
