"use client";

import { useEffect, useMemo, useState } from "react";
import type { InquiryRecord } from "@/lib/inquiries";

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

export default function OwnerInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const updateStatus = async (id: string, status: InquiryRecord["status"]) => {
    setSavingId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(apiUrl("/api/owner-portal/inquiries"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to update inquiry");
      setInquiries((current) => current.map((inquiry) => (inquiry.id === id ? data.inquiry : inquiry)));
      setSuccess(`Inquiry marked ${status}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update inquiry");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Inquiries</p>
        <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Review and triage guest inquiries</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b554b]">
          See incoming guest requests, review dates and messages, and move each inquiry through reply, approval,
          decline, or conversion.
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
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Queue</p>
            <div className="mt-4 space-y-2">
              {inquiries.map((inquiry) => (
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
                </button>
              ))}
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

                <div className="rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Message</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5b554b]">
                    {selected.message || "No message included."}
                  </p>
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Update status</p>
                  <div className="flex flex-wrap gap-3">
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
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
