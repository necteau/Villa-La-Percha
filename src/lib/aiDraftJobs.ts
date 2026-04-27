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
  // Kept for backward compatibility with older local worker scripts.
  inquiry?: InquiryThreadRecord;
}

const PROPERTY_CONTEXT = { name: "Villa La Percha", slug: "villa-la-percha" };

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
  const candidates = await prisma.inquiryReplyDraft.findMany({
    where: {
      status: "DRAFT",
      createdByType: "ASSISTANT",
      sentAt: null,
    },
    orderBy: { updatedAt: "asc" },
    take: Math.max(1, Math.min(limit * 4, 50)),
  });

  const jobs: AiDraftJob[] = [];
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
