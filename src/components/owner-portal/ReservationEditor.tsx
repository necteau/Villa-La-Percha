"use client";

import { useEffect, useMemo, useState } from "react";

export type ReservationStatus = "Confirmed" | "Checked In" | "Cancelled" | "Tentative";

export interface Reservation {
  id: string;
  customerId?: string;
  status: ReservationStatus;
  type: string;
  unit: string;
  bookedDate?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  income: number;
  currency: string;
  isOwnerWeek: boolean;
}

interface Props {
  reservation: Reservation | null;
  onSave: (draft: Reservation) => Promise<void> | void;
  onDelete: () => void;
  saving?: boolean;
}

function getNights(a: string, b: string): number {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)));
}

export default function ReservationEditor({ reservation, onSave, onDelete, saving = false }: Props) {
  const [draft, setDraft] = useState<Reservation | null>(reservation);

  useEffect(() => {
    setDraft(reservation ? { ...reservation } : null);
  }, [reservation]);

  const computedNights = useMemo(() => {
    if (!draft) return 0;
    return getNights(draft.checkIn, draft.checkOut);
  }, [draft]);

  const hasChanges = !!draft && !!reservation && JSON.stringify(draft) !== JSON.stringify(reservation);

  if (!draft) {
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
          <h2 className="mt-2 font-display text-4xl text-[#181612]">{draft.checkIn} → {draft.checkOut}</h2>
          <p className="mt-2 text-sm text-[#7b7468]">
            ID {draft.id} · {computedNights} nights
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
            value={draft.status}
            onChange={(e) => setDraft((current) => (current ? { ...current, status: e.target.value as ReservationStatus } : current))}
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
            value={draft.type}
            onChange={(e) => setDraft((current) => (current ? { ...current, type: e.target.value } : current))}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Unit</label>
          <input
            value={draft.unit}
            onChange={(e) => setDraft((current) => (current ? { ...current, unit: e.target.value } : current))}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <label className="inline-flex items-center gap-2 rounded-2xl bg-[#f7f3eb] px-4 py-3 text-sm text-[#5b554b]">
          <input
            type="checkbox"
            checked={draft.isOwnerWeek}
            onChange={(e) =>
              setDraft((current) =>
                current ? { ...current, isOwnerWeek: e.target.checked, income: e.target.checked ? 0 : current.income } : current
              )
            }
          />
          Owner week
        </label>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Booked date (optional)</label>
          <input
            type="date"
            value={draft.bookedDate || ""}
            onChange={(e) => setDraft((current) => (current ? { ...current, bookedDate: e.target.value || undefined } : current))}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Currency</label>
          <input
            value={draft.currency}
            onChange={(e) => setDraft((current) => (current ? { ...current, currency: e.target.value } : current))}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Guest name</label>
          <input
            value={draft.guestName || ""}
            onChange={(e) => setDraft((current) => (current ? { ...current, guestName: e.target.value || undefined } : current))}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Guest email</label>
          <input
            type="email"
            value={draft.guestEmail || ""}
            onChange={(e) => setDraft((current) => (current ? { ...current, guestEmail: e.target.value || undefined } : current))}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Guest phone</label>
          <input
            value={draft.guestPhone || ""}
            onChange={(e) => setDraft((current) => (current ? { ...current, guestPhone: e.target.value || undefined } : current))}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Check-in</label>
          <input
            type="date"
            value={draft.checkIn}
            onChange={(e) =>
              setDraft((current) =>
                current ? { ...current, checkIn: e.target.value, nights: getNights(e.target.value, current.checkOut) } : current
              )
            }
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Check-out</label>
          <input
            type="date"
            value={draft.checkOut}
            onChange={(e) =>
              setDraft((current) =>
                current ? { ...current, checkOut: e.target.value, nights: getNights(current.checkIn, e.target.value) } : current
              )
            }
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.18em] text-[#7b7468]">Income</label>
          <input
            type="number"
            value={draft.income}
            onChange={(e) => setDraft((current) => (current ? { ...current, income: Number(e.target.value || 0) } : current))}
            className="w-full rounded-xl border border-[#ddd4c7] px-4 py-3 text-sm"
            disabled={draft.isOwnerWeek}
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

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void onSave({ ...draft, nights: computedNights })}
          disabled={saving || !hasChanges}
          className="inline-flex items-center justify-center rounded-full bg-[#1e4536] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#18372b] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save reservation"}
        </button>
        <button
          type="button"
          onClick={() => setDraft(reservation ? { ...reservation } : null)}
          disabled={saving || !hasChanges}
          className="inline-flex items-center justify-center rounded-full border border-[#ddd4c7] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b554b] transition hover:bg-[#f7f3eb] disabled:opacity-60"
        >
          Reset changes
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-5 text-sm leading-6 text-[#5b554b]">
        <p className="font-medium text-[#1b1a17]">Editing mode</p>
        <p className="mt-2">
          Changes are now staged locally first, then saved explicitly so the editor behaves like a normal app instead of fighting every keystroke.
        </p>
      </div>
    </div>
  );
}
