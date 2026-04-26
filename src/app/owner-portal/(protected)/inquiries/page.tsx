"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { InquiryCopilotDraftOption, InquiryCopilotInsights } from "@/lib/inquiryCopilot";
import type { InquiryDraftRecord, InquiryRecord, InquiryThreadRecord } from "@/lib/inquiries";

function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

const statusOptions: InquiryRecord["status"][] = ["new", "replied", "approved", "declined", "converted"];

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

function messageMeta(message: InquiryThreadRecord["messages"][number]) {
  if (message.sentAt) return `Sent ${formatDate(message.sentAt)}`;
  if (message.receivedAt) return `Received ${formatDate(message.receivedAt)}`;
  return formatDate(message.createdAt);
}

function badgeClass(value: string) {
  if (value === "sent" || value === "converted" || value === "hot" || value === "high") return "bg-[#eef6f1] text-[#1e4536]";
  if (value === "approved" || value === "warm" || value === "medium") return "bg-[#f6f2ea] text-[#8b7355]";
  if (value === "declined" || value === "cold" || value === "low") return "bg-[#fbefef] text-[#b42318]";
  return "bg-[#f7f3eb] text-[#5b554b]";
}

interface DraftComposer {
  id?: string;
  subject: string;
  body: string;
  status: InquiryDraftRecord["status"];
}

function isSavedDraft(draft: InquiryDraftRecord | InquiryCopilotDraftOption | null | undefined): draft is InquiryDraftRecord {
  return Boolean(draft && "id" in draft);
}

function composeFromDraft(draft?: InquiryDraftRecord | InquiryCopilotDraftOption | null, inquiry?: InquiryThreadRecord | null): DraftComposer {
  return {
    id: isSavedDraft(draft) ? draft.id : undefined,
    subject: draft?.subject || `Re: ${inquiry?.fullName || "Guest Inquiry"}`,
    body: draft?.body || "",
    status: isSavedDraft(draft) ? draft.status : "draft",
  };
}

export default function OwnerInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryThreadRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composer, setComposer] = useState<DraftComposer | null>(null);
  const [insightsById, setInsightsById] = useState<Record<string, InquiryCopilotInsights>>({});
  const [loading, setLoading] = useState(true);
  const [loadingInsightId, setLoadingInsightId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
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

  useEffect(() => {
    const latestDraft = selected?.drafts?.[0] || null;
    setComposer(selected ? composeFromDraft(latestDraft, selected) : null);
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

  const sendApprovedDraft = async () => {
    if (!selected || !composer?.id) return;

    setSavingId(selected.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(apiUrl("/api/owner-portal/inquiries"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", inquiryId: selected.id, draftId: composer.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to send approved draft");
      await reloadInquiries();
      void loadInsights(selected.id, true);
      setSuccess("Approved draft sent and logged to the conversation.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send approved draft");
    } finally {
      setSavingId(null);
    }
  };

  const applyDraftOption = (option: InquiryCopilotDraftOption) => {
    setComposer({ id: undefined, subject: option.subject, body: option.body, status: "draft" });
    setSuccess(`Loaded assistant suggestion: ${option.label}.`);
    setError("");
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Inquiries</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Review and manage full guest conversations</h1>
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
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_460px]">
          <aside className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Queue</p>
              <button
                type="button"
                onClick={() => selectedId && void loadInsights(selectedId, true)}
                disabled={!selectedId || loadingInsightId === selectedId}
                className="rounded-full border border-[#ddd4c7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5b554b] disabled:opacity-60"
              >
                {loadingInsightId === selectedId ? "Refreshing..." : "Refresh assistant"}
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {inquiries.map((inquiry) => {
                const openCount = inquiry.drafts.filter((draft) => draft.status !== "sent").length;
                const insight = insightsById[inquiry.id];
                return (
                  <button
                    key={inquiry.id}
                    type="button"
                    onClick={() => setSelectedId(inquiry.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      inquiry.id === selectedId ? "border-[#1e4536] bg-[#eef6f1]" : "border-[#e8e1d6] hover:bg-[#f4efe6]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-[#1b1a17]">{inquiry.fullName}</p>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${badgeClass(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </div>
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

          <div className="space-y-6">
            <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
              {!selected ? (
                <p className="text-sm text-[#5b554b]">Select an inquiry to review details.</p>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Inquiry details</p>
                      <h2 className="mt-2 font-display text-4xl text-[#181612]">{selected.fullName}</h2>
                      <p className="mt-2 text-sm text-[#5b554b]">{selected.email}</p>
                      {selected.phone ? <p className="text-sm text-[#5b554b]">{selected.phone}</p> : null}
                    </div>
                    <div className="text-right text-sm text-[#7b7468]">
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
                          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                            selected.status === status
                              ? "bg-[#1e4536] text-white"
                              : "border border-[#ddd4c7] bg-white text-[#5b554b] hover:bg-[#f7f3eb]"
                          } disabled:opacity-60`}
                        >
                          {savingId === selected.id && selected.status !== status ? "Saving..." : status}
                        </button>
                      ))}
                      {selectedInsights ? (
                        <button
                          type="button"
                          onClick={() => void updateStatus(selected.id, selectedInsights.recommendedStatus)}
                          disabled={savingId === selected.id || selected.status === selectedInsights.recommendedStatus}
                          className="rounded-full border border-[#8b7355] bg-[#f6f2ea] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b7355] disabled:opacity-60"
                        >
                          Apply suggested status
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Conversation timeline</p>
                    <div className="mt-4 space-y-3">
                      {selected.messages.map((message) => (
                        <div key={message.id} className="rounded-2xl border border-[#e8e1d6] bg-white p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(message.direction)}`}>
                                {message.direction}
                              </span>
                              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(message.authorType)}`}>
                                {message.authorType}
                              </span>
                            </div>
                            <p className="text-xs text-[#7b7468]">{messageMeta(message)}</p>
                          </div>
                          {message.subject ? <p className="mt-2 text-sm text-[#5b554b]">{message.subject}</p> : null}
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5b554b]">{message.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selected && selectedInsights ? (
              <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
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

          <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
            {!selected || !composer ? (
              <p className="text-sm text-[#5b554b]">Select an inquiry to draft a response.</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Reply workspace</p>
                  <h3 className="mt-2 font-display text-3xl text-[#181612]">Draft response</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5b554b]">
                    Assistant suggestions below are grounded in live dates, minimum stay, direct pricing, payment setup, and the current conversation — not just generic word soup pretending to be helpful.
                  </p>
                </div>

                {selectedInsights ? (
                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4 text-sm text-[#5b554b]">
                    <p className="font-medium text-[#1b1a17]">Assistant shortcuts</p>
                    <div className="mt-3 grid gap-3">
                      {selectedInsights.draftOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => applyDraftOption(option)}
                          className="rounded-2xl border border-[#e8e1d6] bg-white px-4 py-3 text-left transition hover:bg-[#fdfbf7]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-[#1b1a17]">{option.label}</span>
                            <span className="rounded-full bg-[#eef6f1] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1e4536]">Load</span>
                          </div>
                          <p className="mt-1 text-xs text-[#7b7468]">{option.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selected.drafts.length > 0 ? (
                  <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4 text-sm text-[#5b554b]">
                    <p className="font-medium text-[#1b1a17]">Tracked drafts</p>
                    <div className="mt-3 space-y-2">
                      {selected.drafts.map((draft) => (
                        <button
                          key={draft.id}
                          type="button"
                          onClick={() => setComposer(composeFromDraft(draft, selected))}
                          className="w-full rounded-xl border border-[#e8e1d6] bg-white px-3 py-3 text-left"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-[#1b1a17]">{draft.subject || "Untitled draft"}</span>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeClass(draft.status)}`}>
                              {formatStatusLabel(draft.status)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#7b7468]">Updated {formatDate(draft.updatedAt)}</p>
                          {draft.sentAt ? <p className="mt-1 text-xs text-[#1e4536]">Sent {formatDate(draft.sentAt)}</p> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Subject</label>
                  <input
                    value={composer.subject}
                    onChange={(e) => setComposer((current) => (current ? { ...current, subject: e.target.value } : current))}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Draft body</label>
                  <textarea
                    value={composer.body}
                    onChange={(e) => setComposer((current) => (current ? { ...current, body: e.target.value } : current))}
                    rows={16}
                    className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm leading-6"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void saveDraft("draft")}
                    disabled={savingId === selected.id}
                    className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60"
                  >
                    {savingId === selected.id ? "Saving..." : "Save draft"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveDraft("pending_owner_approval")}
                    disabled={savingId === selected.id}
                    className="inline-flex items-center justify-center rounded-full border border-[#ddd4c7] bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b554b] disabled:opacity-60"
                  >
                    Ready for approval
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveDraft("approved")}
                    disabled={savingId === selected.id}
                    className="inline-flex items-center justify-center rounded-full border border-[#1e4536] bg-[#eef6f1] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1e4536] disabled:opacity-60"
                  >
                    Approve draft
                  </button>
                  <button
                    type="button"
                    onClick={() => void sendApprovedDraft()}
                    disabled={savingId === selected.id || !composer.id || composer.status !== "approved"}
                    className="inline-flex items-center justify-center rounded-full border border-[#8b7355] bg-[#f6f2ea] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b7355] disabled:opacity-60"
                  >
                    Send approved draft
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
