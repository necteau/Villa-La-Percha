import { NextResponse } from "next/server";
import { simpleParser } from "mailparser";
import { appendInquiryMessage, getInquiryThreadById } from "@/lib/inquiries";
import {
  extractEmailAddress,
  extractInquiryIdFromRequest,
  extractInquiryIdFromSubject,
  isAuthorized,
  normalizeBody,
  validateSender,
  logFailure,
  dispatchAnalyticsEvent,
  isRetryableError,
} from "@/lib/inquiryWebhook";

async function normalizeInboundPayload(body: unknown) {
  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const rawBase64 = typeof record.rawBase64 === "string" ? record.rawBase64 : null;

  if (!rawBase64) {
    return {
      subject: typeof record.subject === "string" ? record.subject.trim() : null,
      from: typeof record.from === "string" ? record.from.trim() : null,
      messageId: typeof record.messageId === "string" ? record.messageId.trim() : null,
      normalizedBody: normalizeBody(body),
    };
  }

  try {
    const parsed = await simpleParser(Buffer.from(rawBase64, "base64"));
    return {
      subject: parsed.subject?.trim() || null,
      from: parsed.from?.value?.[0]?.address?.trim() || null,
      messageId: parsed.messageId?.trim() || null,
      normalizedBody: normalizeBody({
        text: parsed.text || "",
        html: parsed.html ? String(parsed.html) : "",
      }),
    };
  } catch {
    return {
      subject: typeof record.subject === "string" ? record.subject.trim() : null,
      from: typeof record.from === "string" ? record.from.trim() : null,
      messageId: typeof record.messageId === "string" ? record.messageId.trim() : null,
      normalizedBody: normalizeBody(body),
    };
  }
}

export async function POST(req: Request) {
  if (!process.env.INQUIRY_WEBHOOK_SECRET) {
    const err = "INQUIRY_WEBHOOK_SECRET not configured";
    logFailure({ timestamp: new Date().toISOString(), inquiryId: null, error: err, statusCode: 500, sender: null, subject: null, retryable: false });
    return NextResponse.json({ ok: false, error: "Server misconfiguration" }, { status: 500 });
  }

  if (!isAuthorized(req)) {
    const err = "Unauthorized webhook attempt";
    logFailure({ timestamp: new Date().toISOString(), inquiryId: null, error: err, statusCode: 401, sender: null, subject: null, retryable: false });
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const inbound = await normalizeInboundPayload(body);
  const subjectFromBody = inbound.subject;
  const inquiryId =
    (typeof body?.inquiryId === "string" && body.inquiryId.trim()) ||
    extractInquiryIdFromRequest(req) ||
    extractInquiryIdFromSubject(subjectFromBody);

  if (!inquiryId) {
    const err = "Could not determine inquiry id from request";
    logFailure({ timestamp: new Date().toISOString(), inquiryId: null, error: err, statusCode: 400, sender: null, subject: null, retryable: true });
    return NextResponse.json({ ok: false, error: err }, { status: 400 });
  }

  // ── 3. Verify thread exists ──
  const thread = await getInquiryThreadById(inquiryId);
  if (!thread) {
    const err = `Inquiry ${inquiryId} not found`;
    logFailure({ timestamp: new Date().toISOString(), inquiryId, error: err, statusCode: 404, sender: null, subject: null, retryable: false });
    return NextResponse.json({ ok: false, error: err }, { status: 404 });
  }

  // ── 4. Parse and normalize body ──
  const normalizedBody = inbound.normalizedBody;
  if (!normalizedBody) {
    const err = "Missing message body";
    logFailure({ timestamp: new Date().toISOString(), inquiryId, error: err, statusCode: 400, sender: null, subject: null, retryable: true });
    return NextResponse.json({ ok: false, error: err }, { status: 400 });
  }

  // ── 5. Validate sender ──
  const sender = extractEmailAddress(inbound.from);
  if (sender && !validateSender(sender, thread.email)) {
    const err = `Sender ${sender} did not match inquiry email ${thread.email}`;
    logFailure({ timestamp: new Date().toISOString(), inquiryId, error: err, statusCode: 400, sender, subject: null, retryable: false });
    return NextResponse.json({ ok: false, error: "Sender did not match inquiry email" }, { status: 400 });
  }

  // ── 6. Check dedup (emailMessageId) ──
  const emailMessageId = inbound.messageId || undefined;
  if (emailMessageId) {
    const existingDedup = thread.messages.find((m) => m.emailMessageId === emailMessageId);
    if (existingDedup) {
      // Already processed — return success to avoid webhook retries
      return NextResponse.json({ ok: true, message: { id: existingDedup.id, deduplicated: true } });
    }
  }

  // ── 7. Append to thread ──
  const subject =
    subjectFromBody ||
    (req.headers.get("x-inquiry-subject") || req.headers.get("subject")) ||
    `Reply from ${thread.fullName}`;

  try {
    const message = await appendInquiryMessage({
      inquiryId,
      direction: "inbound",
      authorType: "guest",
      subject: subject || `Reply from ${thread.fullName}`,
      body: normalizedBody,
      emailMessageId,
      receivedAt: new Date().toISOString(),
    });

    // ── 8. Analytics ──
    dispatchAnalyticsEvent({
      type: "inquiry.replied",
      inquiryId,
      timestamp: new Date().toISOString(),
      payload: { responseTime: thread.messages.length },
    });

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Failed to ingest inbound reply";
    logFailure({
      timestamp: new Date().toISOString(),
      inquiryId,
      error: err,
      statusCode: 500,
      sender,
      subject: subject || null,
      retryable: isRetryableError(error instanceof Error ? error : new Error(err)),
    });
    return NextResponse.json(
      { ok: false, error: err },
      { status: 500 }
    );
  }
}
