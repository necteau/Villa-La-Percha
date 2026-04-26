import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { getInquiryThreadById, listInquiryThreads, saveInquiryDraft, updateInquiryStatus } from "@/lib/inquiries";
import { sendApprovedInquiryDraft } from "@/lib/inquiryEmail";
import { getInquiryCopilotInsights } from "@/lib/inquiryCopilot";
import { trackInquiryConverted } from "@/lib/analytics";

export async function GET() {
  const unauthorized = await requireOwnerPortalSession();
  if (unauthorized) return unauthorized;

  const inquiries = await listInquiryThreads();
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

    if (action === "send") {
      const inquiryId = String(body?.inquiryId || "");
      const draftId = String(body?.draftId || "");
      if (!inquiryId || !draftId) {
        return NextResponse.json({ ok: false, error: "Missing inquiry or draft id" }, { status: 400 });
      }
      const sent = await sendApprovedInquiryDraft(inquiryId, draftId);
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
