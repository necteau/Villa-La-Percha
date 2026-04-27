import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { getInquiryThreadById, listInquiryThreads, runInquiryInboundAutomation, saveInquiryDraft, updateInquiryStatus, type InquiryThreadRecord } from "@/lib/inquiries";
import { sendApprovedInquiryDraft } from "@/lib/inquiryEmail";
import { getInquiryCopilotInsights } from "@/lib/inquiryCopilot";
import { createAiRevisionJob, type AiRevisionIntent } from "@/lib/aiDraftJobs";
import { trackInquiryConverted } from "@/lib/analytics";

function needsFreshDraftAfterLatestInbound(inquiry: InquiryThreadRecord): boolean {
  const latestInbound = [...inquiry.messages].reverse().find((message) => message.direction === "inbound");
  if (!latestInbound) return false;

  const latestInboundAt = Date.parse(latestInbound.receivedAt || latestInbound.createdAt);
  const latestOpenDraft = inquiry.drafts.find((draft) => draft.createdByType !== "system" && draft.status === "draft");
  if (!latestOpenDraft) return true;

  return Date.parse(latestOpenDraft.updatedAt) < latestInboundAt;
}

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  let inquiries = await listInquiryThreads();
  const staleDraftInquiries = inquiries.filter(needsFreshDraftAfterLatestInbound).slice(0, 5);
  if (staleDraftInquiries.length > 0) {
    await Promise.all(staleDraftInquiries.map((inquiry) => runInquiryInboundAutomation(inquiry.id).catch(() => {})));
    inquiries = await listInquiryThreads();
  }

  return NextResponse.json({ ok: true, inquiries });
}

export async function POST(req: Request) {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const action = String(body?.action || "");

    if (action === "status") {
      const id = String(body?.id || "");
      const status = body?.status;
      if (!id || !status) {
        return NextResponse.json({ ok: false, error: "Missing inquiry id or status" }, { status: 400 });
      }

      const inquiry = await updateInquiryStatus(id, status);
      if (!inquiry) {
        return NextResponse.json({ ok: false, error: "Inquiry not found" }, { status: 404 });
      }

      if (status === "converted") {
        void trackInquiryConverted(id).catch(() => {});
      }

      return NextResponse.json({ ok: true, inquiry });
    }

    if (action === "draft") {
      const inquiryId = String(body?.inquiryId || "");
      const draft = await saveInquiryDraft({
        id: body?.id ? String(body.id) : undefined,
        inquiryId,
        subject: body?.subject ? String(body.subject) : undefined,
        body: String(body?.body || ""),
        status: body?.status,
        createdByType: body?.createdByType,
      });
      return NextResponse.json({ ok: true, draft });
    }

    if (action === "ai_revision") {
      const inquiryId = String(body?.inquiryId || "");
      const draftId = String(body?.draftId || "");
      const revisionIntent = String(body?.revisionIntent || "custom") as AiRevisionIntent;
      const allowedIntents = new Set(["shorter", "warmer", "direct", "custom"]);
      if (!inquiryId || !draftId || !allowedIntents.has(revisionIntent)) {
        return NextResponse.json({ ok: false, error: "Missing inquiry, draft, or revision type" }, { status: 400 });
      }
      const job = await createAiRevisionJob({
        inquiryId,
        draftId,
        subject: body?.subject ? String(body.subject) : undefined,
        body: String(body?.draftBody || ""),
        intent: revisionIntent,
        instruction: body?.instruction ? String(body.instruction) : undefined,
      });
      return NextResponse.json({ ok: true, job: { id: job.id } });
    }

    if (action === "send") {
      const inquiryId = String(body?.inquiryId || "");
      const draftId = String(body?.draftId || "");
      if (!inquiryId || !draftId) {
        return NextResponse.json({ ok: false, error: "Missing inquiry or draft id" }, { status: 400 });
      }
      const draft = await saveInquiryDraft({
        id: draftId,
        inquiryId,
        subject: body?.subject ? String(body.subject) : undefined,
        body: String(body?.body || ""),
        status: "approved",
        createdByType: "owner",
      });
      const sent = await sendApprovedInquiryDraft(inquiryId, draft.id);
      return NextResponse.json({ ok: true, sent });
    }

    if (action === "assist") {
      const inquiryId = String(body?.inquiryId || "");
      if (!inquiryId) {
        return NextResponse.json({ ok: false, error: "Missing inquiry id" }, { status: 400 });
      }
      const inquiry = await getInquiryThreadById(inquiryId);
      if (!inquiry) {
        return NextResponse.json({ ok: false, error: "Inquiry not found" }, { status: 404 });
      }
      const insights = await getInquiryCopilotInsights(inquiry);
      return NextResponse.json({ ok: true, insights });
    }

    return NextResponse.json({ ok: false, error: "Unsupported inquiry action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update inquiry" },
      { status: 400 }
    );
  }
}
