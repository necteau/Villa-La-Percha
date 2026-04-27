import path from "path";
import {
  InquiryDraftStatus,
  InquiryMessageAuthorType,
  InquiryMessageDirection,
  InquiryStatus,
} from "@prisma/client";
import { findOrCreateCustomerLink } from "@/lib/customers";
import { getPrismaClient } from "@/lib/db";
import { canUseDatabaseSync, readJsonFallback, writeJsonFallback } from "@/lib/fallbackOrchestrator";

export interface InquiryRecord {
  id: string;
  customerId?: string;
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

interface InquiryEnrichmentPatch {
  phone?: string;
  preferredContactMethod?: string;
  email?: string;
  checkIn?: string;
  checkOut?: string;
  guestCount?: number;
  locationLabel?: string;
  preferencesSummary?: string;
  householdSummary?: string;
  conciergeInterests?: string;
  notes?: string;
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

function normalizePhone(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const plus = trimmed.startsWith("+") ? "+" : "";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10) return undefined;
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${plus}${digits}`;
}

function extractPhoneFromText(text: string): string | undefined {
  const matches = text.match(/(?:\+?1[\s.\-]?)?(?:\(?\d{3}\)?[\s.\-]?){2}\d{4}/g) || [];
  for (const match of matches) {
    const normalized = normalizePhone(match);
    if (normalized) return normalized;
  }
  return undefined;
}

function inferPreferredContactMethod(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/(text|sms|whatsapp|call|phone me|reach me on my phone)/.test(lower)) {
    if (/(text|sms|whatsapp)/.test(lower)) return "text";
    if (/(call|phone me|reach me on my phone)/.test(lower)) return "call";
    return "phone";
  }
  if (/(email me|reply by email)/.test(lower)) return "email";
  return undefined;
}

function normalizeEmail(value?: string | null): string | undefined {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

function extractEmailFromText(text: string): string | undefined {
  const matches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  return matches.map(normalizeEmail).find(Boolean);
}

function parseDateCandidate(value: string, referenceYear = new Date().getFullYear()): string | undefined {
  const trimmed = value.trim().replace(/(\d)(st|nd|rd|th)\b/gi, "$1");
  const numeric = trimmed.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (numeric) {
    const month = Number(numeric[1]);
    const day = Number(numeric[2]);
    const year = numeric[3] ? Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3]) : referenceYear;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) return date.toISOString().slice(0, 10);
  }
  const parsed = Date.parse(`${trimmed} ${/\b\d{4}\b/.test(trimmed) ? "" : referenceYear}`.trim());
  if (Number.isFinite(parsed)) return new Date(parsed).toISOString().slice(0, 10);
  return undefined;
}

function extractDateRange(text: string): Pick<InquiryEnrichmentPatch, "checkIn" | "checkOut"> {
  const range = text.match(/(?:from|arriv(?:e|ing)|check(?:ing)?\s*in)?\s*([A-Z][a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)\s*(?:to|through|thru|until|-|–|—)\s*(?:depart(?:ing)?|leav(?:e|ing)|check(?:ing)?\s*out)?\s*([A-Z][a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i);
  if (range) return { checkIn: parseDateCandidate(range[1]), checkOut: parseDateCandidate(range[2]) };
  const checkIn = text.match(/(?:check(?:ing)?\s*in|arriv(?:e|ing|al)|from)\s*:?[\s-]*([A-Z][a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i);
  const checkOut = text.match(/(?:check(?:ing)?\s*out|depart(?:ure|ing)?|leav(?:e|ing)|to)\s*:?[\s-]*([A-Z][a-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i);
  return { checkIn: checkIn ? parseDateCandidate(checkIn[1]) : undefined, checkOut: checkOut ? parseDateCandidate(checkOut[1]) : undefined };
}

function extractGuestCount(text: string): number | undefined {
  const match = text.match(/\b(\d{1,2})\s*(?:guests?|people|adults?|travelers?|travellers?)\b/i) || text.match(/\bparty of\s*(\d{1,2})\b/i);
  if (!match) return undefined;
  const count = Number(match[1]);
  return count > 0 && count < 40 ? count : undefined;
}

function extractSegment(text: string, patterns: RegExp[]): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = match?.[1]?.trim().replace(/\s+/g, " ").replace(/[.\n]+$/, "");
    if (value && value.length >= 3 && value.length <= 240) return value;
  }
  return undefined;
}

function buildInboundNotes(text: string, patch: InquiryEnrichmentPatch): string | undefined {
  const lines = [
    patch.guestCount ? `Guest count mentioned: ${patch.guestCount}` : null,
    patch.checkIn || patch.checkOut ? `Dates mentioned: ${patch.checkIn || "?"} to ${patch.checkOut || "?"}` : null,
    /\b(urgent|asap|soon|today|tonight|this week|ready to book|book now)\b/i.test(text) ? "Booking urgency/intent mentioned." : null,
    /\b(price|pricing|rate|discount|deal|budget|expensive|fee|fees|tax)\b/i.test(text) ? "Pricing/budget question or objection mentioned." : null,
  ].filter(Boolean);
  return lines.length ? lines.join("\n") : undefined;
}

function extractInboundEnrichment(text: string): InquiryEnrichmentPatch {
  const concierge = extractSegment(text, [/\b((?:boat|chef|grocery|airport transfer|snorkel|fishing|concierge|rental car|kayak|paddleboard|excursion)[^\n.]*)/i]);
  const patch: InquiryEnrichmentPatch = {
    phone: extractPhoneFromText(text),
    preferredContactMethod: inferPreferredContactMethod(text),
    email: extractEmailFromText(text),
    ...extractDateRange(text),
    guestCount: extractGuestCount(text),
    locationLabel: extractSegment(text, [/\b(?:we are|i am|coming) from\s+([^.,\n]+)/i, /\b(?:based in|located in)\s+([^.,\n]+)/i]),
    preferencesSummary: extractSegment(text, [/\b(?:looking for|hoping for|would love|prefer|interested in)\s+([^\n.]+)/i]),
    householdSummary: extractSegment(text, [/\b(?:family of|group of|traveling with|travelling with)\s+([^\n.]+)/i]),
    conciergeInterests: concierge ? `Interest: ${concierge}` : undefined,
  };
  patch.notes = buildInboundNotes(text, patch);
  return patch;
}

async function applyEnrichmentToFallbackInquiry(inquiryId: string, patch: InquiryEnrichmentPatch) {
  if (!patch.phone && !patch.checkIn && !patch.checkOut) return;
  const inquiries = await readFallback();
  const target = inquiries.find((item) => item.id === inquiryId);
  if (!target) return;
  const nextPhone = patch.phone || target.phone;
  const nextCheckIn = patch.checkIn || target.checkIn;
  const nextCheckOut = patch.checkOut || target.checkOut;
  const changed = nextPhone !== target.phone || nextCheckIn !== target.checkIn || nextCheckOut !== target.checkOut;
  if (!changed) return;
  await writeFallback(
    inquiries.map((item) =>
      item.id === inquiryId
        ? {
            ...item,
            phone: nextPhone,
            checkIn: nextCheckIn,
            checkOut: nextCheckOut,
          }
        : item
    )
  );
}

async function applyEnrichmentToDatabaseInquiry(inquiry: InquiryThreadRecord, patch: InquiryEnrichmentPatch) {
  const hasPatch = Object.values(patch).some(Boolean);
  if (!hasPatch) return;
  const prisma = await getPrismaClient();
  const phone = patch.phone && patch.phone !== inquiry.phone ? patch.phone : undefined;
  const checkIn = patch.checkIn && !inquiry.checkIn ? new Date(`${patch.checkIn}T00:00:00.000Z`) : undefined;
  const checkOut = patch.checkOut && !inquiry.checkOut ? new Date(`${patch.checkOut}T00:00:00.000Z`) : undefined;

  if (phone || checkIn || checkOut) {
    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: { phone, checkIn, checkOut },
    });
  }

  if (inquiry.customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: inquiry.customerId },
      select: { id: true, phone: true, email: true, preferredContactMethod: true, locationLabel: true, notes: true, preferencesSummary: true, householdSummary: true, conciergeInterests: true },
    });

    if (customer) {
      const customerPhone = phone && !customer.phone ? phone : undefined;
      const preferredContactMethod = patch.preferredContactMethod && patch.preferredContactMethod !== customer.preferredContactMethod
        ? patch.preferredContactMethod
        : undefined;
      const locationLabel = patch.locationLabel && !customer.locationLabel ? patch.locationLabel : undefined;
      const append = (current: string | null, next?: string) => next && !String(current || "").includes(next) ? [current, next].filter(Boolean).join("\n") : undefined;
      const notes = append(customer.notes, [patch.notes, patch.email && patch.email !== customer.email ? `Alternate email mentioned: ${patch.email}` : undefined].filter(Boolean).join("\n"));
      const preferencesSummary = append(customer.preferencesSummary, patch.preferencesSummary);
      const householdSummary = append(customer.householdSummary, patch.householdSummary || (patch.guestCount ? `Party size: ${patch.guestCount}` : undefined));
      const conciergeInterests = append(customer.conciergeInterests, patch.conciergeInterests);

      if (customerPhone || preferredContactMethod || locationLabel || notes || preferencesSummary || householdSummary || conciergeInterests) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            phone: customerPhone,
            preferredContactMethod,
            locationLabel,
            notes,
            preferencesSummary,
            householdSummary,
            conciergeInterests,
          },
        });
      }
    }
  }
}

export async function runInquiryInboundAutomation(inquiryId: string): Promise<void> {
  const inquiry = await getInquiryThreadById(inquiryId);
  if (!inquiry) return;

  const latestInbound = [...inquiry.messages].reverse().find((message) => message.direction === "inbound");
  if (!latestInbound?.body?.trim()) return;

  const enrichment = extractInboundEnrichment(latestInbound.body);
  if (canUseDatabase()) {
    try {
      await applyEnrichmentToDatabaseInquiry(inquiry, enrichment);
    } catch {
      // Keep automation non-blocking; draft generation matters more than enrichment perfection.
    }
  } else {
    await applyEnrichmentToFallbackInquiry(inquiry.id, enrichment);
  }

  const refreshedInquiry = (await getInquiryThreadById(inquiryId)) || inquiry;
  const { getInquiryCopilotInsights } = await import("@/lib/inquiryCopilot");
  const insights = await getInquiryCopilotInsights(refreshedInquiry);
  const defaultDraft = insights.draftOptions[0];
  if (!defaultDraft?.body?.trim()) return;

  await saveInquiryDraft({
    inquiryId,
    subject: defaultDraft.subject,
    body: defaultDraft.body,
    status: "draft",
    createdByType: "assistant",
  });
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
  customerId: string | null;
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
    customerId: record.customerId ?? undefined,
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
    customerId: undefined,
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
      await runInquiryInboundAutomation(base.id);
    }
    return base;
  }

  try {
    const prisma = await getPrismaClient();
    const propertyId = await getPropertyId();
    if (!propertyId) throw new Error("Missing property");
    const customerLink = await findOrCreateCustomerLink({
      propertyId,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
    });
    const created = await prisma.inquiry.create({
      data: {
        propertyId,
        customerId: customerLink.customerId,
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
      await runInquiryInboundAutomation(created.id);
    }
    return mapDbInquiry(created);
  } catch {
    const current = await readFallback();
    await writeFallback([base, ...current]);
    return base;
  }
}
