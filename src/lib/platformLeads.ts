import { getPrismaClient } from "@/lib/db";
import type { ContractExecutionStatus, PlatformLeadArtifactStatus, PlatformLeadArtifactType, PlatformLeadStatus, PreviewBuildStatus } from "@prisma/client";

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

  const phone = cleanString(body.phone, 80);

  if (!fullName || !email || !phone || !propertyName || !propertyLocation) {
    return { ok: false, error: "Please include your name, email, phone number, property name, and property location." };
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
      phone,
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
  return prisma.platformLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      artifacts: { orderBy: { createdAt: "desc" }, take: 2 },
      previewBuilds: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

export async function getAdminPlatformLead(leadId: string) {
  const prisma = await getPrismaClient();
  return prisma.platformLead.findFirst({
    where: { id: leadId },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      artifacts: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      previewBuilds: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function updatePlatformLeadStatus(leadId: string, status: PlatformLeadStatus) {
  const prisma = await getPrismaClient();
  return prisma.platformLead.update({
    where: { id: leadId },
    data: { status },
  });
}

export async function addPlatformLeadNote(input: {
  leadId: string;
  body: string;
  authorUserId?: string | null;
  authorEmail?: string | null;
}) {
  const prisma = await getPrismaClient();
  return prisma.platformLeadNote.create({
    data: {
      platformLeadId: input.leadId,
      body: input.body.trim().slice(0, 4000),
      authorUserId: input.authorUserId ?? undefined,
      authorEmail: input.authorEmail ?? undefined,
    },
  });
}


export async function updatePlatformLeadOps(input: {
  leadId: string;
  status?: PlatformLeadStatus;
  firstRead?: string | null;
  nextAction?: string | null;
  nextFollowUpAt?: Date | null;
  source?: string | null;
  spamReason?: string | null;
  pricingSetupFeeCents?: number | null;
  pricingMonthlyFeeCents?: number | null;
  pricingCommissionBps?: number | null;
  pricingPaymentProcessingBps?: number | null;
  pricingNotes?: string | null;
  contractStatus?: ContractExecutionStatus;
  contractStorageUrl?: string | null;
}) {
  const prisma = await getPrismaClient();
  const data = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.firstRead !== undefined ? { firstRead: input.firstRead?.trim().slice(0, 2000) || null } : {}),
    ...(input.nextAction !== undefined ? { nextAction: input.nextAction?.trim().slice(0, 2000) || null } : {}),
    ...(input.nextFollowUpAt !== undefined ? { nextFollowUpAt: input.nextFollowUpAt } : {}),
    ...(input.source !== undefined ? { source: input.source?.trim().slice(0, 80) || "direct" } : {}),
    ...(input.spamReason !== undefined ? { spamReason: input.spamReason?.trim().slice(0, 1000) || null, spamReviewedAt: new Date() } : {}),
    ...(input.pricingSetupFeeCents !== undefined ? { pricingSetupFeeCents: input.pricingSetupFeeCents } : {}),
    ...(input.pricingMonthlyFeeCents !== undefined ? { pricingMonthlyFeeCents: input.pricingMonthlyFeeCents } : {}),
    ...(input.pricingCommissionBps !== undefined ? { pricingCommissionBps: input.pricingCommissionBps } : {}),
    ...(input.pricingPaymentProcessingBps !== undefined ? { pricingPaymentProcessingBps: input.pricingPaymentProcessingBps } : {}),
    ...(input.pricingNotes !== undefined ? { pricingNotes: input.pricingNotes?.trim().slice(0, 2000) || null } : {}),
    ...(input.contractStatus ? {
      contractStatus: input.contractStatus,
      ...(input.contractStatus === "SENT" ? { contractSentAt: new Date() } : {}),
      ...(input.contractStatus === "SIGNED" || input.contractStatus === "COUNTERSIGNED" ? { contractSignedAt: new Date() } : {}),
    } : {}),
    ...(input.contractStorageUrl !== undefined ? { contractStorageUrl: input.contractStorageUrl?.trim().slice(0, 500) || null } : {}),
  };
  return prisma.platformLead.update({ where: { id: input.leadId }, data });
}

export async function createPlatformLeadArtifact(input: {
  leadId: string;
  type: PlatformLeadArtifactType;
  status?: PlatformLeadArtifactStatus;
  title: string;
  body: string;
  createdByEmail?: string | null;
}) {
  const prisma = await getPrismaClient();
  return prisma.platformLeadArtifact.create({
    data: {
      platformLeadId: input.leadId,
      type: input.type,
      status: input.status ?? "DRAFT",
      title: input.title.trim().slice(0, 180),
      body: input.body.trim().slice(0, 12000),
      createdByEmail: input.createdByEmail ?? undefined,
    },
  });
}

export async function updatePlatformLeadArtifactStatus(input: {
  artifactId: string;
  status: PlatformLeadArtifactStatus;
  approvedByEmail?: string | null;
}) {
  const prisma = await getPrismaClient();
  return prisma.platformLeadArtifact.update({
    where: { id: input.artifactId },
    data: {
      status: input.status,
      ...(input.status === "APPROVED" ? { approvedAt: new Date(), approvedByEmail: input.approvedByEmail ?? undefined } : {}),
      ...(input.status === "SENT" ? { sentAt: new Date() } : {}),
    },
  });
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "property";
}

export async function createPreviewBuild(input: {
  leadId: string;
  propertyName: string;
  location: string;
  sourceUrls: string[];
  heroTitle?: string | null;
  positioning?: string | null;
}) {
  const prisma = await getPrismaClient();
  const token = Math.random().toString(36).slice(2, 8);
  return prisma.previewBuild.create({
    data: {
      platformLeadId: input.leadId,
      slug: `${slugify(input.propertyName)}-${token}`,
      propertyName: input.propertyName.trim().slice(0, 180),
      location: input.location.trim().slice(0, 180),
      sourceUrls: input.sourceUrls.map((url) => url.trim()).filter(Boolean).slice(0, 8),
      heroTitle: input.heroTitle?.trim().slice(0, 180) || null,
      positioning: input.positioning?.trim().slice(0, 500) || null,
      ownerCallouts: [
        { label: "Brand positioning", body: "This preview frames the property as its own hospitality brand rather than another OTA listing." },
        { label: "Owner-specific onboarding", body: "During onboarding, DirectStay gathers your property and location knowledge so the final site feels genuinely tailored." },
        { label: "Direct relationship", body: "The inquiry section is disabled in preview, but the live version is designed to keep guest relationships direct." }
      ],
    },
  });
}

export async function updatePreviewBuildStatus(previewBuildId: string, status: PreviewBuildStatus) {
  const prisma = await getPrismaClient();
  return prisma.previewBuild.update({
    where: { id: previewBuildId },
    data: { status, ...(status === "SHARED_WITH_LEAD" ? { sharedAt: new Date() } : {}) },
  });
}
