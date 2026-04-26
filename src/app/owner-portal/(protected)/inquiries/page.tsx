"use client";

import { useEffect, useMemo, useState } from "react";
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

interface DraftComposer {
  id?: string;
  subject: string;
  body: string;
  status: InquiryDraftRecord["status"];
}

function composeFromDraft(draft?: InquiryDraftRecord | null, inquiry?: InquiryThreadRecord | null): DraftComposer {
  return {
    id: draft?.id,
    subject: draft?.subject || `Re: ${inquiry?.fullName || "Guest Inquiry"}`,
    body: draft?.body || "",
    status: draft?.status || "draft",
  };
}

export default function OwnerInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryThreadRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composer, setComposer] = useState<DraftComposer | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reloadInquiries = async () => {
    const response = await fetch(apiUrl("/api/owner-portal/inquiries"), { cache: "no-store", credentials: "same-origin" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Failed to load inquiries");
    setInquiries(data.inquiries);
    setSelectedId((current) => current || data.inquiries[0]?.id || null);
  };

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

  useEffect(() => {
    const latestDraft = selected?.drafts?.[0] || null;
    setComposer(selected ? composeFromDraft(latestDraft, selected) : null);
    setSuccess("");
    setError("");
  }, [selectedId, selected]);

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
      setSuccess("Approved draft sent and logged to the conversation.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send approved draft");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Inquiries</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Review and manage full guest conversations</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b554b]">
          Each inquiry can become a full thread: inbound guest messages, assistant drafts, owner edits/approval, sent replies, and later guest follow-ups.
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
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_420px]">
          <aside className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Queue</p>
            <div className="mt-4 space-y-2">
              {inquiries.map((inquiry) => {
                const openCount = inquiry.drafts.filter((draft) => draft.status !== "sent").length;
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
                      <span className="rounded-full bg-[#f7f3eb] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5b554b]">
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#7b7468]">{formatDate(inquiry.createdAt)}</p>
                    {(inquiry.checkIn || inquiry.checkOut) && (
                      <p className="mt-1 text-xs text-[#7b7468]">
                        {inquiry.checkIn || "?"} → {inquiry.checkOut || "?"}
                      </p>
                    )}
                    {openCount > 0 ? <p className="mt-1 text-[11px] text-[#1e4536]">{openCount} draft item(s)</p> : null}
                  </button>
                );
              })}
            </div>
          </aside>

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
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Conversation timeline</p>
                  <div className="mt-4 space-y-3">
                    {selected.messages.map((message) => (
                      <div key={message.id} className="rounded-2xl border border-[#e8e1d6] bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-medium text-[#1b1a17]">{message.authorType} · {message.direction}</p>
                          <p className="text-xs text-[#7b7468]">{formatDate(message.createdAt)}</p>
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

          <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
            {!selected || !composer ? (
              <p className="text-sm text-[#5b554b]">Select an inquiry to draft a response.</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Reply workspace</p>
                  <h3 className="mt-2 font-display text-3xl text-[#181612]">Draft response</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5b554b]">
                    Assistant drafts can be edited by the owner, marked ready for approval, approved, and then sent as real email replies. Guest responses can come back into this thread via the reply webhook.
                  </p>
                </div>

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
                            <span className="rounded-full bg-[#f7f3eb] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5b554b]">
                              {draft.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#7b7468]">Updated {formatDate(draft.updatedAt)}</p>
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
                    rows={14}
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
