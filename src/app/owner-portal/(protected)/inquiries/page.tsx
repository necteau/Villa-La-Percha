"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { InquiryCopilotInsights } from "@/lib/inquiryCopilot";
import type { InquiryDraftRecord, InquiryRecord, InquiryThreadRecord } from "@/lib/inquiries";
import { buildInquiryEmailSubject } from "@/lib/inquirySubject";

function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

const closeReasons = [
  "Dates unavailable",
  "Guest chose another property",
  "Price or budget mismatch",
  "No response from guest",
  "Duplicate or test inquiry",
  "Spam or not a real lead",
  "Owner declined",
  "Other",
];

const queueStatusOptions: Array<{ value: InquiryRecord["status"] | "all"; label: string }> = [
  { value: "needs_reply", label: "Needs reply" },
  { value: "awaiting_guest", label: "Awaiting guest" },
  { value: "booked", label: "Booked" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All statuses" },
];

const paymentStatusOptions: Array<{ value: InquiryRecord["paymentStatus"]; label: string }> = [
  { value: "unpaid", label: "Unpaid" },
  { value: "deposit_requested", label: "Deposit requested" },
  { value: "deposit_received", label: "Deposit received" },
  { value: "paid_in_full", label: "Paid in full" },
  { value: "partially_refunded", label: "Partially refunded" },
  { value: "refunded", label: "Refunded" },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatStatusLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function latestOutboundSentAt(inquiry: InquiryThreadRecord): string | null {
  const outbound = [...inquiry.messages]
    .reverse()
    .find((message) => message.direction === "outbound" && (message.sentAt || message.createdAt));
  return outbound?.sentAt || outbound?.createdAt || null;
}

function formatElapsedSince(value: string | null): string | null {
  if (!value) return null;
  const sentAt = Date.parse(value);
  if (!Number.isFinite(sentAt)) return null;
  const elapsedMs = Date.now() - sentAt;
  if (elapsedMs < 0) return "Sent just now";
  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
  if (hours < 1) return "Sent less than 1 hour ago";
  if (hours < 24) return `Sent ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `Sent ${days} day${days === 1 ? "" : "s"}${remainingHours ? ` ${remainingHours}h` : ""} ago`;
}

function messageMeta(message: InquiryThreadRecord["messages"][number]) {
  if (message.sentAt) return `Sent ${formatDate(message.sentAt)}`;
  if (message.receivedAt) return `Received ${formatDate(message.receivedAt)}`;
  return formatDate(message.createdAt);
}

function messagePreview(message: InquiryThreadRecord["messages"][number]): string {
  const compact = message.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!compact) return "No message details available.";
  return compact.length > 180 ? `${compact.slice(0, 180).trim()}…` : compact;
}

function daysBetweenDates(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
}

function estimatedRevenueFromInsights(insights?: InquiryCopilotInsights): number {
  const value = insights?.keyFacts.find((fact) => fact.label === "Estimated revenue")?.value || "";
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value?: number | string | null): string {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed) || parsed <= 0) return "—";
  return `$${parsed.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function cleanNumber(value?: number | string | null): number {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) / 100 : 0;
}

function badgeClass(value: string) {
  if (value === "sent" || value === "booked" || value === "hot" || value === "high") return "bg-[#eef6f1] text-[#1e4536]";
  if (value === "awaiting_guest" || value === "warm" || value === "medium") return "bg-[#f6f2ea] text-[#8b7355]";
  if (value === "closed" || value === "cold" || value === "low") return "bg-[#fbefef] text-[#b42318]";
  return "bg-[#f7f3eb] text-[#5b554b]";
}

interface DraftComposer {
  id?: string;
  subject: string;
  body: string;
  status: InquiryDraftRecord["status"];
}

function isSavedDraft(draft: InquiryDraftRecord | null | undefined): draft is InquiryDraftRecord {
  return Boolean(draft && "id" in draft);
}

function composeFromDraft(draft?: InquiryDraftRecord | null, inquiry?: InquiryThreadRecord | null): DraftComposer {
  return {
    id: isSavedDraft(draft) ? draft.id : undefined,
    subject: draft?.subject || buildInquiryEmailSubject(inquiry || {}),
    body: draft?.body || "",
    status: isSavedDraft(draft) ? draft.status : "draft",
  };
}

export default function OwnerInquiriesPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");
  const initialQueueStatus = queueStatusOptions.some((option) => option.value === initialStatus) ? initialStatus as InquiryRecord["status"] | "all" : "needs_reply";
  const [inquiries, setInquiries] = useState<InquiryThreadRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [queueStatusFilter, setQueueStatusFilter] = useState<InquiryRecord["status"] | "all">(initialQueueStatus);
  const [composer, setComposer] = useState<DraftComposer | null>(null);
  const [lastSavedBody, setLastSavedBody] = useState("");
  const [insightsById, setInsightsById] = useState<Record<string, InquiryCopilotInsights>>({});
  const [loading, setLoading] = useState(true);
  const [loadingInsightId, setLoadingInsightId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [revisionId, setRevisionId] = useState<string | null>(null);
  const [pollingRevisionDraftId, setPollingRevisionDraftId] = useState<string | null>(null);
  const [pollingUpgradeDraftId, setPollingUpgradeDraftId] = useState<string | null>(null);
  const [customRevision, setCustomRevision] = useState("");
  const [showConfirmBooking, setShowConfirmBooking] = useState(false);
  const [bookingRevenue, setBookingRevenue] = useState("");
  const [showCloseInquiry, setShowCloseInquiry] = useState(false);
  const [closeReason, setCloseReason] = useState(closeReasons[0]);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);
  const [paymentDraft, setPaymentDraft] = useState({ quotedAmount: "", depositAmount: "", amountReceived: "", paymentMethod: "", paymentNote: "", paymentStatus: "unpaid" as InquiryRecord["paymentStatus"] });
  const [paymentSettings, setPaymentSettings] = useState({ depositPercent: 0 });
  const [paymentConfirmMode, setPaymentConfirmMode] = useState<"deposit" | "full" | null>(null);
  const [paymentConfirmationNote, setPaymentConfirmationNote] = useState("");
  const [paymentConfirmationAmount, setPaymentConfirmationAmount] = useState("");
  const [showManualPaymentEdit, setShowManualPaymentEdit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reloadInquiries = useCallback(async () => {
    const response = await fetch(apiUrl("/api/owner-portal/inquiries"), { cache: "no-store", credentials: "same-origin" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Failed to load inquiries");
    setPaymentSettings({ depositPercent: Number(data.paymentSettings?.depositPercent || 0) });
    setInquiries(data.inquiries);
    setSelectedId((current) => current || data.inquiries.find((inquiry: InquiryThreadRecord) => inquiry.status === "needs_reply")?.id || data.inquiries[0]?.id || null);
  }, []);

  const loadInsights = useCallback(async (inquiryId: string, force = false) => {
    if (!force && insightsById[inquiryId]) return;
    setLoadingInsightId(inquiryId);
    try {
      const response = await fetch(apiUrl("/api/owner-portal/inquiries"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assist", inquiryId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to load assistant insights");
      setInsightsById((current) => ({ ...current, [inquiryId]: data.insights }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assistant insights");
    } finally {
      setLoadingInsightId((current) => (current === inquiryId ? null : current));
    }
  }, [insightsById]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(apiUrl("/api/owner-portal/inquiries"), { cache: "no-store", credentials: "same-origin" });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Failed to load inquiries");
        if (!cancelled) {
          setPaymentSettings({ depositPercent: Number(data.paymentSettings?.depositPercent || 0) });
          setInquiries(data.inquiries);
          setSelectedId((current) => current || data.inquiries.find((inquiry: InquiryThreadRecord) => inquiry.status === "needs_reply")?.id || data.inquiries[0]?.id || null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load inquiries");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => (selectedId ? inquiries.find((inquiry) => inquiry.id === selectedId) || null : null),
    [inquiries, selectedId]
  );
  const filteredQueueInquiries = useMemo(
    () => inquiries.filter((inquiry) => queueStatusFilter === "all" || inquiry.status === queueStatusFilter),
    [inquiries, queueStatusFilter]
  );

  useEffect(() => {
    if (inquiries.length === 0) return;
    const currentMatchesFilter = selectedId ? filteredQueueInquiries.some((inquiry) => inquiry.id === selectedId) : false;
    if (!currentMatchesFilter) {
      setSelectedId(filteredQueueInquiries[0]?.id || null);
      setLoadingInsightId(null);
    }
  }, [filteredQueueInquiries, inquiries.length, selectedId]);

  const selectedInsights = selectedId ? insightsById[selectedId] : undefined;
  const calculatedReservationTotal = cleanNumber(paymentDraft.quotedAmount || selected?.quotedAmount || 0);
  const currentReservationTotal = cleanNumber(selected?.currentQuotedAmount || estimatedRevenueFromInsights(selectedInsights));
  const calculatedDepositAmount = cleanNumber(paymentDraft.depositAmount || selected?.depositAmount || (calculatedReservationTotal && paymentSettings.depositPercent ? calculatedReservationTotal * (paymentSettings.depositPercent / 100) : 0));
  const calculatedReceived = cleanNumber(paymentDraft.amountReceived || selected?.amountReceived);
  const calculatedBalance = Math.max(0, calculatedReservationTotal - calculatedReceived);
  const openDrafts = useMemo(
    () => selected?.drafts.filter((draft) => draft.createdByType !== "system" && draft.status !== "sent") || [],
    [selected]
  );
  const selectedDraft = composer?.id ? openDrafts.find((draft) => draft.id === composer.id) : undefined;
  const isClosedInquiry = selected?.status === "closed";
  const shouldLoadAssistantInsights = selected?.status === "needs_reply" || selected?.status === "awaiting_guest";
  const isAiWorkingOnDraft = Boolean(composer?.id && (pollingRevisionDraftId === composer.id || pollingUpgradeDraftId === composer.id));
  const canReviseCurrentDraft = composer?.status === "draft" && !isAiWorkingOnDraft && !isClosedInquiry;
  const canEditCurrentDraft = composer?.status !== "sent" && !isAiWorkingOnDraft && !isClosedInquiry;
  const hasDraftChanges = Boolean(composer && composer.body.trim() !== lastSavedBody.trim());
  const isAiGeneratedDraft = Boolean(
    selectedDraft?.createdByType === "assistant" &&
    selectedInsights &&
    !selectedInsights.draftOptions.some((option) => option.body.trim() === selectedDraft.body.trim())
  );

  useEffect(() => {
    const latestDraft = selected?.drafts?.find((draft) => draft.createdByType !== "system" && draft.status === "draft") || null;
    const nextComposer = selected ? composeFromDraft(latestDraft, selected) : null;
    setComposer(nextComposer);
    setLastSavedBody(nextComposer?.body || "");
    setShowConfirmBooking(false);
    setShowCloseInquiry(false);
    setShowReopenConfirm(false);
    setPaymentConfirmMode(null);
    setPaymentConfirmationNote("");
    setPaymentConfirmationAmount("");
    setShowManualPaymentEdit(false);
    setCloseReason(closeReasons[0]);
    setBookingRevenue("");
    setPaymentDraft({
      quotedAmount: selected?.quotedAmount ? String(selected.quotedAmount) : "",
      depositAmount: selected?.depositAmount ? String(selected.depositAmount) : "",
      amountReceived: selected?.amountReceived ? String(selected.amountReceived) : "",
      paymentMethod: selected?.paymentMethod || "",
      paymentNote: selected?.paymentNote || "",
      paymentStatus: selected?.paymentStatus || "unpaid",
    });
    setSuccess("");
    setError("");
    if (!shouldLoadAssistantInsights) {
      setLoadingInsightId(null);
      return;
    }
    if (selected?.id) void loadInsights(selected.id);
  }, [selectedId, selected, shouldLoadAssistantInsights, loadInsights]);


  const updateStatus = async (id: string, status: InquiryRecord["status"], reason?: string) => {
    setSavingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(apiUrl("/api/owner-portal/inquiries"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", id, status, reason }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to update inquiry");
      setInquiries((current) => current.map((inquiry) => (inquiry.id === id ? { ...inquiry, ...data.inquiry } : inquiry)));
      setSuccess(`Inquiry marked ${status}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update inquiry");
    } finally {
      setSavingId(null);
    }
  };

  const confirmBooking = async () => {
    if (!selected) return;
    if (selected.status === "closed") return;
    if (!selected.checkIn || !selected.checkOut) {
      setError("Confirm dates before creating a reservation.");
      return;
    }
    const income = Number(bookingRevenue || estimatedRevenueFromInsights(selectedInsights));
    if (!Number.isFinite(income) || income <= 0) {
      setError("Confirm the estimated revenue before creating a reservation.");
      return;
    }

    setSavingId(selected.id);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(apiUrl("/api/owner-portal/reservations"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Confirmed",
          type: "Direct",
          unit: "Villa La Percha",
          bookedDate: new Date().toISOString().slice(0, 10),
          guestName: selected.fullName,
          guestEmail: selected.email,
          guestPhone: selected.phone,
          checkIn: selected.checkIn,
          checkOut: selected.checkOut,
          income,
          currency: "USD",
          paymentStatus: selected.paymentStatus,
          depositAmount: selected.depositAmount,
          amountReceived: selected.amountReceived,
          paymentMethod: selected.paymentMethod,
          paymentConfirmedAt: selected.paymentConfirmedAt,
          paymentNote: selected.paymentNote,
          isOwnerWeek: false,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to create reservation");
      await updateStatus(selected.id, "booked");
      await reloadInquiries();
      setShowConfirmBooking(false);
      setSuccess("Reservation created and inquiry marked booked.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm booking");
    } finally {
      setSavingId(null);
    }
  };

  const closeInquiry = async () => {
    if (!selected) return;
    if (selected.status === "closed") return;
    await updateStatus(selected.id, "closed", closeReason);
    setShowCloseInquiry(false);
  };

  const reopenInquiry = async () => {
    if (!selected) return;
    setSavingId(selected.id);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(apiUrl("/api/owner-portal/inquiries"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reopen", id: selected.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to reopen inquiry");
      await reloadInquiries();
      setShowReopenConfirm(false);
      setSuccess("Inquiry reopened.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reopen inquiry");
    } finally {
      setSavingId(null);
    }
  };

  const savePaymentState = async (override?: Partial<typeof paymentDraft>) => {
    if (!selected) return;
    const nextDraft = { ...paymentDraft, ...override };
    setSavingId(selected.id);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(apiUrl("/api/owner-portal/inquiries"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "payment", id: selected.id, ...nextDraft }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to save payment state");
      setPaymentDraft(nextDraft);
      if (data.inquiry) {
        setInquiries((current) => current.map((inquiry) => inquiry.id === selected.id ? data.inquiry : inquiry));
      } else {
        await reloadInquiries();
      }
      if (data.insights) {
        setInsightsById((current) => ({ ...current, [selected.id]: data.insights }));
      } else {
        await loadInsights(selected.id, true);
      }
      if (data.draft) {
        setComposer(composeFromDraft(data.draft, data.inquiry || selected));
        setLastSavedBody(data.draft.body || "");
      }
      setPaymentConfirmMode(null);
      setPaymentConfirmationNote("");
      setPaymentConfirmationAmount("");
      setSuccess("Payment state saved, assistant triage refreshed, and draft updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payment state");
    } finally {
      setSavingId(null);
    }
  };

  const confirmGuidedPayment = async () => {
    if (!paymentConfirmMode) return;
    const expectedAmount = paymentConfirmMode === "deposit" ? calculatedDepositAmount : calculatedReservationTotal;
    const amount = cleanNumber(paymentConfirmationAmount) || expectedAmount;
    await savePaymentState({
      quotedAmount: String(calculatedReservationTotal || cleanNumber(paymentDraft.quotedAmount)),
      depositAmount: String(calculatedDepositAmount || cleanNumber(paymentDraft.depositAmount)),
      amountReceived: String(amount),
      paymentStatus: paymentConfirmMode === "deposit" ? "deposit_received" : "paid_in_full",
      paymentNote: paymentConfirmationNote,
    });
  };

  const saveDraft = async (status: InquiryDraftRecord["status"]) => {
    if (!selected || !composer) return;

    setSavingId(selected.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(apiUrl("/api/owner-portal/inquiries"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "draft",
          id: composer.id,
          inquiryId: selected.id,
          subject: composer.subject,
          body: composer.body,
          status,
          createdByType: status === "draft" ? "assistant" : "owner",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to save draft");
      setInquiries((current) =>
        current.map((inquiry) => {
          if (inquiry.id !== selected.id) return inquiry;
          const remaining = inquiry.drafts.filter((draft) => draft.id !== data.draft.id);
          return { ...inquiry, drafts: [data.draft, ...remaining] };
        })
      );
      setComposer(composeFromDraft(data.draft, selected));
      setLastSavedBody(data.draft.body || "");
      setSuccess(
        status === "approved"
          ? "Draft approved and ready to send."
          : status === "pending_owner_approval"
            ? "Draft saved and marked ready for owner approval."
            : "Draft saved."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSavingId(null);
    }
  };

  const startNewDraft = () => {
    if (!selected) return;
    if (selected.status === "closed") {
      setError("Reopen this inquiry before starting a new draft.");
      return;
    }
    const nextComposer = composeFromDraft(null, selected);
    setComposer(nextComposer);
    setLastSavedBody(nextComposer.body);
    setCustomRevision("");
    setError("");
    setSuccess("New draft started. Write a proactive note, then save it before sending.");
  };

  const sendApprovedDraft = async () => {
    if (!selected || !composer?.id) return;

    setSavingId(selected.id);
    setError("");
    setSuccess("");
    setPollingRevisionDraftId(null);
    setPollingUpgradeDraftId(null);

    try {
      const response = await fetch(apiUrl("/api/owner-portal/inquiries"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          inquiryId: selected.id,
          draftId: composer.id,
          subject: composer.subject,
          body: composer.body,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to send approved draft");
      await reloadInquiries();
      setComposer(null);
      setLastSavedBody("");
      setCustomRevision("");
      void loadInsights(selected.id, true);
      setSuccess("Reply sent and logged to the conversation. You can start a new proactive message if needed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send approved draft");
    } finally {
      setSavingId(null);
    }
  };

  const pollForDraftUpdate = useCallback(async (
    inquiryId: string,
    draftId: string,
    previousBody: string,
    options: { mode: "revision" | "upgrade"; successMessage: string }
  ) => {
    if (options.mode === "revision") setPollingRevisionDraftId(draftId);
    if (options.mode === "upgrade") setPollingUpgradeDraftId(draftId);
    const startedAt = Date.now();
    const timeoutMs = options.mode === "revision" ? 30_000 : 90_000;

    while (Date.now() - startedAt < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      try {
        const response = await fetch(apiUrl("/api/owner-portal/inquiries"), { cache: "no-store", credentials: "same-origin" });
        const data = await response.json();
        if (!response.ok || !data.ok) throw new Error(data.error || "Failed to refresh inquiries");
        setInquiries(data.inquiries);
        const updatedInquiry = data.inquiries.find((inquiry: InquiryThreadRecord) => inquiry.id === inquiryId);
        const updatedDraft = updatedInquiry?.drafts?.find((draft: InquiryDraftRecord) => draft.id === draftId);
        if (updatedDraft && updatedDraft.body.trim() !== previousBody.trim()) {
          setComposer(composeFromDraft(updatedDraft, updatedInquiry));
          setLastSavedBody(updatedDraft.body || "");
          setSuccess(options.successMessage);
          void loadInsights(inquiryId, true);
          if (options.mode === "revision") setPollingRevisionDraftId(null);
          if (options.mode === "upgrade") setPollingUpgradeDraftId(null);
          return;
        }
      } catch {
        // Keep polling briefly; transient refresh failures should not erase the queued/upgrade UX.
      }
    }

    if (options.mode === "revision") {
      setPollingRevisionDraftId(null);
      setSuccess("AI revision is still working. You can keep using the portal; refresh this thread shortly if it does not appear automatically.");
    }
    if (options.mode === "upgrade") setPollingUpgradeDraftId(null);
  }, [loadInsights]);

  useEffect(() => {
    if (!selected?.id || !composer?.id || !selectedDraft || !selectedInsights) return;
    if (composer.status !== "draft" || selectedDraft.createdByType !== "assistant") return;
    if (isAiGeneratedDraft || pollingUpgradeDraftId === composer.id || pollingRevisionDraftId === composer.id) return;

    setSuccess("Assistant draft created. Watching for the ChatGPT upgrade…");
    void pollForDraftUpdate(selected.id, composer.id, composer.body, {
      mode: "upgrade",
      successMessage: "ChatGPT draft ready.",
    });
  }, [
    composer?.body,
    composer?.id,
    composer?.status,
    isAiGeneratedDraft,
    pollForDraftUpdate,
    pollingRevisionDraftId,
    pollingUpgradeDraftId,
    selected?.id,
    selectedDraft,
    selectedInsights,
  ]);

  const requestAiRevision = async (revisionIntent: "shorter" | "warmer" | "direct" | "custom") => {
    if (!selected || !composer?.id || !composer.body.trim()) return;
    if (composer.status !== "draft") {
      setError("AI revisions can only be queued for an unsent draft. Save a fresh draft first, then revise it.");
      return;
    }
    if (revisionIntent === "custom" && !customRevision.trim()) {
      setError("Add a short instruction for the custom AI revision.");
      return;
    }

    setRevisionId(revisionIntent);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(apiUrl("/api/owner-portal/inquiries"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ai_revision",
          inquiryId: selected.id,
          draftId: composer.id,
          subject: composer.subject,
          draftBody: composer.body,
          revisionIntent,
          instruction: revisionIntent === "custom" ? customRevision : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to request AI revision");
      setSuccess("AI revision queued. Watching for the updated draft for up to 30 seconds.");
      void pollForDraftUpdate(selected.id, composer.id, composer.body, { mode: "revision", successMessage: "AI revision ready." });
      if (revisionIntent === "custom") setCustomRevision("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request AI revision");
    } finally {
      setRevisionId(null);
    }
  };

  return (
    <section className="w-full min-w-0 space-y-5 overflow-x-hidden sm:space-y-6">
      <div className="min-w-0 rounded-[32px] border border-[#e8e1d6] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-8 md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Inquiries</p>
        <h1 className="mt-3 max-w-full font-display text-4xl leading-tight text-[#181612] sm:text-5xl">Review and manage full guest conversations</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b554b]">
          This is now the beginnings of an AI-assisted booking ops console: guest threads, assistant-guided triage, grounded reply suggestions, owner approval, and sent-message tracking in one place.
        </p>
        {success ? <p className="mt-3 text-sm text-[#1e4536]">{success}</p> : null}
        {error ? <p className="mt-3 text-sm text-[#b42318]">{error}</p> : null}
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 text-sm text-[#5b554b] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          Loading inquiries…
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-8 text-sm text-[#5b554b] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          No inquiries yet. When guests submit the form, they’ll show up here.
        </div>
      ) : (
        <div className="grid min-w-0 gap-5 sm:gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-[28px] border border-[#e8e1d6] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6 xl:sticky xl:top-6 xl:self-start">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Queue</p>
              <button
                type="button"
                onClick={() => selectedId && void loadInsights(selectedId, true)}
                disabled={!selectedId || loadingInsightId === selectedId || !shouldLoadAssistantInsights}
                className="shrink-0 rounded-full border border-[#ddd4c7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5b554b] disabled:opacity-60 sm:tracking-[0.16em]"
              >
                {!selectedId ? "No selection" : !shouldLoadAssistantInsights ? formatStatusLabel(selected?.status || "") : loadingInsightId === selectedId ? "Refreshing..." : "Refresh assistant"}
              </button>
            </div>
            <label className="mt-4 block text-xs font-medium uppercase tracking-[0.16em] text-[#7b7468]">
              Status filter
              <select
                value={queueStatusFilter}
                onChange={(e) => {
                  const next = e.target.value as InquiryRecord["status"] | "all";
                  setQueueStatusFilter(next);
                  setLoadingInsightId(null);
                  const nextSelection = inquiries.find((inquiry) => next === "all" || inquiry.status === next);
                  setSelectedId(null);
                  window.requestAnimationFrame(() => setSelectedId(nextSelection?.id || null));
                }}
                className="mt-2 w-full rounded-xl border border-[#ddd4c7] bg-white px-3 py-2 text-sm normal-case tracking-normal text-[#1b1a17]"
              >
                {queueStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <div className="mt-4 max-h-[440px] space-y-2 overflow-y-auto pr-2">
              {filteredQueueInquiries.length === 0 ? (
                <p className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] px-4 py-3 text-sm text-[#7b7468]">No inquiries match this status.</p>
              ) : filteredQueueInquiries.map((inquiry) => {
                const openCount = inquiry.drafts.filter((draft) => draft.status !== "sent").length;
                const insight = insightsById[inquiry.id];
                const awaitingGuestElapsed = inquiry.status === "awaiting_guest" ? formatElapsedSince(latestOutboundSentAt(inquiry)) : null;
                return (
                  <button
                    key={inquiry.id}
                    type="button"
                    onClick={() => setSelectedId(inquiry.id)}
                    className={`w-full min-w-0 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      inquiry.id === selectedId ? "border-[#1e4536] bg-[#eef6f1]" : "border-[#e8e1d6] hover:bg-[#f4efe6]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <p className="min-w-0 truncate font-medium text-[#1b1a17]">{inquiry.fullName}</p>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] ${badgeClass(inquiry.status)}`}>
                        {formatStatusLabel(inquiry.status)}
                      </span>
                    </div>
                    {awaitingGuestElapsed ? <p className="mt-1 text-[11px] font-medium text-[#8b7355]">{awaitingGuestElapsed}</p> : null}
                    <p className="mt-1 text-xs text-[#7b7468]">{formatDate(inquiry.createdAt)}</p>
                    {(inquiry.checkIn || inquiry.checkOut) && (
                      <p className="mt-1 text-xs text-[#7b7468]">
                        {inquiry.checkIn || "?"} → {inquiry.checkOut || "?"}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {insight ? (
                        <>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(insight.leadLabel)}`}>
                            {insight.leadLabel} lead
                          </span>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(insight.urgency)}`}>
                            {insight.urgency} urgency
                          </span>
                        </>
                      ) : null}
                    </div>
                    {openCount > 0 ? <p className="mt-2 text-[11px] text-[#1e4536]">{openCount} draft item(s)</p> : null}
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0 space-y-5 sm:space-y-6">
            <div className="min-w-0 rounded-[28px] border border-[#e8e1d6] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6 md:p-8">
              {!selected ? (
                <p className="text-sm text-[#5b554b]">Select an inquiry to review details.</p>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Inquiry details</p>
                      <h2 className="mt-2 break-words font-display text-3xl text-[#181612] sm:text-4xl">{selected.fullName}</h2>
                      <p className="mt-2 break-all text-sm text-[#5b554b]">{selected.email}</p>
                      {selected.phone ? <p className="text-sm text-[#5b554b]">{selected.phone}</p> : null}
                      <div className="mt-4 text-sm text-[#7b7468]">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${badgeClass(selected.status)}`}>
                          {formatStatusLabel(selected.status)}
                        </span>
                        {selected.status === "awaiting_guest" ? (
                          <p className="mt-2 font-medium text-[#8b7355]">{formatElapsedSince(latestOutboundSentAt(selected))}</p>
                        ) : null}
                        <p className="mt-2">{formatDate(selected.createdAt)}</p>
                        {(selected.checkIn || selected.checkOut) && (
                          <p className="mt-1">
                            {selected.checkIn || "?"} → {selected.checkOut || "?"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedInsights ? (
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#7b7468]">Lead score</p>
                        <p className="mt-2 text-3xl font-semibold text-[#181612]">{selectedInsights.leadScore}</p>
                        <div className="mt-2 flex gap-2">
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(selectedInsights.leadLabel)}`}>
                            {selectedInsights.leadLabel}
                          </span>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(selectedInsights.urgency)}`}>
                            {selectedInsights.urgency}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4 md:col-span-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#7b7468]">Assistant summary</p>
                        <p className="mt-2 text-sm leading-6 text-[#5b554b]">{selectedInsights.summary}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4 text-sm text-[#5b554b]">
                      {loadingInsightId === selected.id ? "Assistant is reviewing this inquiry…" : "Assistant insights will appear here once loaded."}
                    </div>
                  )}

                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Payment confirmation</p>
                        <p className="mt-2 text-sm leading-6 text-[#5b554b]">
                          Confirm what was received. The booking total uses the quote captured when the inquiry was submitted; current pricing changes are shown as context, not silently applied.
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(selected.paymentStatus)}`}>
                        {selected.paymentStatus.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b7468]">Booking total</p>
                        <p className="mt-1 text-xl font-light text-[#181612]">{formatMoney(calculatedReservationTotal)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b7468]">Deposit due</p>
                        <p className="mt-1 text-xl font-light text-[#181612]">{formatMoney(calculatedDepositAmount)}</p>
                        {paymentSettings.depositPercent > 0 ? <p className="mt-1 text-[11px] text-[#7b7468]">{paymentSettings.depositPercent}% deposit</p> : null}
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b7468]">Received so far</p>
                        <p className="mt-1 text-xl font-light text-[#181612]">{formatMoney(calculatedReceived)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7b7468]">Balance due</p>
                        <p className="mt-1 text-xl font-light text-[#181612]">{formatMoney(calculatedBalance)}</p>
                      </div>
                    </div>

                    {selected.pricingSnapshotNotice ? (
                      <div className="mt-4 rounded-2xl border border-[#ead8b8] bg-white p-4 text-sm leading-6 text-[#7b7468]">
                        {selected.pricingSnapshotNotice}
                      </div>
                    ) : null}

                    {!calculatedReservationTotal ? (
                      <div className="mt-4 rounded-2xl border border-[#ead8b8] bg-white p-4 text-sm leading-6 text-[#7b7468]">
                        {currentReservationTotal ? `No original quote snapshot is stored for this older inquiry. Current pricing is ${formatMoney(currentReservationTotal)}; use manual edit if you want to set the original quote.` : "Add or confirm inquiry dates to calculate payment amounts."}
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" onClick={() => { setPaymentConfirmationNote(""); setPaymentConfirmationAmount(String(calculatedDepositAmount || "")); setPaymentConfirmMode("deposit"); }} disabled={savingId === selected.id || isClosedInquiry || !calculatedDepositAmount} className="rounded-full bg-[#1e4536] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60 sm:tracking-[0.16em]">
                        Mark deposit received
                      </button>
                      <button type="button" onClick={() => { setPaymentConfirmationNote(""); setPaymentConfirmationAmount(String(calculatedReservationTotal || "")); setPaymentConfirmMode("full"); }} disabled={savingId === selected.id || isClosedInquiry || !calculatedReservationTotal} className="rounded-full bg-[#8b7355] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60 sm:tracking-[0.16em]">
                        Mark paid in full
                      </button>
                      <button type="button" onClick={() => setShowManualPaymentEdit((current) => !current)} className="rounded-full border border-[#d8cebf] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b554b] sm:tracking-[0.16em]">
                        {showManualPaymentEdit ? "Hide manual edit" : "Edit payment details"}
                      </button>
                    </div>

                    {paymentConfirmMode ? (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181612]/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="payment-confirmation-title">
                        <button type="button" aria-label="Close payment confirmation" onClick={() => setPaymentConfirmMode(null)} className="absolute inset-0 cursor-default" disabled={savingId === selected.id} />
                        <div className="relative max-h-[82vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[#e8e1d6] bg-[#fffaf2] p-5 pt-8 shadow-2xl sm:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7355]">Payment confirmation</p>
                              <h3 id="payment-confirmation-title" className="mt-2 text-2xl font-light text-[#181612]">
                                {paymentConfirmMode === "deposit" ? "Confirm deposit received" : "Confirm paid in full"}
                              </h3>
                            </div>
                            <button type="button" onClick={() => setPaymentConfirmMode(null)} disabled={savingId === selected.id} className="shrink-0 rounded-full border border-[#d8cebf] bg-white px-3 py-1.5 text-xs font-semibold text-[#5b554b] disabled:opacity-60">
                              Close
                            </button>
                          </div>
                          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Expected {paymentConfirmMode === "deposit" ? "deposit" : "full payment"}</p>
                            <p className="mt-1 text-3xl font-light text-[#1e4536]">{formatMoney(paymentConfirmMode === "deposit" ? calculatedDepositAmount : calculatedReservationTotal)}</p>
                          </div>
                          <div className="mt-4 grid gap-3">
                            <label className="block text-sm text-[#5b554b]">
                              <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Payment method</span>
                              <input autoFocus placeholder="Venmo, Zelle, wire…" value={paymentDraft.paymentMethod} onChange={(e) => setPaymentDraft((current) => ({ ...current, paymentMethod: e.target.value }))} className="mt-1 w-full rounded-xl border border-[#ddd4c7] bg-white px-3 py-3 text-base" />
                            </label>
                            <label className="block text-sm text-[#5b554b]">
                              <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Amount to record</span>
                              <input type="number" min={0} value={paymentConfirmationAmount} onChange={(e) => setPaymentConfirmationAmount(e.target.value)} className="mt-1 w-full rounded-xl border border-[#ddd4c7] bg-white px-3 py-3 text-base" />
                            </label>
                            <label className="block text-sm text-[#5b554b]">
                              <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Optional note</span>
                              <textarea rows={3} value={paymentConfirmationNote} onChange={(e) => setPaymentConfirmationNote(e.target.value)} className="mt-1 w-full rounded-xl border border-[#ddd4c7] bg-white px-3 py-3 text-base" />
                            </label>
                          </div>
                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <button type="button" onClick={() => void confirmGuidedPayment()} disabled={savingId === selected.id} className="rounded-full bg-[#1e4536] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60">
                              {paymentConfirmMode === "deposit" ? "Confirm deposit" : "Confirm paid in full"}
                            </button>
                            <button type="button" onClick={() => setPaymentConfirmMode(null)} disabled={savingId === selected.id} className="rounded-full border border-[#d8cebf] bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#5b554b] disabled:opacity-60">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {showManualPaymentEdit ? (
                      <div className="mt-4 rounded-2xl border border-[#e8e1d6] bg-white p-4">
                        <p className="text-sm font-medium text-[#1b1a17]">Manual payment details</p>
                        <div className="mt-3 grid gap-3 text-sm text-[#5b554b] sm:grid-cols-2">
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Reservation total</span>
                            <input type="number" min={0} value={paymentDraft.quotedAmount} onChange={(e) => setPaymentDraft((current) => ({ ...current, quotedAmount: e.target.value }))} className="mt-1 w-full rounded-xl border border-[#ddd4c7] px-3 py-2" />
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Payment status</span>
                            <select value={paymentDraft.paymentStatus} onChange={(e) => setPaymentDraft((current) => ({ ...current, paymentStatus: e.target.value as InquiryRecord["paymentStatus"] }))} className="mt-1 w-full rounded-xl border border-[#ddd4c7] px-3 py-2">
                              {paymentStatusOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                            </select>
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Deposit amount</span>
                            <input type="number" min={0} value={paymentDraft.depositAmount} onChange={(e) => setPaymentDraft((current) => ({ ...current, depositAmount: e.target.value }))} className="mt-1 w-full rounded-xl border border-[#ddd4c7] px-3 py-2" />
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Amount received</span>
                            <input type="number" min={0} value={paymentDraft.amountReceived} onChange={(e) => setPaymentDraft((current) => ({ ...current, amountReceived: e.target.value }))} className="mt-1 w-full rounded-xl border border-[#ddd4c7] px-3 py-2" />
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Payment method</span>
                            <input placeholder="Venmo, Zelle, wire…" value={paymentDraft.paymentMethod} onChange={(e) => setPaymentDraft((current) => ({ ...current, paymentMethod: e.target.value }))} className="mt-1 w-full rounded-xl border border-[#ddd4c7] px-3 py-2" />
                          </label>
                          <label className="block sm:col-span-2">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Confirmation note</span>
                            <textarea rows={3} value={paymentDraft.paymentNote} onChange={(e) => setPaymentDraft((current) => ({ ...current, paymentNote: e.target.value }))} className="mt-1 w-full rounded-xl border border-[#ddd4c7] px-3 py-2" />
                          </label>
                        </div>
                        <button type="button" onClick={() => void savePaymentState()} disabled={savingId === selected.id || isClosedInquiry} className="mt-4 rounded-full bg-[#1e4536] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60 sm:tracking-[0.16em]">
                          Save manual details
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Inquiry actions</p>
                    {isClosedInquiry ? (
                      <p className="mt-2 text-sm leading-6 text-[#5b554b]">
                        This inquiry is closed. Reopen it before confirming bookings, drafting replies, sending messages, or using AI revisions.
                      </p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {isClosedInquiry ? (
                        <button
                          type="button"
                          onClick={() => setShowReopenConfirm(true)}
                          disabled={savingId === selected.id}
                          className="rounded-full bg-[#1e4536] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60 sm:tracking-[0.16em]"
                        >
                          Reopen
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setBookingRevenue(String(estimatedRevenueFromInsights(selectedInsights) || ""));
                              setShowConfirmBooking((current) => !current);
                              setShowCloseInquiry(false);
                            }}
                            disabled={savingId === selected.id || selected.status === "booked"}
                            className="rounded-full bg-[#1e4536] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60 sm:tracking-[0.16em]"
                          >
                            Confirm booking
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCloseInquiry((current) => !current);
                              setShowConfirmBooking(false);
                            }}
                            disabled={savingId === selected.id}
                            className="rounded-full border border-[#d8cebf] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b554b] disabled:opacity-60 sm:tracking-[0.16em]"
                          >
                            Close inquiry
                          </button>
                        </>
                      )}
                    </div>

                    {showReopenConfirm ? (
                      <div className="mt-4 rounded-2xl border border-[#e8e1d6] bg-white p-4">
                        <p className="text-sm font-medium text-[#1b1a17]">Are you sure you want to reopen the inquiry?</p>
                        <p className="mt-2 text-xs leading-5 text-[#7b7468]">This will restore its previous status and re-enable drafting, AI revisions, sending, and booking actions.</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button type="button" onClick={() => void reopenInquiry()} disabled={savingId === selected.id} className="rounded-full bg-[#1e4536] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60 sm:tracking-[0.16em]">
                            Yes, reopen
                          </button>
                          <button type="button" onClick={() => setShowReopenConfirm(false)} disabled={savingId === selected.id} className="rounded-full border border-[#d8cebf] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b554b] disabled:opacity-60 sm:tracking-[0.16em]">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {showConfirmBooking && !isClosedInquiry ? (
                      <div className="mt-4 rounded-2xl border border-[#e8e1d6] bg-white p-4">
                        <p className="text-sm font-medium text-[#1b1a17]">Confirm reservation details</p>
                        <div className="mt-3 grid gap-3 text-sm text-[#5b554b] sm:grid-cols-2">
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Guest</span>
                            <input readOnly value={selected.fullName} className="mt-1 w-full rounded-xl border border-[#ddd4c7] bg-[#faf8f3] px-3 py-2" />
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Email</span>
                            <input readOnly value={selected.email} className="mt-1 w-full rounded-xl border border-[#ddd4c7] bg-[#faf8f3] px-3 py-2" />
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Check-in</span>
                            <input readOnly value={selected.checkIn || "Missing"} className="mt-1 w-full rounded-xl border border-[#ddd4c7] bg-[#faf8f3] px-3 py-2" />
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Check-out</span>
                            <input readOnly value={selected.checkOut || "Missing"} className="mt-1 w-full rounded-xl border border-[#ddd4c7] bg-[#faf8f3] px-3 py-2" />
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Nights</span>
                            <input readOnly value={daysBetweenDates(selected.checkIn, selected.checkOut)} className="mt-1 w-full rounded-xl border border-[#ddd4c7] bg-[#faf8f3] px-3 py-2" />
                          </label>
                          <label className="block">
                            <span className="text-xs uppercase tracking-[0.14em] text-[#7b7468]">Total revenue</span>
                            <input type="number" min={0} value={bookingRevenue} onChange={(e) => setBookingRevenue(e.target.value)} className="mt-1 w-full rounded-xl border border-[#ddd4c7] px-3 py-2" />
                          </label>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-[#7b7468]">This creates a confirmed direct reservation and marks the inquiry booked. Next useful fields: deposit amount/status, payment link status, rental agreement status, and booking source.</p>
                        <button type="button" onClick={() => void confirmBooking()} disabled={savingId === selected.id} className="mt-4 rounded-full bg-[#1e4536] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60 sm:tracking-[0.16em]">
                          Create reservation
                        </button>
                      </div>
                    ) : null}

                    {showCloseInquiry && !isClosedInquiry ? (
                      <div className="mt-4 rounded-2xl border border-[#e8e1d6] bg-white p-4">
                        <label className="block text-sm font-medium text-[#1b1a17]">Why is this inquiry being closed?</label>
                        <select value={closeReason} onChange={(e) => setCloseReason(e.target.value)} className="mt-3 w-full rounded-xl border border-[#ddd4c7] px-3 py-2 text-sm">
                          {closeReasons.map((reason) => (<option key={reason} value={reason}>{reason}</option>))}
                        </select>
                        <button type="button" onClick={() => void closeInquiry()} disabled={savingId === selected.id} className="mt-4 rounded-full border border-[#b42318] bg-[#fbefef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#b42318] disabled:opacity-60 sm:tracking-[0.16em]">
                          Close inquiry
                        </button>
                      </div>
                    ) : null}
                  </div>


                </div>
              )}
            </div>

            {selected && selectedInsights ? (
              <div className="min-w-0 rounded-[28px] border border-[#e8e1d6] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Assistant triage</p>
                    <h3 className="mt-2 font-display text-3xl text-[#181612]">What matters here</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadInsights(selected.id, true)}
                    disabled={loadingInsightId === selected.id || !shouldLoadAssistantInsights}
                    className="rounded-full border border-[#ddd4c7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#5b554b] disabled:opacity-60"
                  >
                    {loadingInsightId === selected.id ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#7b7468]">Key facts</p>
                    <div className="mt-3 space-y-2 text-sm text-[#5b554b]">
                      {selectedInsights.keyFacts.map((fact) => (
                        <div key={fact.label} className="flex items-start justify-between gap-4">
                          <span className="font-medium text-[#1b1a17]">{fact.label}</span>
                          <span className="text-right">{fact.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#7b7468]">Suggested next action</p>
                    <p className="mt-3 text-sm leading-6 text-[#5b554b]">{selectedInsights.suggestedNextAction}</p>
                  </div>

                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#7b7468]">Score reasons</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5b554b]">
                      {selectedInsights.scoreReasons.map((reason) => (
                        <li key={reason}>• {reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#7b7468]">Missing info</p>
                    {selectedInsights.missingInfo.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5b554b]">
                        {selectedInsights.missingInfo.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-[#5b554b]">Nothing critical missing. This one is ready for a clean, direct reply.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4 md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#7b7468]">Guest-flow signals</p>
                    {selectedInsights.guestFlowSignals.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5b554b]">
                        {selectedInsights.guestFlowSignals.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-[#5b554b]">
                        No configuration conflicts detected between the guest-facing flow and the current inquiry.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="min-w-0 rounded-[28px] border border-[#e8e1d6] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] sm:p-6 md:p-8 xl:col-start-2">
            {!selected ? (
              <p className="text-sm text-[#5b554b]">Select an inquiry to draft a response.</p>
            ) : !composer ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Reply workspace</p>
                  <h3 className="mt-2 font-display text-3xl text-[#181612]">No open draft</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b554b]">
                    There is no active response waiting for this conversation. When the guest replies, DirectStay will generate the next draft automatically. You can also start a proactive message now.
                  </p>
                </div>
                  <button
                  type="button"
                  onClick={startNewDraft}
                  disabled={isClosedInquiry}
                  className="inline-flex max-w-full items-center justify-center rounded-full bg-[#1e4536] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-sm hover:bg-[#18372b] disabled:opacity-60 sm:px-5 sm:tracking-[0.18em]"
                >
                  Start new draft
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Reply workspace</p>
                  <h3 className="mt-2 font-display text-2xl text-[#181612] sm:text-3xl">Draft response</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5b554b]">
                    Assistant suggestions below are grounded in live dates, minimum stay, direct pricing, payment setup, and the current conversation — not just generic word soup pretending to be helpful.
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <label className="block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Draft body</label>
                    {isAiGeneratedDraft ? (
                      <span className="rounded-full bg-[#eef6f1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1e4536]">
                        ✨ Generated by ChatGPT
                      </span>
                    ) : null}
                  </div>
                  <textarea
                    value={composer.body}
                    onChange={(e) => setComposer((current) => (current ? { ...current, body: e.target.value } : current))}
                    rows={16}
                    disabled={!canEditCurrentDraft}
                    className="w-full min-w-0 rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm leading-6 disabled:bg-[#faf8f3] disabled:text-[#7b7468]"
                  />
                  {isAiWorkingOnDraft ? <p className="mt-2 text-xs font-medium text-[#1e4536]">Assistant is updating this draft…</p> : null}
                </div>

                <div className="flex min-w-0 flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void saveDraft("draft")}
                    disabled={savingId === selected.id || !canEditCurrentDraft || !hasDraftChanges}
                    className={`inline-flex max-w-full items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed sm:px-5 sm:tracking-[0.18em] ${
                      hasDraftChanges && canEditCurrentDraft
                        ? "bg-[#1e4536] text-white shadow-sm hover:bg-[#18372b]"
                        : "border border-[#ddd4c7] bg-[#faf8f3] text-[#a39a8c]"
                    }`}
                  >
                    {savingId === selected.id ? "Saving..." : "Save draft"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void sendApprovedDraft()}
                    disabled={savingId === selected.id || !composer.id || !canEditCurrentDraft || !composer.body.trim()}
                    className="inline-flex max-w-full items-center justify-center rounded-full border border-[#8b7355] bg-[#f6f2ea] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b7355] disabled:opacity-60 sm:px-5 sm:tracking-[0.18em]"
                  >
                    {composer.id ? "Send reply" : "Save draft before sending"}
                  </button>
                </div>

                <div className="min-w-0 rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4 text-sm text-[#5b554b]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#1b1a17]">Revise with AI</p>
                      <p className="mt-1 text-xs leading-5 text-[#7b7468]">
                        Ask the assistant to revise the current unsent draft. Your existing draft stays in place while the AI update is prepared.
                      </p>
                      {!canReviseCurrentDraft ? (
                        <p className="mt-2 text-xs font-medium text-[#8b7355]">
                          {isAiWorkingOnDraft ? "AI is currently updating this draft." : `This draft is ${formatStatusLabel(composer.status)}.`}
                        </p>
                      ) : null}
                      {pollingRevisionDraftId === composer.id ? (
                        <p className="mt-2 text-xs font-medium text-[#1e4536]">Assistant is revising this draft…</p>
                      ) : null}
                      {pollingUpgradeDraftId === composer.id ? (
                        <p className="mt-2 text-xs font-medium text-[#1e4536]">Watching for the ChatGPT upgrade…</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                    {[
                      ["shorter", "Shorter"],
                      ["warmer", "Warmer"],
                      ["direct", "More direct"],
                    ].map(([intent, label]) => (
                      <button
                        key={intent}
                        type="button"
                        onClick={() => void requestAiRevision(intent as "shorter" | "warmer" | "direct")}
                        disabled={!composer.id || !canReviseCurrentDraft || Boolean(revisionId) || pollingRevisionDraftId === composer.id}
                        className="rounded-full border border-[#ddd4c7] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b554b] disabled:opacity-60 sm:px-4 sm:tracking-[0.16em]"
                      >
                        {revisionId === intent ? "Queued..." : label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    <label className="block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Custom AI instruction</label>
                    <textarea
                      value={customRevision}
                      onChange={(e) => setCustomRevision(e.target.value.slice(0, 1000))}
                      rows={3}
                      placeholder="Tell the assistant what to change — e.g. sound more like me, mention flexible arrival, or ask about kids."
                      className="w-full min-w-0 rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm leading-6"
                    />
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                      <p className="text-[11px] text-[#7b7468]">AI uses only this inquiry and this guest's DirectStay context.</p>
                      <button
                        type="button"
                        onClick={() => void requestAiRevision("custom")}
                        disabled={!composer.id || !canReviseCurrentDraft || Boolean(revisionId) || pollingRevisionDraftId === composer.id || !customRevision.trim()}
                        className="rounded-full bg-[#1e4536] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60 sm:px-4 sm:tracking-[0.16em]"
                      >
                        {revisionId === "custom" ? "Queued..." : "Revise with AI"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


          {selected ? (
            <div className="min-w-0 mt-5 sm:mt-6 xl:col-start-2">
                  <div className="min-w-0 rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4 sm:p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Conversation timeline</p>
                    <div className="mt-4 space-y-3">
                      {selected.messages.map((message) => (
                        <details key={message.id} className="group min-w-0 rounded-2xl border border-[#e8e1d6] bg-white p-4">
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(message.direction)}`}>
                                  {message.direction}
                                </span>
                                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(message.authorType)}`}>
                                  {message.authorType}
                                </span>
                                <span className="text-xs text-[#7b7468]">{messageMeta(message)}</span>
                              </div>
                              <p className="mt-2 truncate text-sm leading-6 text-[#5b554b]">{messagePreview(message)}</p>
                            </div>
                            <span className="mt-1 shrink-0 rounded-full border border-[#ddd4c7] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7b7468] transition group-open:bg-[#1e4536] group-open:text-white sm:px-3 sm:tracking-[0.16em]">
                              <span className="group-open:hidden">Expand</span>
                              <span className="hidden group-open:inline">Collapse</span>
                            </span>
                          </summary>
                          <div className="mt-4 border-t border-[#e8e1d6] pt-4">
                            {message.subject ? <p className="text-sm font-medium text-[#1b1a17]">{message.subject}</p> : null}
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#5b554b]">{message.body}</p>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
            </div>
          ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
