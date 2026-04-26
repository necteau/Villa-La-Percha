import { NextResponse } from "next/server";
import { requireOwnerPortalSession } from "@/lib/ownerPortalApi";
import { listInquiryThreads, saveInquiryDraft, updateInquiryStatus } from "@/lib/inquiries";

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

    return NextResponse.json({ ok: false, error: "Unsupported inquiry action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update inquiry" },
      { status: 400 }
    );
  }
}
