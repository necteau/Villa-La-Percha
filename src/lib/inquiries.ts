import { promises as fs } from "fs";
import path from "path";
import {
  InquiryDraftStatus,
  InquiryMessageAuthorType,
  InquiryMessageDirection,
  InquiryStatus,
} from "@prisma/client";
import { getPrismaClient } from "@/lib/db";

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

const FALLBACK_PATH = path.join(process.cwd(), "src/data/inquiries.json");
const THREAD_STATE_PATH = path.join(process.cwd(), "src/data/inquiry-thread-state.json");
const PROPERTY_SLUG = "villa-la-percha";

interface FallbackThreadState {
  messages: InquiryMessageRecord[];
  drafts: InquiryDraftRecord[];
}

function canUseDatabase(): boolean {
  const url = process.env.DATABASE_URL;
  return !!url && !url.includes("USER:PASSWORD@HOST");
}

async function readFallback(): Promise<InquiryRecord[]> {
  const raw = await fs.readFile(FALLBACK_PATH, "utf8");
  return JSON.parse(raw) as InquiryRecord[];
}

async function writeFallback(records: InquiryRecord[]) {
  await fs.writeFile(FALLBACK_PATH, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

async function readFallbackThreadState(): Promise<FallbackThreadState> {
  const raw = await fs.readFile(THREAD_STATE_PATH, "utf8");
  return JSON.parse(raw) as FallbackThreadState;
}

async function writeFallbackThreadState(state: FallbackThreadState) {
  await fs.writeFile(THREAD_STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, "utf8");
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
  return [
    {
      id: `initial-${inquiry.id}`,
      inquiryId: inquiry.id,
      direction: "inbound",
      authorType: "guest",
      subject: `Inquiry from ${inquiry.fullName}`,
      body: inquiry.message,
      receivedAt: inquiry.createdAt,
      createdAt: inquiry.createdAt,
    },
  ];
}

async function getPropertyId(): Promise<string | null> {
  const prisma = await getPrismaClient();
  const property = await prisma.property.findUnique({ where: { slug: PROPERTY_SLUG } });
  return property?.id ?? null;
}

export async function listInquiries(): Promise<InquiryRecord[]> {
  if (!canUseDatabase()) {
    return readFallback();
  }

  try {
    const prisma = await getPrismaClient();
    const propertyId = await getPropertyId();
    if (!propertyId) return readFallback();

    const records = await prisma.inquiry.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
    });

    if (records.length === 0) {
      return readFallback();
    }

    return records.map(mapDbInquiry);
  } catch {
    return readFallback();
  }
}

export async function listInquiryThreads(): Promise<InquiryThreadRecord[]> {
  if (!canUseDatabase()) {
    const [inquiries, threadState] = await Promise.all([readFallback(), readFallbackThreadState()]);
    return inquiries.map((inquiry) => {
      const messages = threadState.messages.filter((message) => message.inquiryId === inquiry.id);
      const drafts = threadState.drafts.filter((draft) => draft.inquiryId === inquiry.id);
      return {
        ...inquiry,
        messages: messages.length ? messages : syntheticInitialMessage(inquiry),
        drafts,
      };
    });
  }

  try {
    const prisma = await getPrismaClient();
    const propertyId = await getPropertyId();
    if (!propertyId) {
      const [inquiries, threadState] = await Promise.all([readFallback(), readFallbackThreadState()]);
      return inquiries.map((inquiry) => ({
        ...inquiry,
        messages: threadState.messages.filter((message) => message.inquiryId === inquiry.id),
        drafts: threadState.drafts.filter((draft) => draft.inquiryId === inquiry.id),
      }));
    }

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
      const drafts = inquiry.drafts.map(mapDbDraft);
      return {
        ...base,
        messages: messages.length ? messages : syntheticInitialMessage(base),
        drafts,
      };
    });
  } catch {
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
    const nextDraft = {
      ...(existing || baseDraft),
      ...baseDraft,
      createdAt: existing?.createdAt || baseDraft.createdAt,
    };
    const remaining = state.drafts.filter((draft) => draft.id !== nextDraft.id);
    await writeFallbackThreadState({ ...state, drafts: [nextDraft, ...remaining] });
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
    const threadState = await readFallbackThreadState();
    const messages = input.message
      ? [
          {
            id: `msg-${base.id}`,
            inquiryId: base.id,
            direction: "inbound" as const,
            authorType: "guest" as const,
            subject: `Inquiry from ${base.fullName}`,
            body: input.message,
            receivedAt: base.createdAt,
            createdAt: base.createdAt,
          },
          ...threadState.messages,
        ]
      : threadState.messages;
    await writeFallback([base, ...current]);
    await writeFallbackThreadState({ ...threadState, messages });
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
        messages: input.message
          ? {
              create: {
                direction: InquiryMessageDirection.INBOUND,
                authorType: InquiryMessageAuthorType.GUEST,
                subject: `Inquiry from ${input.fullName}`,
                body: input.message,
                receivedAt: new Date(),
              },
            }
          : undefined,
      },
    });
    return mapDbInquiry(created);
  } catch {
    const current = await readFallback();
    await writeFallback([base, ...current]);
    return base;
  }
}
