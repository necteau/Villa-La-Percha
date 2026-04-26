"use client";

import { useMemo } from "react";

export type ReservationStatus = "Confirmed" | "Checked In" | "Cancelled" | "Tentative";

export interface Reservation {
  id: string;
  status: ReservationStatus;
  type: string;
  unit: string;
  bookedDate?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  income: number;
  currency: string;
  isOwnerWeek: boolean;
}

interface Props {
  reservation: Reservation | null;
  onChange: (patch: Partial<Reservation>) => void;
  onDelete: () => void;
}

function getNights(a: string, b: string): number {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)));
}

export default function ReservationEditor({ reservation, onChange, onDelete }: Props) {
  const computedNights = useMemo(() => {
    if (!reservation) return 0;
    return getNights(reservation.checkIn, reservation.checkOut);
  }, [reservation]);

  if (!reservation) {
    return (
      <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
        <p className="text-sm text-[#5b554b]">Select a reservation on the calendar to view and edit details.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Reservation</p>
          <h2 className="mt-2 font-display text-4xl text-[#181612]">{reservation.checkIn} → {reservation.checkOut}</h2>
          <p className="mt-2 text-sm text-[#7b7468]">
            ID {reservation.id} · {computedNights} nights
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full border border-[#e2b8b8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9a2f2f] transition hover:bg-[#fff1f1]"
        >
          Delete
        </button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Status</label>
          <select
            value={reservation.status}
            onChange={(e) => onChange({ status: e.target.value as ReservationStatus })}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          >
            <option>Confirmed</option>
            <option>Checked In</option>
            <option>Tentative</option>
            <option>Cancelled</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Type</label>
          <input
            value={reservation.type}
            onChange={(e) => onChange({ type: e.target.value })}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Unit</label>
          <input
            value={reservation.unit}
            onChange={(e) => onChange({ unit: e.target.value })}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <label className="inline-flex items-center gap-2 rounded-2xl bg-[#f7f3eb] px-4 py-3 text-sm text-[#5b554b]">
          <input
            type="checkbox"
            checked={reservation.isOwnerWeek}
            onChange={(e) => onChange({ isOwnerWeek: e.target.checked, income: e.target.checked ? 0 : reservation.income })}
          />
          Owner week
        </label>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Booked date (optional)</label>
          <input
            type="date"
            value={reservation.bookedDate || ""}
            onChange={(e) => onChange({ bookedDate: e.target.value || undefined })}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Currency</label>
          <input
            value={reservation.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Check-in</label>
          <input
            type="date"
            value={reservation.checkIn}
            onChange={(e) => onChange({ checkIn: e.target.value, nights: getNights(e.target.value, reservation.checkOut) })}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Check-out</label>
          <input
            type="date"
            value={reservation.checkOut}
            onChange={(e) => onChange({ checkOut: e.target.value, nights: getNights(reservation.checkIn, e.target.value) })}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Income</label>
          <input
            type="number"
            value={reservation.income}
            onChange={(e) => onChange({ income: Number(e.target.value || 0) })}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
            disabled={reservation.isOwnerWeek}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Nights (auto)</label>
          <input
            value={computedNights}
            readOnly
            className="w-full rounded-xl border border-[#ddd4c7] bg-[#faf8f3] px-4 py-3 text-sm"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-5 text-sm leading-6 text-[#5b554b]">
        <p className="font-medium text-[#1b1a17]">Next step</p>
        <p className="mt-2">
          Persist edits to a database and sync to the guest availability calendar. For now this editor is UI + local state.
        </p>
      </div>
    </div>
  );
}
