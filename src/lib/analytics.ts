import path from "path";

/**
 * analytics.ts — Conversion funnel instrumentation for DirectStay.
 *
 * Tracks the full guest journey from landing → inquiry → response → conversion.
 * Events:
 *   - page.view       — page view on key surfaces
 *   - inquiry.start    — guest opens inquiry form
 *   - inquiry.submit   — inquiry form submitted
 *   - inquiry.responded — owner replies within threshold
 *   - inquiry.converted — inquiry marked converted / reservation created
 *   - inquiry.abandoned — inquiry unanswered past threshold
 *   - pricing.view     — pricing page / table viewed
 *   - availability.check — calendar interaction
 *
 * In production, events batch to a CDN edge analytics endpoint.
 * In fallback mode, events are written to a JSON file for periodic export.
 */

export interface AnalyticsEvent {
  type: string;
  inquiryId?: string;
  reservationId?: string;
  timestamp: string;
  properties: Record<string, unknown>;
}

interface AnalyticsStore {
  events: AnalyticsEvent[];
}

const DEFAULT_STORE: AnalyticsStore = { events: [] };
const STORE_PATH = path.join(process.cwd(), "src/data/analytics-store.json");

async function loadStore(): Promise<AnalyticsStore> {
  try {
    const fs = await import("fs/promises");
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as AnalyticsStore;
  } catch {
    return { ...DEFAULT_STORE };
  }
}

async function saveStore(store: AnalyticsStore): Promise<void> {
  if (store.events.length === 0) return;
  // Only keep last 5000 events in memory
  if (store.events.length > 5000) {
    store.events = store.events.slice(-5000);
  }
  try {
    const fs = await import("fs/promises");
    await fs.writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  } catch {
    // Silently drop — analytics failure is not a business blocker
  }
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Record an analytics event. Non-blocking, fire-and-forget.
 */
export async function track(event: Omit<AnalyticsEvent, "timestamp">): Promise<void> {
  const fullEvent: AnalyticsEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  const store = await loadStore();
  store.events.push(fullEvent);
  await saveStore(store);
}

// ─── Convenience helpers ──────────────────────────────────────────────────

export async function trackPageView(page: string, url: string): Promise<void> {
  await track({ type: "page.view", properties: { page, url } });
}

export async function trackInquirySubmit(inquiryId: string, data: { fullName: string; checkIn?: string; checkOut?: string; messageLength: number }): Promise<void> {
  await track({
    type: "inquiry.submit",
    inquiryId,
    properties: { fullName: data.fullName, checkIn: data.checkIn, checkOut: data.checkOut, messageLength: data.messageLength },
  });
}

export async function trackInquiryResponse(inquiryId: string, responseHours: number, draftCount: number): Promise<void> {
  await track({
    type: "inquiry.responded",
    inquiryId,
    properties: { responseHours, draftCount },
  });
}

export async function trackInquiryConverted(inquiryId: string, reservationId?: string, leadScore?: number): Promise<void> {
  await track({
    type: "inquiry.converted",
    inquiryId,
    reservationId,
    properties: { leadScore },
  });
}

export async function trackPricingView(platform: string, nightlyRate?: number): Promise<void> {
  await track({
    type: "pricing.view",
    properties: { platform, nightlyRate },
  });
}

export async function trackAvailabilityCheck(checkIn?: string, checkOut?: string): Promise<void> {
  await track({
    type: "availability.check",
    properties: { checkIn, checkOut },
  });
}

// ─── Dashboard query helper ─────────────────────────────────────────

export interface ConversionMetrics {
  totalInquiries: number;
  totalConverted: number;
  conversionRate: number;
  avgResponseHours: number | null;
  inquiriesByDay: Array<{ day: string; count: number }>;
  topObjectionTypes: Array<{ type: string; count: number }>;
  inquiriesByLeadScore: { cold: number; warm: number; hot: number };
}

export async function getConversionMetrics(days = 30): Promise<ConversionMetrics> {
  const store = await loadStore();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  // Count by status (from inquiry data)
  // We use stored events + inquiry status for metrics
  const recentEvents = store.events.filter((e) => new Date(e.timestamp) >= cutoff);

  // This is a skeleton — real implementation would query the inquiry DB directly
  // For the dashboard stats in ownerPortalDashboard.ts, we use the inquiry thread data
  // This module tracks conversion funnel events

  return {
    totalInquiries: recentEvents.filter((event) => event.type === "inquiry.submit").length,
    totalConverted: recentEvents.filter((event) => event.type === "inquiry.converted").length,
    conversionRate: recentEvents.filter((event) => event.type === "inquiry.submit").length
      ? recentEvents.filter((event) => event.type === "inquiry.converted").length /
        recentEvents.filter((event) => event.type === "inquiry.submit").length
      : 0,
    avgResponseHours: (() => {
      const responseEvents = recentEvents.filter((event) => event.type === "inquiry.responded");
      if (responseEvents.length === 0) return null;
      const values = responseEvents
        .map((event) => Number(event.properties.responseHours))
        .filter((value) => Number.isFinite(value));
      return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    })(),
    inquiriesByDay: Object.entries(
      recentEvents
        .filter((event) => event.type === "inquiry.submit")
        .reduce<Record<string, number>>((acc, event) => {
          const day = event.timestamp.slice(0, 10);
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {})
    ).map(([day, count]) => ({ day, count })),
    topObjectionTypes: [],
    inquiriesByLeadScore: { cold: 0, warm: 0, hot: 0 },
  };
}
