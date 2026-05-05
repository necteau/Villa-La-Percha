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
  lastSeenAt: string;
  updatedAt: string;
}

function statusLabel(status: SourceStatus) {
  if (status === "ACTIVE") return "Blocks availability";
  if (status === "CANCELLED") return "Cancelled";
  return "Missing from source";
}

function formatMoney(amount?: number, currency = "USD") {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function Field({ label, value, privateValue = false }: { label: string; value?: string | number; privateValue?: boolean }) {
  return (
    <div className="rounded-2xl bg-[#faf8f3] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b7468]">{label}{privateValue ? " · private" : ""}</p>
      <p className="mt-1 break-words text-sm text-[#181612]">{value || "—"}</p>
    </div>
  );
}

export default function ExternalReservationsPage() {
  const [records, setRecords] = useState<ExternalReservation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load external reservations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">External reservations</p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">OTA blocks + owner holds</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b554b]">
            Read-only Airbnb, VRBO, owner-use, and other outside booking records from integrations. These records are integration-owned; edits belong in the source platform or integration job because the next sync may overwrite local changes.
          </p>
        </div>
        <div className="mt-5 rounded-2xl border border-[#eadfce] bg-[#fffaf0] p-4 text-sm leading-6 text-[#6b5938]">
          Read-only view: owners can inspect blocks and reconciliation state here. Active external records block availability and appear on the reservation calendar in gold.
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#faf8f3] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[#7b7468]">Total</p><p className="mt-1 text-3xl font-light text-[#181612]">{records.length}</p></div>
          <div className="rounded-2xl bg-[#eff6f1] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[#1e4536]">Blocking</p><p className="mt-1 text-3xl font-light text-[#1e4536]">{activeCount}</p></div>
          <div className="rounded-2xl bg-[#f7f0e6] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[#8b7355]">Linked</p><p className="mt-1 text-3xl font-light text-[#8b7355]">{linkedCount}</p></div>
        </div>
        {error ? <p className="mt-4 text-sm text-[#b42318]">{error}</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
          <h2 className="font-display text-3xl text-[#181612]">Integration records</h2>
          <div className="mt-5 space-y-3">
            {loading ? <p className="text-sm text-[#7b7468]">Loading…</p> : null}
            {!loading && records.length === 0 ? <p className="rounded-2xl border border-dashed border-[#e8e1d6] p-4 text-sm text-[#7b7468]">No external reservations are currently imported.</p> : null}
            {records.map((record) => (
              <button key={record.id} type="button" onClick={() => setSelectedId(record.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedId === record.id ? "border-[#1e4536] bg-[#eff6f1]" : "border-[#eadfce] bg-[#fbf8f1] hover:bg-[#f4efe6]"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#181612]">{record.source} · {record.checkIn} → {record.checkOut}</p>
                    <p className="mt-1 text-xs text-[#7b7468]">{record.guestName || "Guest details not imported"}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${record.sourceStatus === "ACTIVE" ? "bg-[#1e4536] text-white" : "bg-[#eee7dc] text-[#7b7468]"}`}>{statusLabel(record.sourceStatus)}</span>
                </div>
                <p className="mt-2 text-xs text-[#7b7468]">Source ID: {record.externalReservationId}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Read-only details</p>
            <h2 className="mt-1 font-display text-3xl text-[#181612]">{selected ? `${selected.source} reservation` : "Select a record"}</h2>
          </div>

          {selected ? (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Source" value={selected.source} />
                <Field label="Source reservation ID" value={selected.externalReservationId} />
                <Field label="Status" value={statusLabel(selected.sourceStatus)} />
                <Field label="Match status" value={selected.matchStatus.replaceAll("_", " ")} />
                <Field label="Check-in" value={selected.checkIn} />
                <Field label="Check-out" value={selected.checkOut} />
                <Field label="Guest name" value={selected.guestName} privateValue />
                <Field label="Guest email" value={selected.guestEmail} privateValue />
                <Field label="Guest phone" value={selected.guestPhone} privateValue />
                <Field label="Amount" value={formatMoney(selected.totalAmount, selected.currency)} />
                <Field label="Linked DirectStay reservation" value={selected.reservationId} />
                <Field label="Last seen" value={selected.lastSeenAt ? new Date(selected.lastSeenAt).toLocaleString() : ""} />
              </div>
              {selected.notes ? <div className="rounded-2xl bg-[#faf8f3] p-4 text-sm leading-6 text-[#5b554b]"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b7468]">Integration notes</p><p className="mt-1 whitespace-pre-wrap">{selected.notes}</p></div> : null}
              <p className="text-xs leading-5 text-[#7b7468]">To change this record, update the source platform or integration feed. DirectStay treats this screen as an operational mirror so calendar availability stays consistent after sync.</p>
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-[#e8e1d6] p-5 text-sm text-[#7b7468]">Select an imported record to inspect its dates, source state, and private guest details.</p>
          )}
        </div>
      </div>
    </section>
  );
}
