import { InquiryDraftStatus, InquiryMessageAuthorType, InquiryMessageDirection, ReservationEmailJobStatus, ReservationEmailTemplateKind, ReservationStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/db";
import { appendInquiryMessage, markDraftSent, saveInquiryDraft, updateInquiryStatus, type InquiryDraftRecord } from "@/lib/inquiries";
import { Resend } from "resend";
import { canUseDatabaseSync } from "@/lib/fallbackOrchestrator";

export type ReservationEmailKind = "final_payment_reminder" | "upcoming_trip_details" | "check_in_instructions" | "post_stay_thank_you";
export type ReservationEmailStatus = "pending_approval" | "approved" | "sent" | "cancelled" | "failed";

export interface ReservationTimelineMessage {
  id: string;
  inquiryId?: string;
  direction: "inbound" | "outbound";
  authorType: "guest" | "owner" | "assistant" | "system";
  subject?: string;
  body: string;
  emailMessageId?: string;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface ReservationEmailJobRecord {
  id: string;
  reservationId: string;
  templateId?: string;
  kind: ReservationEmailKind;
  status: ReservationEmailStatus;
  scheduledFor: string;
  subject: string;
  body: string;
  sentAt?: string;
  emailMessageId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationCommunicationSummary {
  needsReply: boolean;
  needsReplyAt?: string;
  lastGuestMessageAt?: string;
  lastGuestMessageId?: string;
  messages: ReservationTimelineMessage[];
  emailJobs: ReservationEmailJobRecord[];
  drafts: InquiryDraftRecord[];
}

function toDbKind(kind: ReservationEmailKind): ReservationEmailTemplateKind {
  switch (kind) {
    case "upcoming_trip_details": return ReservationEmailTemplateKind.UPCOMING_TRIP_DETAILS;
    case "check_in_instructions": return ReservationEmailTemplateKind.CHECK_IN_INSTRUCTIONS;
    case "post_stay_thank_you": return ReservationEmailTemplateKind.POST_STAY_THANK_YOU;
    case "final_payment_reminder":
    default: return ReservationEmailTemplateKind.FINAL_PAYMENT_REMINDER;
  }
}

function fromDbKind(kind: ReservationEmailTemplateKind): ReservationEmailKind {
  return kind.toLowerCase() as ReservationEmailKind;
}

function fromDbStatus(status: ReservationEmailJobStatus): ReservationEmailStatus {
  return status.toLowerCase() as ReservationEmailStatus;
}

interface DbMessageLike {
  id: string;
  inquiryId: string;
  direction: string;
  authorType: string;
  subject: string | null;
  body: string;
  emailMessageId: string | null;
  sentAt: Date | null;
  receivedAt: Date | null;
  createdAt: Date;
}

interface DbEmailJobLike {
  id: string;
  reservationId: string;
  templateId: string | null;
  kind: ReservationEmailTemplateKind;
  status: ReservationEmailJobStatus;
  scheduledFor: Date;
  subject: string;
  body: string;
  sentAt: Date | null;
  emailMessageId: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapMessage(message: DbMessageLike): ReservationTimelineMessage {
  return {
    id: message.id,
    inquiryId: message.inquiryId ?? undefined,
    direction: String(message.direction).toLowerCase() as ReservationTimelineMessage["direction"],
    authorType: String(message.authorType).toLowerCase() as ReservationTimelineMessage["authorType"],
    subject: message.subject ?? undefined,
    body: message.body,
    emailMessageId: message.emailMessageId ?? undefined,
    sentAt: message.sentAt?.toISOString(),
    receivedAt: message.receivedAt?.toISOString(),
    createdAt: message.createdAt.toISOString(),
  };
}

function mapEmailJob(job: DbEmailJobLike): ReservationEmailJobRecord {
  return {
    id: job.id,
    reservationId: job.reservationId,
    templateId: job.templateId ?? undefined,
    kind: fromDbKind(job.kind),
    status: fromDbStatus(job.status),
    scheduledFor: job.scheduledFor.toISOString(),
    subject: job.subject,
    body: job.body,
    sentAt: job.sentAt?.toISOString(),
    emailMessageId: job.emailMessageId ?? undefined,
    errorMessage: job.errorMessage ?? undefined,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

export async function findActiveReservationForInquiry(inquiryId: string): Promise<{ id: string } | null> {
  if (!canUseDatabaseSync()) return null;
  const prisma = await getPrismaClient();
  return prisma.reservation.findFirst({
    where: { sourceInquiryId: inquiryId, status: { not: ReservationStatus.CANCELLED } },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function markReservationNeedsReply(reservationId: string, messageId: string, receivedAtIso?: string) {
  if (!canUseDatabaseSync()) return;
  const prisma = await getPrismaClient();
  const receivedAt = receivedAtIso ? new Date(receivedAtIso) : new Date();
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { needsReplyAt: receivedAt, lastGuestMessageAt: receivedAt, lastGuestMessageId: messageId },
  });
}

export async function clearReservationNeedsReply(reservationId: string) {
  if (!canUseDatabaseSync()) return;
  const prisma = await getPrismaClient();
  await prisma.reservation.update({ where: { id: reservationId }, data: { needsReplyAt: null } });
}

export async function getReservationCommunicationSummary(reservationId: string): Promise<ReservationCommunicationSummary> {
  if (!canUseDatabaseSync()) return { needsReply: false, messages: [], emailJobs: [], drafts: [] };
  const prisma = await getPrismaClient();
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      emailJobs: { orderBy: [{ scheduledFor: "asc" }, { createdAt: "asc" }] },
      sourceInquiry: { include: { drafts: { orderBy: { updatedAt: "desc" } } } },
    },
  });
  if (!reservation) throw new Error("Reservation not found");
  return {
    needsReply: Boolean(reservation.needsReplyAt),
    needsReplyAt: reservation.needsReplyAt?.toISOString(),
    lastGuestMessageAt: reservation.lastGuestMessageAt?.toISOString(),
    lastGuestMessageId: reservation.lastGuestMessageId ?? undefined,
    messages: reservation.messages.map(mapMessage),
    emailJobs: reservation.emailJobs.map(mapEmailJob),
    drafts: (reservation.sourceInquiry?.drafts || []).filter((draft) => draft.createdByType !== InquiryMessageAuthorType.SYSTEM).map((draft) => ({
      id: draft.id,
      inquiryId: draft.inquiryId,
      subject: draft.subject ?? undefined,
      body: draft.body,
      status: String(draft.status).toLowerCase() as InquiryDraftRecord["status"],
      createdByType: String(draft.createdByType).toLowerCase() as InquiryDraftRecord["createdByType"],
      approvedAt: draft.approvedAt?.toISOString(),
      sentAt: draft.sentAt?.toISOString(),
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
    })),
  };
}

function renderTemplate(template: string, reservation: { guestName: string | null; checkIn: Date; checkOut: Date; totalAmount: unknown; amountReceived: unknown; property?: { name: string } | null }): string {
  const values: Record<string, string> = {
    guestName: reservation.guestName || "there",
    checkIn: reservation.checkIn.toISOString().slice(0, 10),
    checkOut: reservation.checkOut.toISOString().slice(0, 10),
    propertyName: reservation.property?.name || "Villa La Percha",
    balanceDue: reservation.totalAmount && reservation.amountReceived ? `$${Math.max(0, Number(reservation.totalAmount) - Number(reservation.amountReceived)).toLocaleString()}` : "the remaining balance",
  };
  return template.replace(/\{\{\s*(guestName|checkIn|checkOut|propertyName|balanceDue)\s*\}\}/g, (_, key) => values[key] || "");
}

const DEFAULT_TEMPLATES: Record<ReservationEmailKind, { subject: string; body: string; offsetDays: number }> = {
  final_payment_reminder: {
    subject: "Final payment reminder for {{propertyName}}",
    body: "Hi {{guestName}},\n\nA quick reminder that the final balance for your {{propertyName}} stay from {{checkIn}} to {{checkOut}} is coming due. Current balance: {{balanceDue}}.\n\nPlease reply with any questions before we send payment instructions.\n\nWarmly,\nVilla La Percha",
    offsetDays: -30,
  },
  upcoming_trip_details: {
    subject: "Getting ready for your {{propertyName}} stay",
    body: "Hi {{guestName}},\n\nYour {{propertyName}} stay is coming up: {{checkIn}} to {{checkOut}}. We will use this thread for arrival details, island tips, and any final questions.\n\nWarmly,\nVilla La Percha",
    offsetDays: -14,
  },
  check_in_instructions: {
    subject: "Check-in details for {{propertyName}}",
    body: "Hi {{guestName}},\n\nHere are the check-in details for your {{propertyName}} stay beginning {{checkIn}}. Please review and reply if anything looks unclear.\n\nWarmly,\nVilla La Percha",
    offsetDays: -3,
  },
  post_stay_thank_you: {
    subject: "Thank you for staying at {{propertyName}}",
    body: "Hi {{guestName}},\n\nThank you again for staying at {{propertyName}}. We hope the trip was wonderful and would love to welcome you back.\n\nWarmly,\nVilla La Percha",
    offsetDays: 2,
  },
};

export async function ensureReservationEmailJobs(reservationId: string): Promise<ReservationEmailJobRecord[]> {
  if (!canUseDatabaseSync()) return [];
  const prisma = await getPrismaClient();
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId }, include: { property: true } });
  if (!reservation) throw new Error("Reservation not found");

  for (const [kind, defaults] of Object.entries(DEFAULT_TEMPLATES) as Array<[ReservationEmailKind, typeof DEFAULT_TEMPLATES[ReservationEmailKind]]>) {
    const dbKind = toDbKind(kind);
    const scheduledFor = new Date(reservation.checkIn);
    scheduledFor.setUTCDate(scheduledFor.getUTCDate() + defaults.offsetDays);
    const template = await prisma.reservationEmailTemplate.upsert({
      where: { propertyId_kind: { propertyId: reservation.propertyId, kind: dbKind } },
      update: {},
      create: { propertyId: reservation.propertyId, kind: dbKind, subject: defaults.subject, body: defaults.body },
    });
    await prisma.reservationEmailJob.upsert({
      where: { reservationId_kind: { reservationId, kind: dbKind } },
      update: { templateId: template.id, scheduledFor, subject: renderTemplate(template.subject, reservation), body: renderTemplate(template.body, reservation) },
      create: { reservationId, templateId: template.id, kind: dbKind, scheduledFor, subject: renderTemplate(template.subject, reservation), body: renderTemplate(template.body, reservation) },
    });
  }

  const summary = await getReservationCommunicationSummary(reservationId);
  return summary.emailJobs;
}

export async function markReservationEmailJobStatus(reservationId: string, jobId: string, status: ReservationEmailStatus): Promise<ReservationEmailJobRecord> {
  if (!canUseDatabaseSync()) throw new Error("Reservation email jobs require database mode.");
  const prisma = await getPrismaClient();
  const dbStatus = status.toUpperCase() as ReservationEmailJobStatus;
  const job = await prisma.reservationEmailJob.update({
    where: { id: jobId, reservationId },
    data: { status: dbStatus, sentAt: status === "sent" ? new Date() : undefined },
  });
  if (status === "sent") {
    await prisma.reservation.update({ where: { id: reservationId }, data: { needsReplyAt: null } }).catch(() => {});
    await prisma.inquiryMessage.createMany({
      data: [{
        inquiryId: (await prisma.reservation.findUnique({ where: { id: reservationId }, select: { sourceInquiryId: true } }))?.sourceInquiryId || "",
        reservationId,
        direction: InquiryMessageDirection.OUTBOUND,
        authorType: InquiryMessageAuthorType.OWNER,
        subject: job.subject,
        body: job.body,
        sentAt: new Date(),
      }],
      skipDuplicates: true,
    }).catch(() => {});
  }
  return mapEmailJob(job);
}


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

async function getReservationForReply(reservationId: string) {
  if (!canUseDatabaseSync()) throw new Error("Reservation replies require database mode.");
  const prisma = await getPrismaClient();
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId }, include: { sourceInquiry: true } });
  if (!reservation) throw new Error("Reservation not found");
  if (!reservation.sourceInquiryId || !reservation.sourceInquiry) throw new Error("Reservation guest replies currently require a source inquiry thread for email reply routing.");
  if (!reservation.guestEmail && !reservation.sourceInquiry.email) throw new Error("Reservation has no guest email address.");
  return reservation;
}

export async function saveReservationReplyDraft(input: { reservationId: string; draftId?: string; subject?: string; body: string; status?: InquiryDraftRecord["status"]; createdByType?: InquiryDraftRecord["createdByType"] }): Promise<InquiryDraftRecord> {
  const reservation = await getReservationForReply(input.reservationId);
  return saveInquiryDraft({
    id: input.draftId,
    inquiryId: reservation.sourceInquiryId!,
    subject: input.subject,
    body: input.body,
    status: input.status || "draft",
    createdByType: input.createdByType || "owner",
  });
}

export async function sendApprovedReservationReplyDraft(reservationId: string, draftId: string) {
  const reservation = await getReservationForReply(reservationId);
  const prisma = await getPrismaClient();
  const draft = await prisma.inquiryReplyDraft.findFirst({ where: { id: draftId, inquiryId: reservation.sourceInquiryId! } });
  if (!draft) throw new Error("Draft not found");
  if (draft.status !== InquiryDraftStatus.APPROVED) throw new Error("Draft must be approved before sending");
  const to = reservation.guestEmail || reservation.sourceInquiry!.email;
  const subject = subjectWithToken(draft.subject || `Re: Your Villa La Percha stay`, reservation.sourceInquiryId!);
  const result = await getResendClient().emails.send({
    from: getFromAddress(),
    to: [to],
    subject,
    text: draft.body,
    replyTo: process.env.INQUIRY_REPLY_TO_EMAIL || undefined,
    headers: {
      "X-DirectStay-Inquiry-Id": reservation.sourceInquiryId!,
      "X-DirectStay-Reservation-Id": reservation.id,
      "X-DirectStay-Draft-Id": draft.id,
    },
  });
  if (result.error) throw new Error(result.error.message);
  await appendInquiryMessage({
    inquiryId: reservation.sourceInquiryId!,
    reservationId: reservation.id,
    direction: "outbound",
    authorType: draft.createdByType === InquiryMessageAuthorType.OWNER ? "owner" : "assistant",
    subject,
    body: draft.body,
    emailMessageId: result.data?.id || undefined,
    sentAt: new Date().toISOString(),
  });
  await markDraftSent(draft.id);
  await saveInquiryDraft({ id: draft.id, inquiryId: draft.inquiryId, subject: draft.subject ?? undefined, body: draft.body, status: "sent", createdByType: String(draft.createdByType).toLowerCase() as InquiryDraftRecord["createdByType"] });
  await clearReservationNeedsReply(reservation.id);
  await updateInquiryStatus(reservation.sourceInquiryId!, "booked");
  return { emailId: result.data?.id || null };
}
