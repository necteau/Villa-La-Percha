"use client";

import { useEffect, useMemo, useState } from "react";
import availabilityFallback from "@/data/availability.json";

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

interface DayInfo {
  date: number;
  isCurrentMonth: boolean;
  isBooked: boolean;
  isPast: boolean;
  isCheckInDate: boolean;
  isCheckOutDate: boolean;
  isMinStayInvalid: boolean;
  dateStr: string;
}

type Reservation = {
  checkIn: string;
  checkOut: string;
};

const MIN_STAY = 5;
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type SelectionPhase = "none" | "selectingCheckOut" | "done";

interface Props {
  checkIn: string | null;
  setCheckIn: (v: string | null) => void;
  checkOut: string | null;
  setCheckOut: (v: string | null) => void;
  embedded?: boolean;
  showInquiryCta?: boolean;
}

export default function AvailabilityCalendar({
  checkIn,
  setCheckIn,
  checkOut,
  setCheckOut,
  embedded = false,
  showInquiryCta = true,
}: Props) {
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [phase, setPhase] = useState<SelectionPhase>("none");
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [reservationsData, setReservationsData] = useState<Reservation[]>(availabilityFallback as Reservation[]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch("/api/availability", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && res.ok && data.ok) {
          const records = (data.reservations || []) as Reservation[];
          setReservationsData(records);
        }
      } catch {
        // keep fallback data
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  const days = useMemo(() => {
    const nextDays: DayInfo[] = [];
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
    const startDay = new Date(viewYear, viewMonth, 1).getDay();

    for (let i = startDay - 1; i >= 0; i--) {
      nextDays.push({
        date: prevMonthDays - i,
        isCurrentMonth: false,
        isBooked: false,
        isPast: true,
        isCheckInDate: false,
        isCheckOutDate: false,
        isMinStayInvalid: false,
        dateStr: "",
      });
    }

    const currentMonthDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let d = 1; d <= currentMonthDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isPast = dateStr < todayStr;

      const reservations = reservationsData.filter((res) => dateStr >= res.checkIn && dateStr < res.checkOut);
      const isBooked = reservations.length > 0;
      const isCheckInDate = reservationsData.some((res) => res.checkIn === dateStr);
      const isCheckOutDate = reservationsData.some((res) => res.checkOut === dateStr);

      let isMinStayInvalid = false;
      if (!isPast) {
        for (let n = 1; n <= 4; n++) {
          const futureDate = new Date(viewYear, viewMonth, d + n);
          const futureStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, "0")}-${String(futureDate.getDate()).padStart(2, "0")}`;
          if (reservationsData.some((res) => futureStr >= res.checkIn && futureStr < res.checkOut)) {
            isMinStayInvalid = true;
            break;
          }
        }
      }

      nextDays.push({
        date: d,
        isCurrentMonth: true,
        isBooked,
        isPast,
        isCheckInDate,
        isCheckOutDate,
        isMinStayInvalid,
        dateStr,
      });
    }

    return nextDays;
  }, [reservationsData, viewMonth, viewYear]);

  const getNights = (a: string, b: string): number =>
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));

  const isSelectable = (day: DayInfo): boolean => {
    if (day.isPast) return false;
    if (day.isBooked && !day.isCheckInDate && !day.isCheckOutDate) return false;
    if (day.isCheckInDate || day.isCheckOutDate) return true;
    if (day.isMinStayInvalid) return false;
    return true;
  };

  const canBeCheckIn = (day: DayInfo): boolean => isSelectable(day) && !day.isCheckInDate;

  const canBeCheckOut = (day: DayInfo): boolean => {
    if (day.isPast) return false;
    if (day.isCheckOutDate) return false;
    if (phase === "selectingCheckOut" && checkIn) {
      const nights = getNights(checkIn, day.dateStr);
      if (nights < MIN_STAY) return false;

      if (day.dateStr >= todayStr) {
        const nextBooked = reservationsData
          .filter((res) => res.checkIn >= todayStr && res.checkIn >= checkIn)
          .map((res) => res.checkIn)
          .sort()[0];

        if (nextBooked && day.dateStr > nextBooked) return false;
      }
    }
    return true;
  };

  const handleDateClick = (dateStr: string) => {
    if (phase === "none" || phase === "done") {
      const dayInfo = days.find((d) => d.dateStr === dateStr);
      if (!dayInfo || dayInfo.isPast) return;
      if (!canBeCheckIn(dayInfo)) return;
      setCheckIn(dateStr);
      setCheckOut(null);
      setPhase("selectingCheckOut");
      setHoveredDate(null);
      return;
    }

    if (phase === "selectingCheckOut") {
      if (!checkIn) {
        setCheckIn(dateStr);
        return;
      }

      if (dateStr < checkIn) {
        if (dateStr > todayStr) {
          const dayInfo = days.find((d) => d.dateStr === dateStr);
          if (dayInfo && canBeCheckIn(dayInfo)) setCheckIn(dateStr);
        }
        return;
      }

      const dayInfo = days.find((d) => d.dateStr === dateStr);
      if (dayInfo && canBeCheckOut(dayInfo)) {
        setCheckOut(dateStr);
        setPhase("done");
      } else {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000);
      }
    }
  };

  const handleDayMouseEnter = (day: DayInfo) => {
    if (phase === "selectingCheckOut" && checkIn) {
      if (day.isPast) return;
      setHoveredDate(day.dateStr);
    }
  };

  const handleDayMouseLeave = () => {
    if (phase === "selectingCheckOut") setHoveredDate(null);
  };

  const isInRange = (day: DayInfo): boolean => {
    if (!checkIn) return false;
    const end = checkOut || hoveredDate;
    if (!end || day.isPast) return false;
    const sorted = [checkIn, end].sort();
    return day.dateStr >= sorted[0] && day.dateStr <= sorted[1];
  };

  const isSelectedCheckIn = (day: DayInfo): boolean => checkIn !== null && day.dateStr === checkIn;
  const isSelectedCheckOut = (day: DayInfo): boolean => {
    if (phase === "done" && checkOut !== null) return day.dateStr === checkOut;
    if (phase === "selectingCheckOut" && hoveredDate !== null) return day.dateStr === hoveredDate;
    return false;
  };

  const clearSelection = () => {
    setCheckIn(null);
    setCheckOut(null);
    setPhase("none");
    setHoveredDate(null);
  };

  const statusText = (() => {
    if (phase === "done" && checkIn && checkOut) {
      const n = getNights(checkIn, checkOut);
      return `${n} night${n > 1 ? "s" : ""} · ${checkIn} → ${checkOut}`;
    }
    if (phase === "selectingCheckOut" && checkIn) {
      const preview = hoveredDate || checkOut;
      if (preview) {
        const n = getNights(checkIn, preview);
        return `${n} night${n > 1 ? "s" : ""} · Select confirm or pick other dates`;
      }
      return `Check-in ${checkIn} · Pick check-out`;
    }
    return "Select check-in date";
  })();

  const prevMonth = () =>
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });

  const nextMonth = () =>
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });

  const bgColor = (day: DayInfo): string => {
    if (isSelectedCheckIn(day) || isSelectedCheckOut(day)) return "#1E3A5F";
    if (isInRange(day)) return "rgba(30, 58, 95, 0.15)";
    if (day.isBooked && day.isCheckInDate && !day.isCheckOutDate) return "#FFFFFF";
    if (day.isBooked && day.isCheckOutDate && !day.isCheckInDate) return "#FFFFFF";
    if (day.isBooked && day.isCheckInDate && day.isCheckOutDate) return "transparent";
    if (day.isBooked) return "#E0DCD7";
    return "transparent";
  };

  const nightColor = (day: DayInfo): string => {
    if (isSelectedCheckIn(day) || isSelectedCheckOut(day)) return "#FFFFFF";
    if (isInRange(day)) return "#1E3A5F";
    if (!day.isCurrentMonth || day.isPast) return "#6B6B6B";
    return "#2C2C2C";
  };

  const todayIs = (date: number): boolean =>
    date === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const gradientStyle = (day: DayInfo): { gradient?: string; solidBg?: string } => {
    if (isSelectedCheckIn(day) || isSelectedCheckOut(day) || isInRange(day)) return {};
    if (day.isCheckInDate && day.isCheckOutDate) return { solidBg: "#E0DCD7" };
    if (day.isBooked && day.isCheckOutDate) return { gradient: "linear-gradient(to top left, transparent 45%, #E0DCD7 45%)" };
    if (day.isBooked && day.isCheckInDate) return { gradient: "linear-gradient(to bottom right, transparent 45%, #E0DCD7 45%)" };
    if (day.isCheckOutDate && !day.isCheckInDate) return { gradient: "linear-gradient(to top left, transparent 45%, #E0DCD7 45%)" };
    if (day.isCheckInDate && !day.isCheckOutDate) return { gradient: "linear-gradient(to bottom right, transparent 45%, #E0DCD7 45%)" };
    return {};
  };

  const calendarInner = (
    <>
      <p className={`text-center text-xs md:text-sm ${embedded ? "mb-2" : "mb-2 md:mb-3"}`} style={{ color: "#6B6B6B" }}>
        5-night stay minimum
      </p>

      <div className={`bg-white rounded-2xl shadow-sm border border-[#E8E4DF] overflow-hidden ${embedded ? "w-full" : "max-w-md mx-auto"}`}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #E8E4DF" }}>
          <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#F5F0E8]" style={{ border: "none", cursor: "pointer", color: "#6B6B6B" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <h3 className="font-display text-lg font-light" style={{ color: "#2C2C2C" }}>{monthNames[viewMonth]} {viewYear}</h3>
          <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#F5F0E8]" style={{ border: "none", cursor: "pointer", color: "#6B6B6B" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>

        <div className="px-5 pt-4 pb-1">
          <div className="grid grid-cols-7 gap-0">
            {dayLabels.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium py-2 uppercase" style={{ color: "#6B6B6B", opacity: 0.5 }}>{d}</div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 pt-1 relative">
          <div className="grid grid-cols-7 gap-0">
            {days.map((day, idx) => {
              const bg = bgColor(day);
              const grad = gradientStyle(day);
              const clickable = phase === "selectingCheckOut" ? canBeCheckOut(day) : canBeCheckIn(day);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => { if (clickable) handleDayMouseEnter(day); }}
                  onMouseLeave={handleDayMouseLeave}
                  onClick={clickable ? () => handleDateClick(day.dateStr) : undefined}
                  className="flex items-center justify-center text-[13px] py-[10px] rounded-md font-medium relative"
                  style={{
                    backgroundColor: grad?.solidBg || (bg !== "transparent" ? bg : undefined),
                    backgroundImage: grad?.gradient,
                    color: nightColor(day),
                    cursor: clickable ? "pointer" : "default",
                    opacity: (!day.isCurrentMonth || day.isPast) ? 0.3 : 1,
                    border: todayIs(day.date) && !grad?.solidBg && bg === "transparent" ? "1px solid #8B7355" : "none",
                  }}
                >
                  {day.date}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`text-center ${embedded ? "mt-3" : "mt-3 md:mt-4"}`}>
        {phase !== "done" && phase !== "none" && checkIn && <p className="text-sm" style={{ color: "#8B7355" }}>{statusText}</p>}
        {showHint && <p className="text-sm" style={{ color: "#C0392B" }}>{phase === "selectingCheckOut" ? `Need at least ${MIN_STAY} nights` : "That date is not available"}</p>}
        {phase === "done" && checkIn && checkOut && <p className="text-sm" style={{ color: "#8B7355" }}>{statusText}</p>}
      </div>

      <div className={`text-center ${embedded ? "mt-4" : "mt-4 md:mt-6"}`}>
        {phase !== "none" && (
          <button onClick={clearSelection} className="inline-block px-6 py-2 text-xs tracking-[0.2em] uppercase text-white font-medium" style={{ backgroundColor: "#8B7355" }}>
            Clear Dates
          </button>
        )}
      </div>

      {!embedded && (
        <div className="mt-4 md:mt-6 flex flex-wrap gap-4 md:gap-6 text-xs justify-center" style={{ color: "#6B6B6B" }}>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#1E3A5F" }} /><span>Selected</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#E0DCD7" }} /><span>Booked</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: "linear-gradient(to top left, transparent 45%, #E0DCD7 45%)" }} /><span>Check-out</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ background: "linear-gradient(to bottom right, transparent 45%, #E0DCD7 45%)" }} /><span>Check-in</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded border border-[#E8E4DF] bg-white" /><span>Available</span></div>
        </div>
      )}

      {showInquiryCta && !embedded && (
        <div className="text-center mt-6 md:mt-10">
          <a href="#contact" className="inline-block px-8 md:px-10 py-3.5 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium" style={{ backgroundColor: "#8B7355" }}>
            Inquire Now
          </a>
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div className="w-full">{calendarInner}</div>;
  }

  return (
    <section id="availability" className="py-8 md:py-16 bg-[#FAFAF8]">
      <div className="max-w-xl mx-auto px-6 md:px-8">{calendarInner}</div>
    </section>
  );
}
