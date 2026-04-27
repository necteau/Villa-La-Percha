import { getInquiryCopilotInsights } from "@/lib/inquiryCopilot";
import { getPrismaClient } from "@/lib/db";
import { canUseDatabaseSync } from "@/lib/fallbackOrchestrator";
import { getInquiryThreadById, saveInquiryDraft, type InquiryThreadRecord } from "@/lib/inquiries";

export interface AiDraftJob {
  draftId: string;
  inquiryId: string;
  subject?: string;
  body: string;
  inquiry: InquiryThreadRecord;
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
