import { NextResponse } from "next/server";
import { requireOwnerPortalSession, requireOwnerPortalWriteAccess } from "@/lib/ownerPortalApi";
import { getOwnerPortalPropertyScope } from "@/lib/ownerPortalScope";
import { ensureReservationEmailJobs, getReservationCommunicationSummary, markReservationEmailJobStatus, saveReservationReplyDraft, sendApprovedReservationReplyDraft, type ReservationEmailStatus } from "@/lib/reservationComms";
import type { InquiryDraftRecord } from "@/lib/inquiries";
import { createAiRevisionJob, type AiRevisionIntent } from "@/lib/aiDraftJobs";
import { getPrismaClient } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

async function assertScopedReservation(id: string) {
  const property = await getOwnerPortalPropertyScope();
  const prisma = await getPrismaClient();
  const reservation = await prisma.reservation.findFirst({ where: { id, propertyId: property.id }, select: { id: true } });
  if (!reservation) return null;
  return reservation;
}

export async function GET(_req: Request, context: Params) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const { id } = await context.params;
  const reservation = await assertScopedReservation(id);
  if (!reservation) return NextResponse.json({ ok: false, error: "Reservation not found" }, { status: 404 });
  await ensureReservationEmailJobs(id);
  const communication = await getReservationCommunicationSummary(id);
  return NextResponse.json({ ok: true, communication });
}

export async function POST(req: Request, context: Params) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;
  const writeBlocked = await requireOwnerPortalWriteAccess();
  if (writeBlocked) return writeBlocked;
  const { id } = await context.params;
  const reservation = await assertScopedReservation(id);
  if (!reservation) return NextResponse.json({ ok: false, error: "Reservation not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");
  if (action === "ensure_email_jobs") {
    const emailJobs = await ensureReservationEmailJobs(id);
    return NextResponse.json({ ok: true, emailJobs });
  }
  if (action === "draft") {
    const draft = await saveReservationReplyDraft({
      reservationId: id,
      draftId: body?.draftId ? String(body.draftId) : undefined,
      subject: body?.subject ? String(body.subject) : undefined,
      body: String(body?.body || ""),
      status: body?.status && ["draft", "pending_owner_approval", "approved", "sent"].includes(String(body.status)) ? String(body.status) as InquiryDraftRecord["status"] : "draft",
      createdByType: body?.createdByType && ["assistant", "owner"].includes(String(body.createdByType)) ? String(body.createdByType) as InquiryDraftRecord["createdByType"] : "owner",
    });
    const communication = await getReservationCommunicationSummary(id);
    return NextResponse.json({ ok: true, draft, communication });
  }
  if (action === "ai_revision") {
    const draftId = String(body?.draftId || "");
    const revisionIntent = String(body?.revisionIntent || "custom") as AiRevisionIntent;
    const allowedIntents = new Set(["shorter", "warmer", "direct", "custom"]);
    const communication = await getReservationCommunicationSummary(id);
    const draft = communication.drafts.find((item) => item.id === draftId);
    if (!draft || !allowedIntents.has(revisionIntent)) return NextResponse.json({ ok: false, error: "Missing draft or revision type" }, { status: 400 });
    if (draft.status !== "draft") return NextResponse.json({ ok: false, error: "AI revisions can only be queued for an unsent draft." }, { status: 400 });
    const job = await createAiRevisionJob({
      inquiryId: draft.inquiryId,
      draftId: draft.id,
      subject: body?.subject ? String(body.subject) : draft.subject,
      body: String(body?.draftBody || draft.body || ""),
      intent: revisionIntent,
      instruction: body?.instruction ? String(body.instruction) : undefined,
    });
    return NextResponse.json({ ok: true, job: { id: job.id } });
  }
  if (action === "send") {
    const draftId = String(body?.draftId || "");
    if (!draftId) return NextResponse.json({ ok: false, error: "Missing draft id" }, { status: 400 });
    await saveReservationReplyDraft({
      reservationId: id,
      draftId,
      subject: body?.subject ? String(body.subject) : undefined,
      body: String(body?.body || ""),
      status: "approved",
      createdByType: "owner",
    });
    const sent = await sendApprovedReservationReplyDraft(id, draftId);
    const communication = await getReservationCommunicationSummary(id);
    return NextResponse.json({ ok: true, sent, communication });
  }
  if (action === "job_status") {
    const jobId = String(body?.jobId || "");
    const status = String(body?.status || "");
    if (!jobId || !["pending_approval", "approved", "sent", "cancelled", "failed"].includes(status)) {
      return NextResponse.json({ ok: false, error: "Missing job or unsupported status" }, { status: 400 });
    }
    const job = await markReservationEmailJobStatus(id, jobId, status as ReservationEmailStatus);
    return NextResponse.json({ ok: true, job });
  }
  return NextResponse.json({ ok: false, error: "Unsupported communication action" }, { status: 400 });
}
