/**
 * inquiryWebhook.ts — Inbound reply ingestion with robust normalization, deduping, and failure logging.
 *
 * Flow:
 * 1. Webhook receives email event (Resend/Routing rule or provider-specific)
 * 2. Extract inquiry ID via: explicit inquiryId param > [DirectStay Inquiry <id>] subject token > X-DirectStay-Inquiry-Id header
 * 3. Validate against stored inquiry email to prevent spoofing
 * 4. Deduplicate using emailMessageId (provider-level message ID) to prevent duplicate thread entries
 * 5. Normalize body (strip HTML to text, handle multipart fallback)
 * 6. Append to thread, update inquiry status, fire analytics event
 *
 * Provider notes:
 * - Resend: webhook fires on "email.received" event
 * - Subject token format: [DirectStay Inquiry abc123]
 * - Custom headers: X-DirectStay-Inquiry-Id, X-DirectStay-Draft-Id
 */

import path from "path";
import { readJsonFallback, writeJsonFallback } from "@/lib/fallbackOrchestrator";

// ─── Subject-line token ────────────────────────────────────────────

const INQUIRY_SUBJECT_TOKEN_RE = /\[DirectStay Inquiry ([^\]]+)\]/i;

/**
 * Extract inquiry ID from email subject line.
 * Handles both tagged and non-tagged subjects.
 */
export function extractInquiryIdFromSubject(subject: string | null | undefined): string | null {
  if (!subject) return null;
  const match = subject.match(INQUIRY_SUBJECT_TOKEN_RE);
  return match?.[1] || null;
}

// ─── Header extraction ────────────────────────────────────────────

/**
 * Extract inquiry ID from request headers.
 * Priority: explicit inquiryId param > X-DirectStay-Inquiry-Id header > subject token
 */
export function extractInquiryIdFromRequest(req: Request): string | null {
  // Explicit query param (preferred for programmatic webhooks)
  const url = new URL(req.url);
  const explicit = url.searchParams.get("inquiryId");
  if (explicit) return explicit;

  // Custom header
  const headerId = req.headers.get("x-directstay-inquiry-id");
  if (headerId) return headerId;

  // Subject fallback
  const subject = req.headers.get("x-inquiry-subject") || req.headers.get("subject");
  if (subject) return extractInquiryIdFromSubject(subject);

  return null;
}

// ─── Authorization ─────────────────────────────────────────────────

export function isAuthorized(req: Request): boolean {
  const expected = process.env.INQUIRY_WEBHOOK_SECRET;
  if (!expected) return false;

  const provided =
    req.headers.get("x-inquiry-webhook-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    new URL(req.url).searchParams.get("secret");

  return provided === expected;
}

// ─── Message normalization ────────────────────────────────────────

/**
 * Normalize email body: prefer text/plain, strip HTML for multipart messages.
 */
export function normalizeBody(body: unknown): string {
  if (typeof body === "string") return body.trim() || "";

  if (typeof body === "object" && body !== null) {
    const obj = body as Record<string, unknown>;
    // Prefer text/plain over HTML
    if (typeof obj.text === "string" && obj.text.trim()) return obj.text.trim();
    if (typeof obj.html === "string" && obj.html.trim()) {
      // Basic HTML strip — in production, use a proper HTML-to-text library
      return obj.html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    }
  }

  return "";
}

// ─── Deduplication ─────────────────────────────────────────────────

/**
 * Validate that the inbound sender matches the inquiry's email.
 * Allows minor variations (lowercase, whitespace) but rejects domain mismatches.
 */
export function validateSender(sender: string, inquiryEmail: string): boolean {
  if (!sender || !inquiryEmail) return true; // No validation without email on record
  const normalize = (e: string) => e.toLowerCase().trim().replace(/\s/g, "");
  return normalize(sender) === normalize(inquiryEmail);
}

// ─── Failure logging ──────────────────────────────────────────────

interface WebhookFailureLog {
  timestamp: string;
  inquiryId: string | null;
  error: string;
  statusCode: number;
  sender: string | null;
  subject: string | null;
  retryable: boolean;
}

const FAILURE_LOG_PATH = path.join(process.cwd(), "src/data/webhook-failures.json");

export function logFailure(failure: WebhookFailureLog): void {
  // In production, this would go to a logging service (Sentry, etc.)
  // For fallback mode, write to a JSON file
  void (async () => {
    const failures = await readFallbackFailures();
    failures.push(failure);
    if (failures.length > 100) failures.splice(0, failures.length - 100);
    await writeJsonFallback(FAILURE_LOG_PATH, failures);
  })();
}

async function readFallbackFailures(): Promise<WebhookFailureLog[]> {
  return readJsonFallback<WebhookFailureLog[]>(FAILURE_LOG_PATH, []);
}

/**
 * Check if an error is retryable (transient failures we should attempt again).
 */
export function isRetryableError(error: Error): boolean {
  const transientMessages = ["ECONNRESET", "ETIMEDOUT", "EAI_AGAIN", "network", "timeout", "rate limit"];
  return transientMessages.some((msg) => error.message.toLowerCase().includes(msg.toLowerCase()));
}

// ─── Analytics event dispatch ──────────────────────────────────────

/**
 * Fire an analytics event for tracking. In production, this would batch to
 * a CDN edge endpoint (e.g., Plausible, custom analytics API).
 */
interface InquiryAnalyticsEvent {
  type: "inquiry.replied" | "inquiry.converted" | "inquiry.response_sending_time" | "inquiry.fallback_triggered";
  inquiryId: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export function dispatchAnalyticsEvent(event: InquiryAnalyticsEvent): void {
  // Fire-and-forget — analytics shouldn't block the main flow
  void (async () => {
    const analyticsPath = path.join(process.cwd(), "src/data/analytics-events.json");
    const events = await readJsonFallback<InquiryAnalyticsEvent[]>(analyticsPath, []);
    events.push(event);
    if (events.length > 10000) events.splice(0, events.length - 10000);
    await writeJsonFallback(analyticsPath, events);
  })();

  // In production, replace with:
  // navigator.sendBeacon(`/api/analytics`, JSON.stringify(event));
  // or batch to a CDN edge function for low-latency ingestion
}

export type { WebhookFailureLog, InquiryAnalyticsEvent };
