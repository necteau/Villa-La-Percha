"use client";

import { useMemo } from "react";
import type { Reservation } from "@/components/owner-portal/ReservationEditor";

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface Props {
  reservations: Reservation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  viewYear: number;
  viewMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

type DayCell = {
  date: number;
  dateStr: string;
  isCurrentMonth: boolean;
  isPast: boolean;
  reservationIds: string[];
};

function ymd(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function ReservationsCalendar({
  reservations,
  selectedId,
  onSelect,
  viewYear,
  viewMonth,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const todayStr = useMemo(() => ymd(new Date()), []);

  const days = useMemo(() => {
    const cells: DayCell[] = [];
    const startDay = new Date(viewYear, viewMonth, 1).getDay();
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({
        date: prevMonthDays - i,
        dateStr: "",
        isCurrentMonth: false,
        isPast: true,
        reservationIds: [],
      });
    }

    const currentMonthDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let d = 1; d <= currentMonthDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const reservationIds = reservations
        .filter((r) => dateStr >= r.checkIn && dateStr < r.checkOut)
        .map((r) => r.id);

      cells.push({
        date: d,
        dateStr,
        isCurrentMonth: true,
        isPast: dateStr < todayStr,
        reservationIds,
      });
    }

    return cells;
  }, [reservations, todayStr, viewMonth, viewYear]);

  const selectedReservation = selectedId
    ? reservations.find((r) => r.id === selectedId) || null
    : null;

  return (
    <div className="rounded-[28px] border border-[#e8e1d6] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          className="h-10 w-10 rounded-full border border-[#e8e1d6] text-[#5b554b] transition hover:bg-[#f4efe6]"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7b7468]">Calendar</p>
          <h2 className="mt-1 font-display text-3xl text-[#181612]">{monthNames[viewMonth]} {viewYear}</h2>
        </div>
        <button
          type="button"
          onClick={onNextMonth}
          className="h-10 w-10 rounded-full border border-[#e8e1d6] text-[#5b554b] transition hover:bg-[#f4efe6]"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {selectedReservation ? (
        <div className="mt-4 rounded-2xl border border-[#e8e1d6] bg-[#faf8f3] p-4 text-sm text-[#5b554b]">
          Selected: <span className="font-medium text-[#1b1a17]">{selectedReservation.checkIn} → {selectedReservation.checkOut}</span>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-[#e8e1d6] bg-[#faf8f3] p-4 text-sm text-[#7b7468]">
          Click any reserved date to select a reservation and edit it.
        </div>
      )}

      <div className="mt-6 grid grid-cols-7 gap-2">
        {["S","M","T","W","T","F","S"].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b7468]">
            {d}
          </div>
        ))}
        {days.map((day, idx) => {
          const hasReservations = day.reservationIds.length > 0;
          const daySelected = selectedId ? day.reservationIds.includes(selectedId) : false;
          const canSelect = hasReservations;

          return (
            <button
              key={`${day.date}-${idx}`}
              type="button"
              disabled={!canSelect}
              onClick={() => {
                if (!canSelect) return;
                const nextId = day.reservationIds[0];
                onSelect(nextId);
              }}
              className={`relative flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition ${
                !day.isCurrentMonth
                  ? "bg-transparent text-[#7b7468]/30"
                  : daySelected
                    ? "bg-[#1e4536] text-white"
                    : hasReservations
                      ? "bg-[#f3ede3] text-[#1b1a17] hover:bg-[#eadfce]"
                      : day.isPast
                        ? "bg-white text-[#7b7468]/35"
                        : "bg-white text-[#1b1a17] border border-[#efe7dc]"
              }`}
              aria-label={day.isCurrentMonth ? `Day ${day.date}` : ""}
            >
              {day.date}
              {hasReservations ? (
                <span className={`absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${daySelected ? "bg-white/80" : "bg-[#8B7355]"}`} />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-xs text-[#7b7468]">
        Tip: if a day has multiple overlapping reservations (rare), we select the first one.
      </div>
    </div>
  );
}
