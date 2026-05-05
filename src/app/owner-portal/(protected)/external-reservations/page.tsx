"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

type SourceStatus = "ACTIVE" | "CANCELLED" | "MISSING";

interface ExternalReservation {
  id: string;
  source: string;
  externalReservationId: string;
  sourceStatus: SourceStatus;
  matchStatus: string;
  reservationId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  totalAmount?: number;
  currency: string;
  notes?: string;
  blocksAvailability: boolean;
  updatedAt: string;
}

interface ExternalReservationDraft {
  source: string;
  externalReservationId: string;
  sourceStatus: SourceStatus;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalAmount: string;
  currency: string;
  notes: string;
}

const emptyDraft = (): ExternalReservationDraft => ({
  source: "VRBO",
  externalReservationId: "",
  sourceStatus: "ACTIVE",
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  checkIn: "",
  checkOut: "",
  totalAmount: "",
  currency: "USD",
  notes: "",
});

function toDraft(record: ExternalReservation): ExternalReservationDraft {
  return {
    source: record.source,
    externalReservationId: record.externalReservationId,
    sourceStatus: record.sourceStatus,
    guestName: record.guestName || "",
    guestEmail: record.guestEmail || "",
    guestPhone: record.guestPhone || "",
    checkIn: record.checkIn,
    checkOut: record.checkOut,
    totalAmount: record.totalAmount ? String(record.totalAmount) : "",
    currency: record.currency || "USD",
    notes: record.notes || "",
  };
}

function payloadFromDraft(draft: ExternalReservationDraft) {
  return {
    ...draft,
    totalAmount: draft.totalAmount ? Number(draft.totalAmount) : undefined,
  };
}

function statusLabel(status: SourceStatus) {
  if (status === "ACTIVE") return "Blocks availability";
  if (status === "CANCELLED") return "Cancelled";
  return "Missing from source";
}

export default function ExternalReservationsPage() {
  const [records, setRecords] = useState<ExternalReservation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExternalReservationDraft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selected = useMemo(() => selectedId ? records.find((record) => record.id === selectedId) || null : null, [records, selectedId]);
  const activeCount = records.filter((record) => record.sourceStatus === "ACTIVE").length;
  const linkedCount = records.filter((record) => Boolean(record.reservationId)).length;

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiUrl("/api/owner-portal/external-reservations/manual"), { cache: "no-store", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to load external reservations");
      const nextRecords = data.externalReservations as ExternalReservation[];
      setRecords(nextRecords);
      setSelectedId((current) => current && nextRecords.some((record) => record.id === current) ? current : nextRecords[0]?.id || null);
      if (!nextRecords.length) setDraft(emptyDraft());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load external reservations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    if (selected) setDraft(toDraft(selected));
  }, [selected]);

  const createNew = () => {
    setSelectedId(null);
    setDraft(emptyDraft());
    setSuccess("");
    setError("");
  };

  const saveDraft = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(apiUrl(selectedId ? `/api/owner-portal/external-reservations/manual/${encodeURIComponent(selectedId)}` : "/api/owner-portal/external-reservations/manual"), {
        method: selectedId ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromDraft(draft)),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to save external reservation");
      setSuccess(selectedId ? "External reservation saved." : "External reservation added and now blocks availability.");
      await loadRecords();
      setSelectedId(data.externalReservation.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save external reservation");
    } finally {
      setSaving(false);
    }
  };

  const deleteSelected = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(apiUrl(`/api/owner-portal/external-reservations/manual/${encodeURIComponent(selectedId)}`), { method: "DELETE", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to delete external reservation");
      setSuccess("External reservation deleted.");
      setSelectedId(null);
      setDraft(emptyDraft());
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete external reservation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">External reservations</p>
            <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">OTA blocks + owner holds</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b554b]">
              Track Airbnb, VRBO, owner-use, and other outside bookings without exposing unnecessary guest details. Active external reservations block availability and appear on the owner calendar separately from DirectStay reservations.
            </p>
          </div>
          <button type="button" onClick={createNew} className="rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#18372b]">
            Add external block
          </button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#faf8f3] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[#7b7468]">Total</p><p className="mt-1 text-3xl font-light text-[#181612]">{records.length}</p></div>
          <div className="rounded-2xl bg-[#eff6f1] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[#1e4536]">Blocking</p><p className="mt-1 text-3xl font-light text-[#1e4536]">{activeCount}</p></div>
          <div className="rounded-2xl bg-[#f7f0e6] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[#8b7355]">Linked</p><p className="mt-1 text-3xl font-light text-[#8b7355]">{linkedCount}</p></div>
        </div>
        {error ? <p className="mt-4 text-sm text-[#b42318]">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-[#1e4536]">{success}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
          <h2 className="font-display text-3xl text-[#181612]">Blocks</h2>
          <div className="mt-5 space-y-3">
            {loading ? <p className="text-sm text-[#7b7468]">Loading…</p> : null}
            {!loading && records.length === 0 ? <p className="rounded-2xl border border-dashed border-[#e8e1d6] p-4 text-sm text-[#7b7468]">No external reservations yet. Add one when an Airbnb/VRBO/owner-use date needs to block direct availability.</p> : null}
            {records.map((record) => (
              <button key={record.id} type="button" onClick={() => setSelectedId(record.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedId === record.id ? "border-[#1e4536] bg-[#eff6f1]" : "border-[#eadfce] bg-[#fbf8f1] hover:bg-[#f4efe6]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#181612]">{record.source} · {record.checkIn} → {record.checkOut}</p>
                    <p className="mt-1 text-xs text-[#7b7468]">{record.guestName || "Guest details hidden/not entered"}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${record.sourceStatus === "ACTIVE" ? "bg-[#1e4536] text-white" : "bg-[#eee7dc] text-[#7b7468]"}`}>{statusLabel(record.sourceStatus)}</span>
                </div>
                <p className="mt-2 text-xs text-[#7b7468]">Source ID: {record.externalReservationId}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">{selectedId ? "Edit block" : "New block"}</p>
              <h2 className="mt-1 font-display text-3xl text-[#181612]">Availability details</h2>
            </div>
            {selectedId ? <button type="button" onClick={deleteSelected} disabled={saving} className="rounded-full border border-[#d9a08a] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9f3d22] disabled:opacity-60">Delete</button> : null}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#3f3a33]">Source<select value={draft.source} onChange={(e) => setDraft((current) => ({ ...current, source: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[#ddd4c7] bg-white px-4 py-3 text-sm"><option>VRBO</option><option>Airbnb</option><option>Owner</option><option>Manual</option><option>Other</option></select></label>
            <label className="text-sm font-medium text-[#3f3a33]">Status<select value={draft.sourceStatus} onChange={(e) => setDraft((current) => ({ ...current, sourceStatus: e.target.value as SourceStatus }))} className="mt-2 w-full rounded-2xl border border-[#ddd4c7] bg-white px-4 py-3 text-sm"><option value="ACTIVE">Active / block availability</option><option value="CANCELLED">Cancelled / do not block</option><option value="MISSING">Missing from source</option></select></label>
            <label className="text-sm font-medium text-[#3f3a33]">Check-in<input type="date" value={draft.checkIn} onChange={(e) => setDraft((current) => ({ ...current, checkIn: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[#ddd4c7] px-4 py-3 text-sm" /></label>
            <label className="text-sm font-medium text-[#3f3a33]">Check-out<input type="date" value={draft.checkOut} onChange={(e) => setDraft((current) => ({ ...current, checkOut: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[#ddd4c7] px-4 py-3 text-sm" /></label>
            <label className="text-sm font-medium text-[#3f3a33]">Guest name <span className="font-normal text-[#7b7468]">(optional)</span><input value={draft.guestName} onChange={(e) => setDraft((current) => ({ ...current, guestName: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[#ddd4c7] px-4 py-3 text-sm" /></label>
            <label className="text-sm font-medium text-[#3f3a33]">Source reservation ID<input value={draft.externalReservationId} onChange={(e) => setDraft((current) => ({ ...current, externalReservationId: e.target.value }))} placeholder="Leave blank for manual ID" className="mt-2 w-full rounded-2xl border border-[#ddd4c7] px-4 py-3 text-sm" /></label>
            <label className="text-sm font-medium text-[#3f3a33]">Guest email <span className="font-normal text-[#7b7468]">(private)</span><input type="email" value={draft.guestEmail} onChange={(e) => setDraft((current) => ({ ...current, guestEmail: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[#ddd4c7] px-4 py-3 text-sm" /></label>
            <label className="text-sm font-medium text-[#3f3a33]">Guest phone <span className="font-normal text-[#7b7468]">(private)</span><input value={draft.guestPhone} onChange={(e) => setDraft((current) => ({ ...current, guestPhone: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[#ddd4c7] px-4 py-3 text-sm" /></label>
            <label className="text-sm font-medium text-[#3f3a33]">Amount<input type="number" min="0" value={draft.totalAmount} onChange={(e) => setDraft((current) => ({ ...current, totalAmount: e.target.value }))} className="mt-2 w-full rounded-2xl border border-[#ddd4c7] px-4 py-3 text-sm" /></label>
            <label className="text-sm font-medium text-[#3f3a33]">Currency<input value={draft.currency} onChange={(e) => setDraft((current) => ({ ...current, currency: e.target.value.toUpperCase() }))} className="mt-2 w-full rounded-2xl border border-[#ddd4c7] px-4 py-3 text-sm" /></label>
          </div>
          <label className="mt-4 block text-sm font-medium text-[#3f3a33]">Private notes<textarea value={draft.notes} onChange={(e) => setDraft((current) => ({ ...current, notes: e.target.value }))} rows={4} className="mt-2 w-full rounded-2xl border border-[#ddd4c7] px-4 py-3 text-sm" /></label>
          <p className="mt-3 text-xs leading-5 text-[#7b7468]">Privacy guardrail: the public site and availability APIs only need blocked dates. Guest contact details stay inside the owner portal.</p>
          <button type="button" onClick={saveDraft} disabled={saving} className="mt-6 inline-flex rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#18372b] disabled:opacity-60">{saving ? "Saving…" : selectedId ? "Save external block" : "Create external block"}</button>
        </div>
      </div>
    </section>
  );
}
