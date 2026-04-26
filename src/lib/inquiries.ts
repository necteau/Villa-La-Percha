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

async function getPropertyId(): Promise<string | null> {
  const prisma = await getPrismaClient();
  const property = await prisma.property.findUnique({ where: { slug: PROPERTY_SLUG } });
  return property?.id ?? null;
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
    return {
      id: created.id,
      fullName: created.fullName,
      email: created.email,
      phone: created.phone ?? undefined,
      checkIn: created.checkIn?.toISOString().slice(0, 10),
      checkOut: created.checkOut?.toISOString().slice(0, 10),
      message: created.message ?? undefined,
      status: fromDbStatus(created.status),
      createdAt: created.createdAt.toISOString(),
    };
  } catch {
    const current = await readFallback();
    await writeFallback([base, ...current]);
    return base;
  }
}
