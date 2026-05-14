"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReservationEditor, { type Reservation } from "@/components/owner-portal/ReservationEditor";
import ReservationsCalendar, { type ExternalCalendarBlock } from "@/components/owner-portal/ReservationsCalendar";

function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

interface ExternalReviewItem {
  category: "pendingMatches" | "conflicts" | "dataMismatches" | "agedUnmatchedDirectStay" | "missingExternalReservations";
  reservationId?: string;
  externalReservationId?: string;
  reason: string;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
  source?: string;
  externalSourceId?: string;
}

const reviewLabels: Record<ExternalReviewItem["category"], string> = {
  pendingMatches: "Pending matches",
  conflicts: "Conflicts",
  dataMismatches: "Matched with data differences",
  agedUnmatchedDirectStay: "Unmatched DirectStay reservations",
  missingExternalReservations: "Missing external reservations",
};

const today = new Date();

function ymd(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function OwnerReservationsPage() {
  const searchParams = useSearchParams();
  const initialReservationId = searchParams.get("id");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [loading, setLoading] = useState(true);
  const [reviewItems, setReviewItems] = useState<ExternalReviewItem[]>([]);
  const [externalBlocks, setExternalBlocks] = useState<ExternalCalendarBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [reservationResponse, reviewResponse, externalResponse] = await Promise.all([
        fetch(apiUrl("/api/owner-portal/reservations"), { cache: "no-store", credentials: "same-origin" }),
        fetch(apiUrl("/api/owner-portal/external-reservations/review"), { cache: "no-store", credentials: "same-origin" }),
        fetch(apiUrl("/api/owner-portal/external-reservations/manual"), { cache: "no-store", credentials: "same-origin" }),
      ]);
      const data = await reservationResponse.json();
      const reviewData = await reviewResponse.json();
      const externalData = await externalResponse.json();
      if (!reservationResponse.ok || !data.ok) throw new Error(data.error || "Failed to load reservations");
      if (!reviewResponse.ok || !reviewData.ok) throw new Error(reviewData.error || "Failed to load external reservation review items");
      if (!externalResponse.ok || !externalData.ok) throw new Error(externalData.error || "Failed to load external reservation blocks");
      setReservations(data.reservations);
      setReviewItems(reviewData.reviewItems || []);
      setExternalBlocks(externalData.externalReservations || []);
      setSelectedId((current: string | null) => current || (initialReservationId && data.reservations.some((reservation: Reservation) => reservation.id === initialReservationId) ? initialReservationId : data.reservations[0]?.id || null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, [initialReservationId]);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  const selected = useMemo(
    () => (selectedId ? reservations.find((r) => r.id === selectedId) || null : null),
    [reservations, selectedId]
  );

  const reviewGroups = useMemo(() => {
    return reviewItems.reduce<Record<ExternalReviewItem["category"], ExternalReviewItem[]>>((groups, item) => {
      groups[item.category].push(item);
      return groups;
    }, {
      pendingMatches: [],
      conflicts: [],
      dataMismatches: [],
      agedUnmatchedDirectStay: [],
      missingExternalReservations: [],
    });
  }, [reviewItems]);

  const reviewCount = reviewItems.length;

  const externalReservationAction = async (externalReservationId: string, action: "confirm-match" | "ignore" | "unlink", reservationId?: string) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(apiUrl(`/api/owner-portal/external-reservations/${encodeURIComponent(externalReservationId)}`), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reservationId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to update external reservation");
      setSuccess(action === "confirm-match" ? "Match confirmed." : action === "unlink" ? "Match unlinked." : "Review item ignored.");
      await loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update external reservation");
    } finally {
      setSaving(false);
    }
  };

  const saveSelected = async (draft: Reservation) => {
    if (!selectedId) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(apiUrl("/api/owner-portal/reservations"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          status: draft.status,
          type: draft.type,
          unit: draft.unit,
          bookedDate: draft.bookedDate,
          guestName: draft.guestName,
          guestEmail: draft.guestEmail,
          guestPhone: draft.guestPhone,
          checkIn: draft.checkIn,
          checkOut: draft.checkOut,
          income: draft.income,
          currency: draft.currency,
          paymentStatus: draft.paymentStatus,
          depositAmount: draft.depositAmount,
          amountReceived: draft.amountReceived,
          paymentMethod: draft.paymentMethod,
          paymentConfirmedAt: draft.paymentConfirmedAt,
          paymentNote: draft.paymentNote,
          isOwnerWeek: draft.isOwnerWeek,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to save reservation");
      setReservations((current) => current.map((r) => (r.id === selectedId ? data.reservation : r)));
      setSuccess("Reservation saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save reservation");
    } finally {
      setSaving(false);
    }
  };

  const deleteSelected = async () => {
    if (!selectedId) return;
    const previous = reservations;
    const next = reservations.filter((r) => r.id !== selectedId);
    setReservations(next);
    setSelectedId(next[0]?.id || null);
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(apiUrl(`/api/owner-portal/reservations/${encodeURIComponent(selectedId)}`), {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to delete reservation");
      setSuccess("Reservation deleted.");
    } catch (err) {
      setReservations(previous);
      setSelectedId(selectedId);
      setError(err instanceof Error ? err.message : "Failed to delete reservation");
    } finally {
      setSaving(false);
    }
  };

  const addReservation = async () => {
    const checkIn = ymd(new Date());
    const checkOut = ymd(new Date(Date.now() + 1000 * 60 * 60 * 24 * 5));
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(apiUrl("/api/owner-portal/reservations"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Tentative",
          type: "Manual",
          unit: "Villa La Percha",
          bookedDate: ymd(new Date()),
          guestName: "",
          guestEmail: "",
          guestPhone: "",
          checkIn,
          checkOut,
          income: 0,
          currency: "USD",
          isOwnerWeek: false,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to add reservation");
      setReservations((current) => [data.reservation, ...current]);
      setSelectedId(data.reservation.id);
      setSuccess("Reservation added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add reservation");
    } finally {
      setSaving(false);
    }
  };

  const prevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const nextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#7b7468]">Reservations</p>
            <h1 className="mt-3 font-display text-5xl leading-tight text-[#181612]">Calendar + reservation editor</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b554b]">
              Click a DirectStay reservation on the calendar to edit details. External Airbnb/VRBO/owner-use blocks are shown in gold and managed from the External Reservations section.
            </p>
          </div>

          <button
            type="button"
            onClick={addReservation}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#18372b] disabled:opacity-60"
          >
            {saving ? "Working..." : "Add reservation"}
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-[#b42318]">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-[#1e4536]">{success}</p> : null}
        {saving ? <p className="mt-4 text-sm text-[#7b7468]">Saving changes…</p> : null}
      </div>

      {reviewCount > 0 ? (
        <article className="rounded-[32px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#b46b37]">External reservations need review</p>
              <h2 className="mt-2 font-display text-3xl text-[#181612]">{reviewCount} reconciliation item{reviewCount === 1 ? "" : "s"}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b554b]">
                Review candidate matches, conflicts, data differences, and missing external reservations. Missing unlinked external reservations no longer block availability and are removed after one day if they do not reappear.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {(Object.keys(reviewGroups) as ExternalReviewItem["category"][]).filter((category) => reviewGroups[category].length > 0).map((category) => (
              <div key={category} className="rounded-2xl border border-[#eadfce] bg-[#fbf8f1] p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1e4536]">{reviewLabels[category]}</h3>
                <div className="mt-3 space-y-3">
                  {reviewGroups[category].map((item) => (
                    <div key={`${item.category}-${item.externalReservationId || item.reservationId}`} className="rounded-xl bg-white p-4 text-sm text-[#5b554b]">
                      <p>{item.reason}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7b7468]">
                        {item.guestName ? <span>{item.guestName}</span> : null}
                        {item.checkIn && item.checkOut ? <span>{item.checkIn} → {item.checkOut}</span> : null}
                        {item.source ? <span>{item.source}{item.externalSourceId ? ` #${item.externalSourceId}` : ""}</span> : null}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.reservationId ? (
                          <button type="button" onClick={() => setSelectedId(item.reservationId || null)} className="rounded-full border border-[#ddd4c7] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b554b]">
                            View DirectStay
                          </button>
                        ) : null}
                        {item.externalReservationId && item.reservationId ? (
                          <button type="button" onClick={() => externalReservationAction(item.externalReservationId!, "confirm-match", item.reservationId)} disabled={saving} className="rounded-full bg-[#1e4536] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60">
                            Confirm match
                          </button>
                        ) : null}
                        {item.externalReservationId ? (
                          <button type="button" onClick={() => externalReservationAction(item.externalReservationId!, "ignore")} disabled={saving} className="rounded-full border border-[#ddd4c7] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5b554b] disabled:opacity-60">
                            Ignore
                          </button>
                        ) : null}
                        {item.externalReservationId && item.reservationId ? (
                          <button type="button" onClick={() => externalReservationAction(item.externalReservationId!, "unlink")} disabled={saving} className="rounded-full border border-[#d9a08a] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9f3d22] disabled:opacity-60">
                            Unlink
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {loading ? (
        <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 text-sm text-[#5b554b] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          Loading reservations…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <ReservationsCalendar
            reservations={reservations}
            externalBlocks={externalBlocks}
            selectedId={selectedId}
            onSelect={setSelectedId}
            viewYear={viewYear}
            viewMonth={viewMonth}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />

          <ReservationEditor reservation={selected} onSave={saveSelected} onDelete={deleteSelected} saving={saving} />
        </div>
      )}
    </section>
  );
}
