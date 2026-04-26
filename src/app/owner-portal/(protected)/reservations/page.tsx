"use client";

import { useEffect, useMemo, useState } from "react";
import ReservationEditor, { type Reservation } from "@/components/owner-portal/ReservationEditor";
import ReservationsCalendar from "@/components/owner-portal/ReservationsCalendar";

function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

const today = new Date();

function ymd(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function OwnerReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiUrl("/api/owner-portal/reservations"), { cache: "no-store", credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Failed to load reservations");
      setReservations(data.reservations);
      setSelectedId((current: string | null) => current || data.reservations[0]?.id || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReservations();
  }, []);

  const selected = useMemo(
    () => (selectedId ? reservations.find((r) => r.id === selectedId) || null : null),
    [reservations, selectedId]
  );

  const saveSelected = async (draft: Reservation) => {
    if (!selectedId) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(apiUrl(`/api/owner-portal/reservations/${encodeURIComponent(selectedId)}`), {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draft.status,
          type: draft.type,
          unit: draft.unit,
          bookedDate: draft.bookedDate,
          checkIn: draft.checkIn,
          checkOut: draft.checkOut,
          income: draft.income,
          currency: draft.currency,
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
              Click a reservation on the calendar to edit details. Add, edit, and delete reservations manually.
              This screen now uses a real API/data layer and is ready to move fully onto Postgres.
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

      {loading ? (
        <div className="rounded-[32px] border border-[#e8e1d6] bg-white p-8 text-sm text-[#5b554b] shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          Loading reservations…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <ReservationsCalendar
            reservations={reservations}
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
