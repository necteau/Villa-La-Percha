import { getPrismaClient } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+\..+/i;

export type PlatformLeadInput = {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  propertyName?: string;
  propertyCount?: number;
  propertyLocation?: string;
  currentWebsite?: string;
  desiredCustomDomain?: string;
  pms?: string;
  launchTimeline?: string;
  goal?: string;
  message?: string;
  source?: string;
};

export type PlatformLeadValidation =
  | { ok: true; data: PlatformLeadInput }
  | { ok: false; error: string };

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

export function validatePlatformLeadInput(body: Record<string, unknown>): PlatformLeadValidation {
  const fullName = cleanString(body.fullName, 140);
  const email = cleanString(body.email, 180)?.toLowerCase();
  const company = cleanString(body.company, 180);
  const propertyName = cleanString(body.propertyName, 180);
  const propertyLocation = cleanString(body.propertyLocation, 180);
  const goal = cleanString(body.goal, 220);

  if (!fullName || !email || !propertyName || !propertyLocation) {
    return { ok: false, error: "Please include your name, email, property name, and property location." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const propertyCountRaw = body.propertyCount;
  const propertyCount = propertyCountRaw === undefined || propertyCountRaw === "" ? undefined : Number(propertyCountRaw);
  if (propertyCount !== undefined && (!Number.isInteger(propertyCount) || propertyCount < 1 || propertyCount > 1000)) {
    return { ok: false, error: "Please enter a valid property count." };
  }

  const currentWebsite = cleanString(body.currentWebsite, 500);
  if (currentWebsite && !URL_REGEX.test(currentWebsite)) {
    return { ok: false, error: "Please include a full website or listing URL starting with http:// or https://." };
  }

  return {
    ok: true,
    data: {
      fullName,
      email,
      phone: cleanString(body.phone, 80),
      company,
      propertyName,
      propertyCount,
      propertyLocation,
      currentWebsite,
      desiredCustomDomain: cleanString(body.desiredCustomDomain, 180),
      pms: cleanString(body.pms, 160),
      launchTimeline: cleanString(body.launchTimeline, 160),
      goal,
      message: cleanString(body.message, 4000),
      source: cleanString(body.source, 80) || "direct",
    },
  };
}

export async function createPlatformLead(input: PlatformLeadInput) {
  const prisma = await getPrismaClient();
  return prisma.platformLead.create({ data: input });
}

export async function getAdminPlatformLeads() {
  const prisma = await getPrismaClient();
  return prisma.platformLead.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
}

export async function getAdminPlatformLead(leadId: string) {
  const prisma = await getPrismaClient();
  return prisma.platformLead.findUnique({ where: { id: leadId } });
}
