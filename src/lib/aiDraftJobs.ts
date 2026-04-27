import { getInquiryCopilotInsights } from "@/lib/inquiryCopilot";
import { getPrismaClient } from "@/lib/db";
import { canUseDatabaseSync } from "@/lib/fallbackOrchestrator";
import { getInquiryThreadById, saveInquiryDraft, type InquiryThreadRecord } from "@/lib/inquiries";

interface AiDraftCustomerContext {
  fullName: string;
  email: string;
  phone?: string;
  locationLabel?: string;
  timezone?: string;
  preferredContactMethod?: string;
  status?: string;
  notes?: string;
  preferencesSummary?: string;
  householdSummary?: string;
  specialOccasions?: string;
  conciergeInterests?: string;
  totalInquiries: number;
  totalReservations: number;
  totalCompletedStays: number;
  totalRevenue: number;
  pastInquiries: Array<{
    id: string;
    status: string;
    checkIn?: string;
    checkOut?: string;
    createdAt: string;
  }>;
  pastReservations: Array<{
    id: string;
    status: string;
    source: string;
    checkIn: string;
    checkOut: string;
    totalAmount?: number;
    currency: string;
  }>;
}

export type AiRevisionIntent = "shorter" | "warmer" | "direct" | "custom";

interface AiDraftContext {
  property: {
    name: string;
    slug: string;
  };
  inquiry: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    checkIn?: string;
    checkOut?: string;
    message?: string;
    status: string;
    createdAt: string;
  };
  threadMessages: Array<{
    direction: string;
    authorType: string;
    subject?: string;
    body: string;
    sentAt?: string;
    receivedAt?: string;
    createdAt: string;
  }>;
  customer?: AiDraftCustomerContext;
  assistantSignals: {
    summary: string;
    urgency: string;
    leadLabel: string;
    leadScore: number;
    missingInfo: string[];
    keyFacts: Array<{ label: string; value: string }>;
    objectionSignals: string[];
    suggestedNextAction: string;
  };
}

export interface AiDraftJob {
  draftId: string;
  inquiryId: string;
  subject?: string;
  body: string;
  context: AiDraftContext;
  revisionIntent?: AiRevisionIntent;
  revisionInstruction?: string;
  targetDraftId?: string;
  // Kept for backward compatibility with older local worker scripts.
  inquiry?: InquiryThreadRecord;
}

interface AiRevisionJobPayload {
  kind: "directstay_ai_revision";
  targetDraftId: string;
  inquiryId: string;
  intent: AiRevisionIntent;
  instruction?: string;
  subject?: string;
  body: string;
  createdAt: string;
}

const PROPERTY_CONTEXT = { name: "Villa La Percha", slug: "villa-la-percha" };
const REVISION_PREFIX = "__DIRECTSTAY_AI_REVISION__";

function parseRevisionJob(value: string): AiRevisionJobPayload | null {
  if (!value.startsWith(REVISION_PREFIX)) return null;
  try {
    const parsed = JSON.parse(value.slice(REVISION_PREFIX.length));
    if (parsed?.kind !== "directstay_ai_revision" || !parsed.targetDraftId || !parsed.inquiryId || !parsed.body) return null;
    return parsed as AiRevisionJobPayload;
  } catch {
    return null;
  }
}

function serializeRevisionJob(payload: AiRevisionJobPayload): string {
  return `${REVISION_PREFIX}${JSON.stringify(payload)}`;
}

function sanitizeOwnerInstruction(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 1000);
}

export function isInternalAiRequest(req: Request): boolean {
  const secret = process.env.DIRECTSTAY_INTERNAL_API_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return bearer === secret || req.headers.get("x-directstay-internal-secret") === secret;
}

async function isStillTemplateDraft(inquiry: InquiryThreadRecord, draft: { subject: string | null; body: string }) {
  const insights = await getInquiryCopilotInsights(inquiry);
  const templateBodies = new Set(insights.draftOptions.map((option) => option.body.trim()));
  return templateBodies.has(draft.body.trim());
}

function isoDate(value: Date | null | undefined, dateOnly = false): string | undefined {
  if (!value) return undefined;
  const iso = value.toISOString();
  return dateOnly ? iso.slice(0, 10) : iso;
}

async function getCustomerContext(inquiry: InquiryThreadRecord): Promise<AiDraftCustomerContext | undefined> {
  if (!inquiry.customerId || !canUseDatabaseSync()) return undefined;
  const prisma = await getPrismaClient();
  const customer = await prisma.customer.findUnique({
    where: { id: inquiry.customerId },
    include: {
      inquiries: {
        where: { id: { not: inquiry.id } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, status: true, checkIn: true, checkOut: true, createdAt: true },
      },
      reservations: {
        orderBy: { checkIn: "desc" },
        take: 10,
        select: { id: true, status: true, source: true, checkIn: true, checkOut: true, totalAmount: true, currency: true },
      },
    },
  });
  if (!customer) return undefined;

  const pastReservations = customer.reservations.map((reservation) => ({
    id: reservation.id,
    status: reservation.status,
    source: reservation.source,
    checkIn: reservation.checkIn.toISOString().slice(0, 10),
    checkOut: reservation.checkOut.toISOString().slice(0, 10),
    totalAmount: reservation.totalAmount ? Number(reservation.totalAmount) : undefined,
    currency: reservation.currency,
  }));
  const totalRevenue = pastReservations.reduce((sum, reservation) => sum + (reservation.totalAmount || 0), 0);
  const totalCompletedStays = pastReservations.filter((reservation) => ["COMPLETED", "CHECKED_IN", "CONFIRMED"].includes(reservation.status)).length;

  return {
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone ?? undefined,
    locationLabel: customer.locationLabel ?? undefined,
    timezone: customer.timezone ?? undefined,
    preferredContactMethod: customer.preferredContactMethod ?? undefined,
    status: customer.status,
    notes: customer.notes ?? undefined,
    preferencesSummary: customer.preferencesSummary ?? undefined,
    householdSummary: customer.householdSummary ?? undefined,
    specialOccasions: customer.specialOccasions ?? undefined,
    conciergeInterests: customer.conciergeInterests ?? undefined,
    totalInquiries: customer.inquiries.length + 1,
    totalReservations: customer.reservations.length,
    totalCompletedStays,
    totalRevenue,
    pastInquiries: customer.inquiries.map((pastInquiry) => ({
      id: pastInquiry.id,
      status: pastInquiry.status,
      checkIn: isoDate(pastInquiry.checkIn, true),
      checkOut: isoDate(pastInquiry.checkOut, true),
      createdAt: pastInquiry.createdAt.toISOString(),
    })),
    pastReservations,
  };
}

async function buildAiDraftContext(inquiry: InquiryThreadRecord): Promise<AiDraftContext> {
  const insights = await getInquiryCopilotInsights(inquiry);
  return {
    property: PROPERTY_CONTEXT,
    inquiry: {
      id: inquiry.id,
      fullName: inquiry.fullName,
      email: inquiry.email,
      phone: inquiry.phone,
      checkIn: inquiry.checkIn,
      checkOut: inquiry.checkOut,
      message: inquiry.message,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
    },
    threadMessages: inquiry.messages.map((message) => ({
      direction: message.direction,
      authorType: message.authorType,
      subject: message.subject,
      body: message.body,
      sentAt: message.sentAt,
      receivedAt: message.receivedAt,
      createdAt: message.createdAt,
    })),
    customer: await getCustomerContext(inquiry),
    assistantSignals: {
      summary: insights.summary,
      urgency: insights.urgency,
      leadLabel: insights.leadLabel,
      leadScore: insights.leadScore,
      missingInfo: insights.missingInfo,
      keyFacts: insights.keyFacts,
      objectionSignals: insights.objectionSignals,
      suggestedNextAction: insights.suggestedNextAction,
    },
  };
}

export async function listPendingAiDraftJobs(limit = 10): Promise<AiDraftJob[]> {
  if (!canUseDatabaseSync()) return [];
  const prisma = await getPrismaClient();
  const revisionCandidates = await prisma.inquiryReplyDraft.findMany({
    where: { status: "DRAFT", createdByType: "SYSTEM", sentAt: null },
    orderBy: { updatedAt: "asc" },
    take: Math.max(1, Math.min(limit, 25)),
  });

  const jobs: AiDraftJob[] = [];
  for (const draft of revisionCandidates) {
    if (jobs.length >= limit) break;
    const payload = parseRevisionJob(draft.body);
    if (!payload) continue;
    const inquiry = await getInquiryThreadById(payload.inquiryId);
    if (!inquiry) continue;
    jobs.push({
      draftId: draft.id,
      inquiryId: payload.inquiryId,
      targetDraftId: payload.targetDraftId,
      subject: payload.subject,
      body: payload.body,
      revisionIntent: payload.intent,
      revisionInstruction: payload.instruction,
      context: await buildAiDraftContext(inquiry),
      inquiry,
    });
  }

  const remaining = limit - jobs.length;
  if (remaining <= 0) return jobs;

  const candidates = await prisma.inquiryReplyDraft.findMany({
    where: {
      status: "DRAFT",
      createdByType: "ASSISTANT",
      sentAt: null,
    },
    orderBy: { updatedAt: "asc" },
    take: Math.max(1, Math.min(remaining * 4, 50)),
  });

  for (const draft of candidates) {
    if (jobs.length >= limit) break;
    const inquiry = await getInquiryThreadById(draft.inquiryId);
    if (!inquiry) continue;
    if (!(await isStillTemplateDraft(inquiry, draft))) continue;
    jobs.push({
      draftId: draft.id,
      inquiryId: draft.inquiryId,
      subject: draft.subject ?? undefined,
      body: draft.body,
      context: await buildAiDraftContext(inquiry),
      inquiry,
    });
  }
  return jobs;
}

export async function markAiDraftAttempt(draftId: string, error?: string) {
  void draftId;
  void error;
  // No-op in the migration-free version. The Mac worker logs failures locally;
  // website template drafts remain available and eligible for later upgrade.
  return null;
}

export async function completeAiDraftUpgrade(input: {
  draftId: string;
  subject?: string;
  body: string;
  modelUsed: string;
}) {
  if (!canUseDatabaseSync()) throw new Error("Database is required for AI draft upgrades");
  const prisma = await getPrismaClient();
  const existing = await prisma.inquiryReplyDraft.findUnique({ where: { id: input.draftId } });
  if (!existing) throw new Error("Draft not found");

  const revisionPayload = parseRevisionJob(existing.body);
  if (revisionPayload) {
    const target = await prisma.inquiryReplyDraft.findUnique({ where: { id: revisionPayload.targetDraftId } });
    if (!target || target.status !== "DRAFT" || target.sentAt) {
      await prisma.inquiryReplyDraft.update({ where: { id: existing.id }, data: { status: "SENT", sentAt: new Date() } });
      return { skipped: true, reason: "Target draft is no longer eligible for AI revision" };
    }
    const draft = await saveInquiryDraft({
      id: target.id,
      inquiryId: target.inquiryId,
      subject: input.subject || target.subject || undefined,
      body: input.body,
      status: "draft",
      createdByType: "assistant",
    });
    await prisma.inquiryReplyDraft.update({ where: { id: existing.id }, data: { status: "SENT", sentAt: new Date() } });
    return { skipped: false, draft, modelUsed: input.modelUsed };
  }

  if (existing.status !== "DRAFT" || existing.sentAt || existing.createdByType !== "ASSISTANT") {
    return { skipped: true, reason: "Draft is no longer eligible for silent AI replacement" };
  }

  const inquiry = await getInquiryThreadById(existing.inquiryId);
  if (!inquiry) throw new Error("Inquiry not found");
  if (!(await isStillTemplateDraft(inquiry, existing))) {
    return { skipped: true, reason: "Draft no longer matches a website template, likely already edited or upgraded" };
  }

  const draft = await saveInquiryDraft({
    id: existing.id,
    inquiryId: existing.inquiryId,
    subject: input.subject || existing.subject || undefined,
    body: input.body,
    status: "draft",
    createdByType: "assistant",
  });

  return { skipped: false, draft, modelUsed: input.modelUsed };
}


export async function createAiRevisionJob(input: {
  inquiryId: string;
  draftId: string;
  subject?: string;
  body: string;
  intent: AiRevisionIntent;
  instruction?: string;
}) {
  if (!input.body.trim()) throw new Error("Draft body is required for AI revision");
  const instruction = input.intent === "custom" ? sanitizeOwnerInstruction(input.instruction || "") : undefined;
  if (input.intent === "custom" && !instruction) throw new Error("Custom revision instructions are required");

  return saveInquiryDraft({
    inquiryId: input.inquiryId,
    subject: `AI revision request: ${input.intent}`,
    body: serializeRevisionJob({
      kind: "directstay_ai_revision",
      targetDraftId: input.draftId,
      inquiryId: input.inquiryId,
      intent: input.intent,
      instruction,
      subject: input.subject,
      body: input.body,
      createdAt: new Date().toISOString(),
    }),
    status: "draft",
    createdByType: "system",
  });
}
