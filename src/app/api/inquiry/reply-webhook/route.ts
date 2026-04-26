import { NextResponse } from "next/server";
import { appendInquiryMessage, getInquiryThreadById } from "@/lib/inquiries";
import { extractInquiryIdFromSubject } from "@/lib/inquiryEmail";

function isAuthorized(req: Request): boolean {
  const expected = process.env.INQUIRY_WEBHOOK_SECRET;
  if (!expected) return false;
  const provided = req.headers.get("x-inquiry-webhook-secret") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return provided === expected;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const subject = typeof body?.subject === "string" ? body.subject : "";
    const inquiryId = typeof body?.inquiryId === "string" ? body.inquiryId : extractInquiryIdFromSubject(subject);
    if (!inquiryId) {
      return NextResponse.json({ ok: false, error: "Could not determine inquiry id" }, { status: 400 });
    }

    const thread = await getInquiryThreadById(inquiryId);
    if (!thread) {
      return NextResponse.json({ ok: false, error: "Inquiry not found" }, { status: 404 });
    }

    const from = typeof body?.from === "string" ? body.from.toLowerCase() : "";
    if (from && from !== thread.email.toLowerCase()) {
      return NextResponse.json({ ok: false, error: "Sender did not match inquiry email" }, { status: 400 });
    }

    const text = typeof body?.text === "string" && body.text.trim() ? body.text.trim() : typeof body?.html === "string" ? body.html.trim() : "";
    if (!text) {
      return NextResponse.json({ ok: false, error: "Missing message body" }, { status: 400 });
    }

    const message = await appendInquiryMessage({
      inquiryId,
      direction: "inbound",
      authorType: "guest",
      subject: subject || `Reply from ${thread.fullName}`,
      body: text,
      emailMessageId: typeof body?.messageId === "string" ? body.messageId : undefined,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to ingest inbound reply" },
      { status: 400 }
    );
  }
}
