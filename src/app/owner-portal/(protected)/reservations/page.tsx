"use client";

import { useMemo, useState } from "react";
import initialReservations from "@/data/availability.json";
import ReservationEditor, { type Reservation } from "@/components/owner-portal/ReservationEditor";
import ReservationsCalendar from "@/components/owner-portal/ReservationsCalendar";

const today = new Date();

function ymd(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getNights(a: string, b: string): number {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)));
}

function makeId(): string {
  return String(Math.floor(Math.random() * 900000 + 100000));
}

type StoredReservation = (typeof initialReservations)[number];

function normalizeReservation(r: StoredReservation): Reservation {
  return {
    id: String(r.id),
    status: r.status as Reservation["status"],
    type: r.type,
    unit: r.unit,
    bookedDate: r.bookedDate,
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    nights: r.nights,
    income: r.income,
    currency: r.currency,
    isOwnerWeek: r.isOwnerWeek,
  };
}

export default function OwnerReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    (initialReservations as StoredReservation[]).map(normalizeReservation)
  );
  const [selectedId, setSelectedId] = useState<string | null>(reservations[0]?.id || null);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const selected = useMemo(
    () => (selectedId ? reservations.find((r) => r.id === selectedId) || null : null),
    [reservations, selectedId]
  );

  const updateSelected = (patch: Partial<Reservation>) => {
    if (!selectedId) return;
    setReservations((current) => current.map((r) => (r.id === selectedId ? { ...r, ...patch } : r)));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setReservations((current) => current.filter((r) => r.id !== selectedId));
    setSelectedId(null);
  };

  const addReservation = () => {
    const checkIn = ymd(new Date());
    const checkOut = ymd(new Date(Date.now() + 1000 * 60 * 60 * 24 * 5));
    const newReservation: Reservation = {
      id: makeId(),
      status: "Tentative",
      type: "Manual",
      unit: "Villa La Percha",
      bookedDate: ymd(new Date()),
      checkIn,
      checkOut,
      nights: getNights(checkIn, checkOut),
      income: 0,
      currency: "USD",
      isOwnerWeek: false,
    };

    setReservations((current) => [newReservation, ...current]);
    setSelectedId(newReservation.id);
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
              Next step is persisting changes and syncing to the guest-facing availability calendar.
            </p>
          </div>

          <button
            type="button"
            onClick={addReservation}
            className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#18372b]"
          >
            Add reservation
          </button>
        </div>
      </div>

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

        <ReservationEditor
          reservation={selected}
          onChange={updateSelected}
          onDelete={deleteSelected}
        />
      </div>
    </section>
  );
}
