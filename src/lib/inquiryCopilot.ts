import type { InquiryThreadRecord } from "@/lib/inquiries";
import { listPricingEntries } from "@/lib/pricingData";
import { listReservations } from "@/lib/reservations";
import { getPaymentSettings, getSiteSettings } from "@/lib/ownerPortalSettings";

export interface InquiryCopilotDraftOption {
  key: string;
  label: string;
  description: string;
  subject: string;
  body: string;
}

export interface InquiryCopilotInsights {
  summary: string;
  urgency: "low" | "medium" | "high";
  leadLabel: "cold" | "warm" | "hot";
  leadScore: number;
  scoreReasons: string[];
  missingInfo: string[];
  keyFacts: Array<{ label: string; value: string }>;
  guestFlowSignals: string[];
  suggestedNextAction: string;
  recommendedStatus: "new" | "replied" | "approved" | "declined" | "converted";
  objectionSignals: string[];
  draftOptions: InquiryCopilotDraftOption[];
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function daysBetween(checkIn?: string, checkOut?: string): number | null {
  if (!checkIn || !checkOut) return null;
  const start = new Date(`${checkIn}T00:00:00Z`).getTime();
  const end = new Date(`${checkOut}T00:00:00Z`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function overlaps(requestStart?: string, requestEnd?: string, holdStart?: string, holdEnd?: string): boolean {
  if (!requestStart || !requestEnd || !holdStart || !holdEnd) return false;
  return requestStart < holdEnd && requestEnd > holdStart;
}

function extractQuestions(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.includes("?"))
    .slice(0, 4);
}

function sentenceCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildGreeting(name: string) {
  const firstName = name.trim().split(/\s+/)[0] || name;
  return `Hi ${firstName},`;
}

function joinPaymentMethods(methods: ReturnType<typeof enabledPaymentMethods>): string {
  if (methods.length === 0) return "secure direct payment options";
  if (methods.length === 1) return methods[0];
  if (methods.length === 2) return `${methods[0]} or ${methods[1]}`;
  return `${methods.slice(0, -1).join(", ")}, or ${methods[methods.length - 1]}`;
}

function enabledPaymentMethods(paymentMethods: { stripe: boolean; zelle: boolean; venmo: boolean; cashApp: boolean }) {
  const labels: string[] = [];
  if (paymentMethods.stripe) labels.push("Stripe");
  if (paymentMethods.zelle) labels.push("Zelle");
  if (paymentMethods.venmo) labels.push("Venmo");
  if (paymentMethods.cashApp) labels.push("Cash App");
  return labels;
}

function latestGuestMessage(inquiry: InquiryThreadRecord): string {
  const inbound = [...inquiry.messages].reverse().find((message) => message.direction === "inbound");
  return inbound?.body || inquiry.message || "";
}

function summarizeIntent(inquiry: InquiryThreadRecord, requestedNights: number | null, directNightlyRate: number | null) {
  const parts = [] as string[];
  if (requestedNights && inquiry.checkIn && inquiry.checkOut) {
    parts.push(`Guest asked about a ${requestedNights}-night stay from ${formatDate(inquiry.checkIn)} to ${formatDate(inquiry.checkOut)}.`);
  } else if (inquiry.checkIn || inquiry.checkOut) {
    parts.push(`Guest shared partial travel timing (${inquiry.checkIn || "?"} → ${inquiry.checkOut || "?"}).`);
  } else {
    parts.push("Guest has not provided travel dates yet.");
  }

  if (directNightlyRate) {
    parts.push(`Current direct nightly rate baseline is about $${directNightlyRate.toLocaleString()}/night.`);
  }

  const text = latestGuestMessage(inquiry).toLowerCase();
  if (text.includes("price") || text.includes("rate") || text.includes("discount") || text.includes("deal")) {
    parts.push("Message shows price sensitivity.");
  }
  if (text.includes("family") || text.includes("kids") || text.includes("children")) {
    parts.push("Family-travel language suggests comfort and logistics matter.");
  }
  if (text.includes("airport") || text.includes("location") || text.includes("beach") || text.includes("walk")) {
    parts.push("Guest is evaluating practical fit, not just availability.");
  }

  return parts.join(" ");
}

export async function getInquiryCopilotInsights(inquiry: InquiryThreadRecord): Promise<InquiryCopilotInsights> {
  const [siteSettings, paymentSettings, pricingEntries, reservations] = await Promise.all([
    getSiteSettings(),
    getPaymentSettings(),
    listPricingEntries(),
    listReservations(),
  ]);

  const directPricing = pricingEntries.find((entry) => entry.platform === "direct") || null;
  const directNightlyRate = directPricing?.nightlyRate ?? null;
  const requestedNights = daysBetween(inquiry.checkIn, inquiry.checkOut);
  const text = latestGuestMessage(inquiry);
  const textLower = text.toLowerCase();
  const paymentMethods = enabledPaymentMethods(siteSettings.paymentMethods);
  const conflictingReservations = reservations.filter((reservation) =>
    reservation.status !== "Cancelled" && overlaps(inquiry.checkIn, inquiry.checkOut, reservation.checkIn, reservation.checkOut)
  );

  const missingInfo: string[] = [];
  if (!inquiry.checkIn || !inquiry.checkOut) missingInfo.push("Travel dates");
  if (!text.trim()) missingInfo.push("Trip details or questions");
  if (!inquiry.phone) missingInfo.push("Phone number");
  if (requestedNights !== null && requestedNights < siteSettings.minStayNights) missingInfo.push(`Stay does not yet meet the ${siteSettings.minStayNights}-night minimum`);

  let leadScore = 45;
  const scoreReasons: string[] = [];
  if (inquiry.checkIn && inquiry.checkOut) {
    leadScore += 18;
    scoreReasons.push("Concrete travel dates provided");
  }
  if (text.trim().length > 60) {
    leadScore += 10;
    scoreReasons.push("Detailed message suggests genuine intent");
  }
  if (textLower.includes("ready") || textLower.includes("book") || textLower.includes("reserve")) {
    leadScore += 12;
    scoreReasons.push("Booking-intent language present");
  }
  if (textLower.includes("price") || textLower.includes("discount") || textLower.includes("deal") || textLower.includes("best rate")) {
    leadScore -= 6;
    scoreReasons.push("Price sensitivity likely needs careful handling");
  }
  if (conflictingReservations.length > 0) {
    leadScore -= 20;
    scoreReasons.push("Requested dates appear blocked by another reservation or owner hold");
  }
  if (requestedNights !== null && requestedNights < siteSettings.minStayNights) {
    leadScore -= 10;
    scoreReasons.push(`Requested stay is shorter than the ${siteSettings.minStayNights}-night minimum`);
  }
  if (missingInfo.length === 0) {
    leadScore += 8;
    scoreReasons.push("Inquiry has the key details needed for a decisive reply");
  }

  leadScore = Math.max(0, Math.min(100, leadScore));

  const urgency: InquiryCopilotInsights["urgency"] =
    textLower.includes("asap") || textLower.includes("urgent") || textLower.includes("tonight") || textLower.includes("soon")
      ? "high"
      : inquiry.status === "new"
        ? "medium"
        : "low";

  const leadLabel: InquiryCopilotInsights["leadLabel"] = leadScore >= 75 ? "hot" : leadScore >= 55 ? "warm" : "cold";

  const objectionSignals = [
    textLower.includes("price") || textLower.includes("discount") ? "Pricing objection likely" : null,
    textLower.includes("airbnb") || textLower.includes("vrbo") ? "Comparing against Airbnb/VRBO" : null,
    textLower.includes("location") || textLower.includes("airport") || textLower.includes("walk") ? "Location/logistics question" : null,
    textLower.includes("payment") || textLower.includes("safe") || textLower.includes("secure") ? "Trust or payment reassurance needed" : null,
  ].filter(Boolean) as string[];

  const availabilityLine = conflictingReservations.length > 0
    ? `The exact requested dates look blocked right now, so the reply should steer toward alternate dates or a quick confirmation before promising availability.`
    : requestedNights !== null && inquiry.checkIn && inquiry.checkOut
      ? `The requested ${requestedNights}-night window from ${formatDate(inquiry.checkIn)} to ${formatDate(inquiry.checkOut)} appears workable based on the current calendar.`
      : `Before quoting specifics, the reply should confirm the guest's exact dates.`;

  const paymentLine = paymentMethods.length > 0
    ? `For payment, you can mention ${joinPaymentMethods(paymentMethods)}${paymentSettings.allowFallbacks ? " with manual fallback options available" : " - all payments are processed through this setup"}.`
    : `Payment configuration is still thin, so avoid overpromising payment options.`;

  const depositLine = paymentSettings.depositPercent > 0
    ? `A ${paymentSettings.depositPercent}% deposit is standard to secure a booking, with the balance due ${paymentSettings.finalDueDays} days before arrival.`
    : null;

  const minimumStayLine = `The property currently runs with a ${siteSettings.minStayNights}-night minimum stay.`;
  const pricingLine = directNightlyRate
    ? `Current direct rate guidance starts around $${directNightlyRate.toLocaleString()}/night before taxes or stay-specific adjustments.`
    : `Direct pricing should be confirmed manually before sending a firm quote.`;

  const followUpBody = [
    buildGreeting(inquiry.fullName),
    "",
    "Just wanted to follow up on your Villa La Percha inquiry in case I can help with anything else.",
    requestedNights && inquiry.checkIn && inquiry.checkOut
      ? `I still have your requested ${requestedNights}-night stay from ${formatDate(inquiry.checkIn)} to ${formatDate(inquiry.checkOut)} in mind.`
      : "If you want, send over your preferred dates and I can point you in the right direction quickly.",
    "",
    "Happy to answer any questions about the villa, direct booking process, or the area.",
    "",
    "Best,",
    "Villa La Percha",
  ].join("\n");

  const baseReplyBody = [
    buildGreeting(inquiry.fullName),
    "",
    "Thanks for reaching out about Villa La Percha.",
    availabilityLine,
    minimumStayLine,
    pricingLine,
    depositLine ? `${depositLine} ` : "",
    paymentLine,
    textLower.includes("airbnb") || textLower.includes("vrbo")
      ? "Booking direct keeps the conversation simple and usually gives guests a cleaner overall price than booking the same stay through Airbnb or VRBO."
      : "If it helps, I can also outline the direct-booking process so everything feels straightforward and secure.",
    "",
    missingInfo.length > 0
      ? `To get you the most accurate answer, I'd love to confirm: ${missingInfo.join(", ")}.`
      : "If you'd like, I can firm up the exact quote and next booking steps from here.",
    "",
    "Best,",
    "Villa La Percha",
  ].join("\n");

  const warmerBody = baseReplyBody
    .replace("Thanks for reaching out about Villa La Percha.", "Thanks so much for reaching out about Villa La Percha - I'm glad you found us.")
    .replace("If you'd like, I can firm up the exact quote and next booking steps from here.", "If you'd like, I can help you pin down the exact quote and next steps from here.");

  const conciseBody = [
    buildGreeting(inquiry.fullName),
    "",
    requestedNights && inquiry.checkIn && inquiry.checkOut
      ? `Thanks for your note about ${formatDate(inquiry.checkIn)} to ${formatDate(inquiry.checkOut)}.`
      : "Thanks for your inquiry.",
    conflictingReservations.length > 0
      ? "Those exact dates may be blocked, but I'm happy to suggest close alternatives."
      : directNightlyRate
        ? `Direct stays are currently starting around $${directNightlyRate.toLocaleString()}/night, and the villa has a ${siteSettings.minStayNights}-night minimum.`
        : `The villa has a ${siteSettings.minStayNights}-night minimum stay.`,
    missingInfo.length > 0 ? `If you send ${missingInfo.join(", ")}, I can reply with the cleanest next step.` : "I can send the exact next steps whenever you're ready.",
    "",
    "Best,",
    "Villa La Percha",
  ].join("\n");

  const pricingObjectionBody = [
    buildGreeting(inquiry.fullName),
    "",
    "Thanks for the note - totally fair question.",
    directNightlyRate
      ? `Our direct stays currently start around $${directNightlyRate.toLocaleString()}/night, and booking direct usually avoids the extra guest-facing markup you tend to see on Airbnb or VRBO.`
      : "Booking direct usually gives guests a cleaner overall price than booking the same stay through Airbnb or VRBO.",
    "If you'd like, I can break down the stay pricing clearly so you can compare apples to apples.",
    "",
    conflictingReservations.length > 0
      ? "If your dates have some flexibility, I can also suggest nearby openings that may work better."
      : "If the dates still work on your side, I'm happy to map out the next step.",
    "",
    "Best,",
    "Villa La Percha",
  ].join("\n");

  const availabilityBody = [
    buildGreeting(inquiry.fullName),
    "",
    conflictingReservations.length > 0
      ? `I'm checking your requested dates (${formatDate(inquiry.checkIn || undefined)} to ${formatDate(inquiry.checkOut || undefined)}) against the calendar now, and they may be tight.`
      : inquiry.checkIn && inquiry.checkOut
        ? `I've noted your requested stay from ${formatDate(inquiry.checkIn)} to ${formatDate(inquiry.checkOut)}.`
        : "I'd be happy to check the calendar for you.",
    conflictingReservations.length > 0
      ? "If you can shift by a day or two on either side, I can suggest the best alternate windows quickly."
      : `The villa works on a ${siteSettings.minStayNights}-night minimum, so if those dates are confirmed I can help move you to the next step cleanly.`,
    "",
    "Best,",
    "Villa La Percha",
  ].join("\n");

  const draftOptions: InquiryCopilotDraftOption[] = [
    {
      key: "base",
      label: "Draft reply",
      description: "Balanced response using current dates, pricing, and booking context.",
      subject: buildInquiryEmailSubject(inquiry),
      body: baseReplyBody,
    },
    {
      key: "warm",
      label: "Make it warmer",
      description: "Softer, more hospitality-forward tone.",
      subject: buildInquiryEmailSubject(inquiry),
      body: warmerBody,
    },
    {
      key: "concise",
      label: "Make it shorter",
      description: "Tighter version for quick replies from mobile.",
      subject: buildInquiryEmailSubject(inquiry),
      body: conciseBody,
    },
    {
      key: "pricing",
      label: "Answer pricing objection",
      description: "Handles rate sensitivity without sounding defensive.",
      subject: buildInquiryEmailSubject(inquiry),
      body: pricingObjectionBody,
    },
    {
      key: "availability",
      label: "Mention availability naturally",
      description: "Centers the reply around dates and next-step clarity.",
      subject: buildInquiryEmailSubject(inquiry),
      body: availabilityBody,
    },
    {
      key: "follow_up",
      label: "Generate follow-up",
      description: "Gentle nudge if the guest has gone quiet.",
      subject: `Following up: ${buildInquiryEmailSubject(inquiry)}`,
      body: followUpBody,
    },
  ];

  const keyFacts = [
    { label: "Guest", value: inquiry.fullName },
    { label: "Email", value: inquiry.email },
    inquiry.phone ? { label: "Phone", value: inquiry.phone } : null,
    inquiry.checkIn ? { label: "Check-in", value: sentenceCase(formatDate(inquiry.checkIn) || inquiry.checkIn) } : null,
    inquiry.checkOut ? { label: "Check-out", value: sentenceCase(formatDate(inquiry.checkOut) || inquiry.checkOut) } : null,
    requestedNights ? { label: "Requested stay", value: `${requestedNights} nights` } : null,
    directNightlyRate ? { label: "Direct rate", value: `$${directNightlyRate.toLocaleString()}/night` } : null,
    { label: "Payment options", value: paymentMethods.length > 0 ? joinPaymentMethods(paymentMethods) : "Not configured" },
    paymentSettings.depositPercent > 0 ? { label: "Deposit", value: `${paymentSettings.depositPercent}%` } : null,
    { label: "Minimum stay", value: `${siteSettings.minStayNights} nights` },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const questions = extractQuestions(text);
  if (questions.length > 0) {
    keyFacts.push({ label: "Questions asked", value: `${questions.length} noted` });
  }

  // Deep guest-flow integration: surface property settings that affect guest-facing behavior
  const guestFlowSignals: string[] = [];
  if (!siteSettings.inquiryEnabled) {
    guestFlowSignals.push("Inquiries are currently disabled in site settings — the guest form should be hidden on the site.");
  }
  if (conflictingReservations.length > 0 && siteSettings.inquiryEnabled) {
    guestFlowSignals.push("The requested dates are blocked — consider offering alternate windows on the availability calendar.");
  }

  return {
    summary: summarizeIntent(inquiry, requestedNights, directNightlyRate),
    urgency,
    leadLabel,
    leadScore,
    scoreReasons,
    missingInfo,
    keyFacts,
    guestFlowSignals,
    suggestedNextAction:
      conflictingReservations.length > 0
        ? "Reply quickly, acknowledge the requested dates, and offer the nearest workable alternatives."
        : missingInfo.length > 0
          ? `Reply with a warm clarifying note and collect ${missingInfo.join(", ")}.`
          : "Send a polished quote-oriented reply while the lead is still warm.",
    recommendedStatus: conflictingReservations.length > 0 ? "new" : inquiry.status === "converted" ? "converted" : "replied",
    objectionSignals,
    draftOptions,
  };
}
import { buildInquiryEmailSubject } from "@/lib/inquirySubject";
