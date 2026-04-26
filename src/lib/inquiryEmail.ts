import { Resend } from "resend";
import {
  appendInquiryMessage,
  getInquiryThreadById,
  markDraftSent,
  saveInquiryDraft,
  updateInquiryStatus,
} from "@/lib/inquiries";
import { trackInquiryResponse } from "@/lib/analytics";
import { buildInquiryEmailSubject } from "@/lib/inquirySubject";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || "Villa La Percha <onboarding@resend.dev>";
}

function subjectWithToken(subject: string, inquiryId: string): string {
  const token = `[DirectStay Inquiry ${inquiryId}]`;
  return subject.includes(token) ? subject : `${subject} ${token}`;
}

export function extractInquiryIdFromSubject(subject: string | null | undefined): string | null {
  if (!subject) return null;
  const match = subject.match(/\[DirectStay Inquiry ([^\]]+)\]/i);
  return match?.[1] || null;
}

export async function sendApprovedInquiryDraft(inquiryId: string, draftId: string) {
  const thread = await getInquiryThreadById(inquiryId);
  if (!thread) throw new Error("Inquiry not found");

  const draft = thread.drafts.find((item) => item.id === draftId);
  if (!draft) throw new Error("Draft not found");
  if (draft.status !== "approved") throw new Error("Draft must be approved before sending");

  const resend = getResendClient();
  const subject = subjectWithToken(draft.subject || buildInquiryEmailSubject(thread), thread.id);
  const result = await resend.emails.send({
    from: getFromAddress(),
    to: [thread.email],
    subject,
    text: draft.body,
    replyTo: process.env.INQUIRY_REPLY_TO_EMAIL || undefined,
    headers: {
      "X-DirectStay-Inquiry-Id": thread.id,
      "X-DirectStay-Draft-Id": draft.id,
    },
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  await appendInquiryMessage({
    inquiryId: thread.id,
    direction: "outbound",
    authorType: draft.createdByType === "owner" ? "owner" : "assistant",
    subject,
    body: draft.body,
    emailMessageId: result.data?.id || undefined,
    sentAt: new Date().toISOString(),
  });
  await markDraftSent(draft.id);
  await saveInquiryDraft({
    id: draft.id,
    inquiryId: draft.inquiryId,
    subject: draft.subject,
    body: draft.body,
    status: "sent",
    createdByType: draft.createdByType,
  });
  await updateInquiryStatus(thread.id, "replied");

  const firstInbound = thread.messages.find((message) => message.direction === "inbound");
  if (firstInbound) {
    const inboundAt = new Date(firstInbound.receivedAt || firstInbound.createdAt).getTime();
    const outboundAt = Date.now();
    if (Number.isFinite(inboundAt) && outboundAt >= inboundAt) {
      const responseHours = (outboundAt - inboundAt) / (1000 * 60 * 60);
      void trackInquiryResponse(thread.id, responseHours, thread.drafts.length + 1).catch(() => {});
    }
  }

  return { emailId: result.data?.id || null };
}
