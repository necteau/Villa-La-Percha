"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { InquiryCopilotInsights } from "@/lib/inquiryCopilot";
import type { InquiryDraftRecord, InquiryRecord, InquiryThreadRecord } from "@/lib/inquiries";
import { buildInquiryEmailSubject } from "@/lib/inquirySubject";

function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

const statusOptions: InquiryRecord["status"][] = ["needs_reply", "awaiting_guest", "booked", "closed"];

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
  const [inquiries, setInquiries] = useState<InquiryThreadRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reloadInquiries = useCallback(async () => {
    const response = await fetch(apiUrl("/api/owner-portal/inquiries"), { cache: "no-store", credentials: "same-origin" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Failed to load inquiries");
    setInquiries(data.inquiries);
    setSelectedId((current) => current || data.inquiries[0]?.id || null);
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
          setInquiries(data.inquiries);
          setSelectedId((current) => current || data.inquiries[0]?.id || null);
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

  const selectedInsights = selectedId ? insightsById[selectedId] : undefined;
  const openDrafts = useMemo(
    () => selected?.drafts.filter((draft) => draft.createdByType !== "system" && draft.status !== "sent") || [],
    [selected]
  );
  const selectedDraft = composer?.id ? openDrafts.find((draft) => draft.id === composer.id) : undefined;
  const isAiWorkingOnDraft = Boolean(composer?.id && (pollingRevisionDraftId === composer.id || pollingUpgradeDraftId === composer.id));
  const canReviseCurrentDraft = composer?.status === "draft" && !isAiWorkingOnDraft;
  const canEditCurrentDraft = composer?.status !== "sent" && !isAiWorkingOnDraft;
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
    setSuccess("");
    setError("");
    if (selected?.id) void loadInsights(selected.id);
  }, [selectedId, selected, loadInsights]);


  const updateStatus = async (id: string, status: InquiryRecord["status"]) => {
    setSavingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(apiUrl("/api/owner-portal/inquiries"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", id, status }),
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
    const timeoutMs = 90_000;

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

    if (options.mode === "revision") setPollingRevisionDraftId(null);
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
      setSuccess("AI revision queued. The assistant will update this draft shortly.");
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
                disabled={!selectedId || loadingInsightId === selectedId}
                className="shrink-0 rounded-full border border-[#ddd4c7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5b554b] disabled:opacity-60 sm:tracking-[0.16em]"
              >
                {loadingInsightId === selectedId ? "Refreshing..." : "Refresh assistant"}
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {inquiries.map((inquiry) => {
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
                    </div>
                    <div className="text-left text-sm text-[#7b7468] sm:text-right">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${badgeClass(selected.status)}`}>
                        {formatStatusLabel(selected.status)}
                      </span>
                      {selected.status === "awaiting_guest" ? (
                        <p className="mt-2 font-medium text-[#8b7355]">{formatElapsedSince(latestOutboundSentAt(selected))}</p>
                      ) : null}
                      <p>{formatDate(selected.createdAt)}</p>
                      {(selected.checkIn || selected.checkOut) && (
                        <p className="mt-1">
                          {selected.checkIn || "?"} → {selected.checkOut || "?"}
                        </p>
                      )}
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

                  <div>
                    <div className="mb-3 flex flex-wrap gap-3">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => void updateStatus(selected.id, status)}
                          disabled={savingId === selected.id || selected.status === status}
                          className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition sm:px-4 sm:tracking-[0.18em] ${
                            selected.status === status
                              ? "bg-[#1e4536] text-white"
                              : "border border-[#ddd4c7] bg-white text-[#5b554b] hover:bg-[#f7f3eb]"
                          } disabled:opacity-60`}
                        >
                          {savingId === selected.id && selected.status !== status ? "Saving..." : formatStatusLabel(status)}
                        </button>
                      ))}
                      {selectedInsights ? (
                        <button
                          type="button"
                          onClick={() => void updateStatus(selected.id, selectedInsights.recommendedStatus)}
                          disabled={savingId === selected.id || selected.status === selectedInsights.recommendedStatus}
                          className="rounded-full border border-[#8b7355] bg-[#f6f2ea] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b7355] disabled:opacity-60 sm:px-4 sm:tracking-[0.18em]"
                        >
                          Apply suggested status
                        </button>
                      ) : null}
                    </div>
                  </div>

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
                    disabled={loadingInsightId === selected.id}
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
                    {selectedInsights.objectionSignals.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedInsights.objectionSignals.map((signal) => (
                          <span key={signal} className="rounded-full bg-[#f6f2ea] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                            {signal}
                          </span>
                        ))}
                      </div>
                    ) : null}
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
                  className="inline-flex max-w-full items-center justify-center rounded-full bg-[#1e4536] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-sm hover:bg-[#18372b] sm:px-5 sm:tracking-[0.18em]"
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
          </div>
        </div>
      )}
    </section>
  );
}
