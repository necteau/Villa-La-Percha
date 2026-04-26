import path from "path";
import {
  InquiryDraftStatus,
  InquiryMessageAuthorType,
  InquiryMessageDirection,
  InquiryStatus,
} from "@prisma/client";
import { getPrismaClient } from "@/lib/db";
import { canUseDatabaseSync, readJsonFallback, writeJsonFallback } from "@/lib/fallbackOrchestrator";

export interface InquiryRecord {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
  message?: string;
  status: "new" | "replied" | "approved" | "declined" | "converted";
  createdAt: string;
}

export interface InquiryMessageRecord {
  id: string;
  inquiryId: string;
  direction: "inbound" | "outbound";
  authorType: "guest" | "owner" | "assistant" | "system";
  subject?: string;
  body: string;
  emailMessageId?: string;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface InquiryDraftRecord {
  id: string;
  inquiryId: string;
  subject?: string;
  body: string;
  status: "draft" | "pending_owner_approval" | "approved" | "sent";
  createdByType: "assistant" | "owner" | "system";
  approvedAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryThreadRecord extends InquiryRecord {
  messages: InquiryMessageRecord[];
  drafts: InquiryDraftRecord[];
}

export interface InquiryInput {
  fullName: string;
  email: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
  message?: string;
}

export interface InquiryDraftInput {
  id?: string;
  inquiryId: string;
  subject?: string;
  body: string;
  status: InquiryDraftRecord["status"];
  createdByType?: InquiryDraftRecord["createdByType"];
}

export interface InquiryMessageInput {
  inquiryId: string;
  direction: InquiryMessageRecord["direction"];
  authorType: InquiryMessageRecord["authorType"];
  subject?: string;
  body: string;
  emailMessageId?: string;
  sentAt?: string;
  receivedAt?: string;
}

const FALLBACK_PATH = path.join(process.cwd(), "src/data/inquiries.json");
const THREAD_STATE_PATH = path.join(process.cwd(), "src/data/inquiry-thread-state.json");
const PROPERTY_SLUG = "villa-la-percha";

interface FallbackThreadState {
  messages: InquiryMessageRecord[];
  drafts: InquiryDraftRecord[];
}

function canUseDatabase(): boolean {
  return canUseDatabaseSync();
}

const DEFAULT_INQUIRIES: InquiryRecord[] = [];
const DEFAULT_THREAD_STATE: FallbackThreadState = { messages: [], drafts: [] };

async function readFallback(): Promise<InquiryRecord[]> {
  return readJsonFallback(FALLBACK_PATH, DEFAULT_INQUIRIES);
}

async function writeFallback(records: InquiryRecord[]) {
  await writeJsonFallback(FALLBACK_PATH, records);
}

async function readFallbackThreadState(): Promise<FallbackThreadState> {
  return readJsonFallback(THREAD_STATE_PATH, DEFAULT_THREAD_STATE);
}

async function writeFallbackThreadState(state: FallbackThreadState) {
  await writeJsonFallback(THREAD_STATE_PATH, state);
}

function fromDbStatus(status: InquiryStatus): InquiryRecord["status"] {
  return status.toLowerCase() as InquiryRecord["status"];
}

function toDbStatus(status: InquiryRecord["status"]): InquiryStatus {
  switch (status) {
    case "replied":
      return InquiryStatus.REPLIED;
    case "approved":
      return InquiryStatus.APPROVED;
    case "declined":
      return InquiryStatus.DECLINED;
    case "converted":
      return InquiryStatus.CONVERTED;
    case "new":
    default:
      return InquiryStatus.NEW;
  }
}

function fromDbDirection(value: InquiryMessageDirection): InquiryMessageRecord["direction"] {
  return value.toLowerCase() as InquiryMessageRecord["direction"];
}

function toDbDirection(value: InquiryMessageRecord["direction"]): InquiryMessageDirection {
  return value === "outbound" ? InquiryMessageDirection.OUTBOUND : InquiryMessageDirection.INBOUND;
}

function fromDbAuthorType(value: InquiryMessageAuthorType): InquiryMessageRecord["authorType"] {
  return value.toLowerCase() as InquiryMessageRecord["authorType"];
}

function toDbAuthorType(value: InquiryMessageRecord["authorType"] | InquiryDraftRecord["createdByType"]): InquiryMessageAuthorType {
  switch (value) {
    case "owner":
      return InquiryMessageAuthorType.OWNER;
    case "assistant":
      return InquiryMessageAuthorType.ASSISTANT;
    case "system":
      return InquiryMessageAuthorType.SYSTEM;
    case "guest":
    default:
      return InquiryMessageAuthorType.GUEST;
  }
}

function fromDbDraftStatus(value: InquiryDraftStatus): InquiryDraftRecord["status"] {
  return value.toLowerCase() as InquiryDraftRecord["status"];
}

function toDbDraftStatus(value: InquiryDraftRecord["status"]): InquiryDraftStatus {
  switch (value) {
    case "pending_owner_approval":
      return InquiryDraftStatus.PENDING_OWNER_APPROVAL;
    case "approved":
      return InquiryDraftStatus.APPROVED;
    case "sent":
      return InquiryDraftStatus.SENT;
    case "draft":
    default:
      return InquiryDraftStatus.DRAFT;
  }
}

function mapDbInquiry(record: {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  checkIn: Date | null;
  checkOut: Date | null;
  message: string | null;
  status: InquiryStatus;
  createdAt: Date;
}): InquiryRecord {
  return {
    id: record.id,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone ?? undefined,
    checkIn: record.checkIn?.toISOString().slice(0, 10),
    checkOut: record.checkOut?.toISOString().slice(0, 10),
    message: record.message ?? undefined,
    status: fromDbStatus(record.status),
    createdAt: record.createdAt.toISOString(),
  };
}

function mapDbMessage(record: {
  id: string;
  inquiryId: string;
  direction: InquiryMessageDirection;
  authorType: InquiryMessageAuthorType;
  subject: string | null;
  body: string;
  emailMessageId: string | null;
  sentAt: Date | null;
  receivedAt: Date | null;
  createdAt: Date;
}): InquiryMessageRecord {
  return {
    id: record.id,
    inquiryId: record.inquiryId,
    direction: fromDbDirection(record.direction),
    authorType: fromDbAuthorType(record.authorType),
    subject: record.subject ?? undefined,
    body: record.body,
    emailMessageId: record.emailMessageId ?? undefined,
    sentAt: record.sentAt?.toISOString(),
    receivedAt: record.receivedAt?.toISOString(),
    createdAt: record.createdAt.toISOString(),
  };
}

function mapDbDraft(record: {
  id: string;
  inquiryId: string;
  subject: string | null;
  body: string;
  status: InquiryDraftStatus;
  createdByType: InquiryMessageAuthorType;
  approvedAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): InquiryDraftRecord {
  return {
    id: record.id,
    inquiryId: record.inquiryId,
    subject: record.subject ?? undefined,
    body: record.body,
    status: fromDbDraftStatus(record.status),
    createdByType: fromDbAuthorType(record.createdByType) as InquiryDraftRecord["createdByType"],
    approvedAt: record.approvedAt?.toISOString(),
    sentAt: record.sentAt?.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function syntheticInitialMessage(inquiry: InquiryRecord): InquiryMessageRecord[] {
  if (!inquiry.message) return [];
  return [{
    id: `initial-${inquiry.id}`,
    inquiryId: inquiry.id,
    direction: "inbound",
    authorType: "guest",
    subject: `Inquiry from ${inquiry.fullName}`,
    body: inquiry.message,
    receivedAt: inquiry.createdAt,
    createdAt: inquiry.createdAt,
  }];
}

async function getPropertyId(): Promise<string | null> {
  const prisma = await getPrismaClient();
  const property = await prisma.property.findUnique({ where: { slug: PROPERTY_SLUG } });
  return property?.id ?? null;
}

async function readFallbackThreads(): Promise<InquiryThreadRecord[]> {
  const [inquiries, threadState] = await Promise.all([readFallback(), readFallbackThreadState()]);
  return inquiries.map((inquiry) => {
    const messages = threadState.messages.filter((message) => message.inquiryId === inquiry.id);
    return {
      ...inquiry,
      messages: messages.length ? messages : syntheticInitialMessage(inquiry),
      drafts: threadState.drafts.filter((draft) => draft.inquiryId === inquiry.id),
    };
  });
}

export async function listInquiries(): Promise<InquiryRecord[]> {
  if (!canUseDatabase()) return readFallback();

  try {
    const prisma = await getPrismaClient();
    const propertyId = await getPropertyId();
    if (!propertyId) return readFallback();

    const records = await prisma.inquiry.findMany({ where: { propertyId }, orderBy: { createdAt: "desc" } });
    return records.length === 0 ? readFallback() : records.map(mapDbInquiry);
  } catch {
    return readFallback();
  }
}

export async function listInquiryThreads(): Promise<InquiryThreadRecord[]> {
  if (!canUseDatabase()) return readFallbackThreads();

  try {
    const prisma = await getPrismaClient();
    const propertyId = await getPropertyId();
    if (!propertyId) return readFallbackThreads();

    const inquiries = await prisma.inquiry.findMany({
      where: { propertyId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        drafts: { orderBy: { updatedAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return inquiries.map((inquiry) => {
      const base = mapDbInquiry(inquiry);
      const messages = inquiry.messages.map(mapDbMessage);
      return {
        ...base,
        messages: messages.length ? messages : syntheticInitialMessage(base),
        drafts: inquiry.drafts.map(mapDbDraft),
      };
    });
  } catch {
    return readFallbackThreads();
  }
}

export async function getInquiryThreadById(id: string): Promise<InquiryThreadRecord | null> {
  const threads = await listInquiryThreads();
  return threads.find((thread) => thread.id === id) || null;
}

export async function updateInquiryStatus(id: string, status: InquiryRecord["status"]): Promise<InquiryRecord | null> {
  if (!canUseDatabase()) {
    const current = await readFallback();
    const existing = current.find((inquiry) => inquiry.id === id);
    if (!existing) return null;
    const updated = { ...existing, status };
    await writeFallback(current.map((inquiry) => (inquiry.id === id ? updated : inquiry)));
    return updated;
  }

  try {
    const prisma = await getPrismaClient();
    const updated = await prisma.inquiry.update({ where: { id }, data: { status: toDbStatus(status) } });
    return mapDbInquiry(updated);
  } catch {
    const current = await readFallback();
    const existing = current.find((inquiry) => inquiry.id === id);
    if (!existing) return null;
    const updated = { ...existing, status };
    await writeFallback(current.map((inquiry) => (inquiry.id === id ? updated : inquiry)));
    return updated;
  }
}

export async function appendInquiryMessage(input: InquiryMessageInput): Promise<InquiryMessageRecord> {
  const base: InquiryMessageRecord = {
    id: `msg-${Date.now()}`,
    inquiryId: input.inquiryId,
    direction: input.direction,
    authorType: input.authorType,
    subject: input.subject,
    body: input.body,
    emailMessageId: input.emailMessageId,
    sentAt: input.sentAt,
    receivedAt: input.receivedAt,
    createdAt: new Date().toISOString(),
  };

  if (!canUseDatabase()) {
    const state = await readFallbackThreadState();
    const deduped = base.emailMessageId ? state.messages.filter((m) => m.emailMessageId !== base.emailMessageId) : state.messages;
    await writeFallbackThreadState({ ...state, messages: [...deduped, base] });
    if (input.direction === "inbound") await updateInquiryStatus(input.inquiryId, "new");
    if (input.direction === "outbound") await updateInquiryStatus(input.inquiryId, "replied");
    return base;
  }

  const prisma = await getPrismaClient();
  const created = await prisma.inquiryMessage.create({
    data: {
      inquiryId: input.inquiryId,
      direction: toDbDirection(input.direction),
      authorType: toDbAuthorType(input.authorType),
      subject: input.subject ?? null,
      body: input.body,
      emailMessageId: input.emailMessageId ?? null,
      sentAt: input.sentAt ? new Date(input.sentAt) : null,
      receivedAt: input.receivedAt ? new Date(input.receivedAt) : null,
    },
  });

  await prisma.inquiry.update({
    where: { id: input.inquiryId },
    data: { status: toDbStatus(input.direction === "inbound" ? "new" : "replied") },
  });

  return mapDbMessage(created);
}

export async function saveInquiryDraft(input: InquiryDraftInput): Promise<InquiryDraftRecord> {
  const baseDraft: InquiryDraftRecord = {
    id: input.id || `draft-${Date.now()}`,
    inquiryId: input.inquiryId,
    subject: input.subject,
    body: input.body,
    status: input.status,
    createdByType: input.createdByType || "assistant",
    approvedAt: input.status === "approved" ? new Date().toISOString() : undefined,
    sentAt: input.status === "sent" ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!canUseDatabase()) {
    const state = await readFallbackThreadState();
    const existing = input.id ? state.drafts.find((draft) => draft.id === input.id) : undefined;
    const nextDraft = { ...(existing || baseDraft), ...baseDraft, createdAt: existing?.createdAt || baseDraft.createdAt };
    await writeFallbackThreadState({ ...state, drafts: [nextDraft, ...state.drafts.filter((draft) => draft.id !== nextDraft.id)] });
    return nextDraft;
  }

  const prisma = await getPrismaClient();
  if (input.id) {
    const updated = await prisma.inquiryReplyDraft.update({
      where: { id: input.id },
      data: {
        subject: input.subject ?? null,
        body: input.body,
        status: toDbDraftStatus(input.status),
        createdByType: toDbAuthorType(input.createdByType || "assistant"),
        approvedAt: input.status === "approved" ? new Date() : undefined,
        sentAt: input.status === "sent" ? new Date() : undefined,
      },
    });
    return mapDbDraft(updated);
  }

  const created = await prisma.inquiryReplyDraft.create({
    data: {
      inquiryId: input.inquiryId,
      subject: input.subject ?? null,
      body: input.body,
      status: toDbDraftStatus(input.status),
      createdByType: toDbAuthorType(input.createdByType || "assistant"),
      approvedAt: input.status === "approved" ? new Date() : null,
      sentAt: input.status === "sent" ? new Date() : null,
    },
  });
  return mapDbDraft(created);
}

export async function markDraftSent(id: string): Promise<InquiryDraftRecord | null> {
  if (!canUseDatabase()) {
    const state = await readFallbackThreadState();
    const existing = state.drafts.find((draft) => draft.id === id);
    if (!existing) return null;
    const updated = { ...existing, status: "sent" as const, sentAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    await writeFallbackThreadState({ ...state, drafts: [updated, ...state.drafts.filter((draft) => draft.id !== id)] });
    return updated;
  }

  const prisma = await getPrismaClient();
  const updated = await prisma.inquiryReplyDraft.update({
    where: { id },
    data: { status: InquiryDraftStatus.SENT, sentAt: new Date() },
  });
  return mapDbDraft(updated);
}

export async function createInquiry(input: InquiryInput): Promise<InquiryRecord> {
  const base: InquiryRecord = {
    id: String(Date.now()),
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    message: input.message,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  if (!canUseDatabase()) {
    const current = await readFallback();
    await writeFallback([base, ...current]);
    if (input.message) {
      await appendInquiryMessage({
        inquiryId: base.id,
        direction: "inbound",
        authorType: "guest",
        subject: `Inquiry from ${base.fullName}`,
        body: input.message,
        receivedAt: base.createdAt,
      });
    }
    return base;
  }

  try {
    const prisma = await getPrismaClient();
    const propertyId = await getPropertyId();
    if (!propertyId) throw new Error("Missing property");
    const created = await prisma.inquiry.create({
      data: {
        propertyId,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        checkIn: input.checkIn ? new Date(input.checkIn) : null,
        checkOut: input.checkOut ? new Date(input.checkOut) : null,
        message: input.message,
      },
    });
    if (input.message) {
      await appendInquiryMessage({
        inquiryId: created.id,
        direction: "inbound",
        authorType: "guest",
        subject: `Inquiry from ${input.fullName}`,
        body: input.message,
        receivedAt: created.createdAt.toISOString(),
      });
    }
    return mapDbInquiry(created);
  } catch {
    const current = await readFallback();
    await writeFallback([base, ...current]);
    return base;
  }
}
