"use client";

import { useState, useMemo } from "react";
import availabilityData from "@/data/availability.json";

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

interface DayInfo {
  date: number;
  isCurrentMonth: boolean;
  isBooked: boolean;
  isPast: boolean;
  isCheckInDate: boolean;   // someone else's check-in (available for back-to-back)
  isCheckOutDate: boolean;  // someone else's check-out (available for back-to-back)
  isMinStayInvalid: boolean; // can't start a 5+ night stay from this date
  dateStr: string;
}

const MIN_STAY = 5;
const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const dayLabels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

type SelectionPhase = "none" | "selectingCheckOut" | "done";

export default function AvailabilityCalendar() {
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [phase, setPhase] = useState<SelectionPhase>("none");
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const days = useMemo(() => {
    const days: DayInfo[] = [];
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
    const startDay = new Date(viewYear, viewMonth, 1).getDay();

    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ date: prevMonthDays - i, isCurrentMonth: false, isBooked: false, isPast: true, isCheckInDate: false, isCheckOutDate: false, isMinStayInvalid: false, dateStr: "" });
    }

    const currentMonthDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= currentMonthDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isPast = dateStr < todayStr;

      const reservations = (availabilityData as any[]).filter(
        (res: any) => dateStr >= res.checkIn && dateStr < res.checkOut
      );
      const isBooked = reservations.length > 0;
      const isCheckInDate = (availabilityData as any[]).some(
        (res: any) => res.checkIn === dateStr
      );
      const isCheckOutDate = (availabilityData as any[]).some(
        (res: any) => res.checkOut === dateStr
      );

      let isMinStayInvalid = false;
      if (!isPast) {
        // Check if any of nights d+1 through d+5 land on a booked date
        for (let n = 1; n <= 5; n++) {
          const futureDate = new Date(viewYear, viewMonth, d + n);
          const futureStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;
          if ((availabilityData as any[]).some((res: any) => futureStr >= res.checkIn && futureStr < res.checkOut)) {
            isMinStayInvalid = true;
            break;
          }
        }
      }

      days.push({ date: d, isCurrentMonth: true, isBooked, isPast, isCheckInDate, isCheckOutDate, isMinStayInvalid, dateStr });
    }
    return days;
  }, [viewYear, viewMonth]);

  const isSelectable = (day: DayInfo): boolean => {
    if (day.isPast) return false;
    // Booked dates are not selectable UNLESS they're transition dates (check-in/check-out of another stay)
    if (day.isBooked && !day.isCheckInDate && !day.isCheckOutDate) return false;
    // Transition dates are always selectable (for their complementary role)
    if (day.isCheckInDate || day.isCheckOutDate) return true;
    // Non-transition dates: check min-stay constraint
    if (day.isMinStayInvalid) return false;
    return true;
  };

  // A date can be clicked as a check-in if it's selectable AND it's NOT an existing reservation's check-in date
  const canBeCheckIn = (day: DayInfo): boolean => {
    return isSelectable(day) && !day.isCheckInDate;
  };

  // A date can be clicked as a check-out if it's selectable AND it's NOT an existing reservation's check-out date
  const canBeCheckOut = (day: DayInfo): boolean => {
    return isSelectable(day) && !day.isCheckOutDate;
  };

  const getNights = (a: string, b: string): number =>
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));

  const handleDateClick = (dateStr: string) => {
    // Find the day info for min-stay check
    const dayInfo = days.find(d => d.dateStr === dateStr);
    if (!dayInfo || dayInfo.isPast) return;
    if (dayInfo.isBooked) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2500);
      return;
    }
    if (dayInfo.isMinStayInvalid) {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2500);
      return;
    }

    if (phase === "none" || phase === "done") {
      setCheckIn(dateStr);
      setCheckOut(null);
      setPhase("selectingCheckOut");
      setHoveredDate(null);
    } else if (phase === "selectingCheckOut") {
      if (!checkIn) {
        setCheckIn(dateStr);
      } else if (dateStr < checkIn) {
        // Allow re-picking check-in to an earlier date
        setCheckIn(dateStr);
      } else {
        const nights = getNights(checkIn, dateStr);
        if (nights >= MIN_STAY) {
          setCheckOut(dateStr);
          setPhase("done");
        } else {
          // User-friendly feedback
          setShowHint(true);
          setTimeout(() => setShowHint(false), 3000);
        }
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
    if (phase !== "selectingCheckOut" || !checkIn) return false;
    if (day.isPast || day.isBooked || day.isMinStayInvalid) return false;
    const preview = hoveredDate || checkOut;
    if (!preview) return false;
    const sorted = [checkIn, preview].sort();
    return day.dateStr >= sorted[0] && day.dateStr <= sorted[1];
  };

  const isSelectedCheckIn = (day: DayInfo): boolean => checkIn !== null && day.dateStr === checkIn;

  const isSelectedCheckOut = (day: DayInfo): boolean => {
    if (phase === "done" && checkOut !== null) return day.dateStr === checkOut;
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

  const prevMonth = () => {
    clearSelection();
    setViewMonth((m) => { if (m === 0) { setViewYear((y) => y - 1); return 11; } return m - 1; });
  };
  const nextMonth = () => {
    clearSelection();
    setViewMonth((m) => { if (m === 11) { setViewYear((y) => y + 1); return 0; } return m + 1; });
  };

  const isToday = (date: number) => date === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const bgColor = (day: DayInfo): string => {
    if (isSelectedCheckIn(day) || isSelectedCheckOut(day)) return "#1E3A5F";
    if (isInRange(day)) return "rgba(30, 58, 95, 0.15)";
    // Transition check-in dates use white bg so the gradient creates the triangle effect
    if (day.isBooked && day.isCheckInDate) return "#FFFFFF";
    // Transition check-out dates use white bg so the gradient creates the triangle effect
    if (day.isBooked && day.isCheckOutDate) return "#FFFFFF";
    if (day.isBooked) return "#E0DCD7";
    return "transparent";
  };

  const nightColor = (day: DayInfo): string => {
    if (isSelectedCheckIn(day) || isSelectedCheckOut(day)) return "#FFFFFF";
    if (isInRange(day)) return "#1E3A5F";
    if (!day.isCurrentMonth || day.isPast) return "#6B6B6B";
    return "#2C2C2C";
  };

  const todayIs = (date: number): boolean => date === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  const todayCheck = (day: DayInfo): boolean => {
    if (!todayIs(day.date)) return false;
    return isToday(day.date);
  };

                const gradientStyle = (day: DayInfo): string | undefined => {
    if (isSelectedCheckIn(day) || isSelectedCheckOut(day) || isInRange(day)) return undefined;
    // Transition dates: show partial shading (triangle), not full gray
    if (day.isBooked && day.isCheckInDate) return "linear-gradient(to bottom right, transparent 45%, #E0DCD7 45%)";
    if (day.isBooked && day.isCheckOutDate) return "linear-gradient(to top left, transparent 45%, #E0DCD7 45%)";
    if (day.isCheckInDate) return "linear-gradient(to bottom right, transparent 45%, #E0DCD7 45%)";
    if (day.isCheckOutDate) return "linear-gradient(to top left, transparent 45%, #E0DCD7 45%)";
    return undefined;
  };

  return (
    <section id="availability" className="py-20 md:py-32 bg-[#FAFAF8]">
      <div className="max-w-xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>Availability</p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>Check Availability</h2>
          <p className="text-sm md:text-base max-w-lg mx-auto leading-relaxed" style={{ color: "#6B6B6B" }}>
            Select your preferred dates and the owner will respond within 24 hours.<br />
            Direct bookings save 15–20% over OTA pricing.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E4DF] overflow-hidden max-w-md mx-auto">
          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #E8E4DF" }}>
            <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#F5F0E8]" style={{ border: "none", cursor: "pointer", color: "#6B6B6B" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <h3 className="font-display text-lg font-light" style={{ color: "#2C2C2C" }}>{monthNames[viewMonth]} {viewYear}</h3>
            <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#F5F0E8]" style={{ border: "none", cursor: "pointer", color: "#6B6B6B" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>

          {/* Days header */}
          <div className="px-5 pt-4 pb-1">
            <div className="grid grid-cols-7 gap-0">
              {dayLabels.map((d) => (
                <div key={d} className="text-center text-[10px] font-medium py-2 uppercase" style={{ color: "#6B6B6B", opacity: 0.5 }}>{d}</div>
              ))}
            </div>
          </div>

          {/* Date cells */}
          <div className="px-5 pb-5 pt-1 relative">
            <div className="grid grid-cols-7 gap-0">
              {days.map((day, idx) => {
                const bg = bgColor(day);
                const tc = nightColor(day);
                const grad = gradientStyle(day);
                const highlighted = isToday(day.date);
                const clickable = canBeCheckIn(day) || (phase === "selectingCheckOut" && canBeCheckOut(day));

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => { if (clickable) handleDayMouseEnter(day); }}
                    onMouseLeave={handleDayMouseLeave}
                    onClick={clickable ? () => handleDateClick(day.dateStr) : undefined}
                    className="flex items-center justify-center text-[13px] py-[10px] rounded-md font-medium relative"
                    style={{
                      backgroundColor: bg !== "transparent" ? bg : undefined,
                      backgroundImage: grad ? grad as string : undefined,
                      color: nightColor(day),
                      cursor: clickable ? "pointer" : "default",
                      opacity: (!day.isCurrentMonth || day.isPast) ? 0.3 : 1,
                      border: todayIs(day.date) && bg === "transparent" ? "1px solid #8B7355" : "none",
                    }}
                  >
                    {day.date}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status / hint */}
        <div className="mt-4 text-center">
          {phase !== "done" && phase !== "none" && checkIn && (
            <p className="text-sm" style={{ color: "#8B7355" }}>{statusText}</p>
          )}
          {showHint && (
            <p className="text-sm" style={{ color: "#C0392B" }}>
              {phase === "selectingCheckOut" ? `Need at least ${MIN_STAY} nights` : "That date is not available"}
            </p>
          )}
          {phase === "done" && checkIn && checkOut && (
            <p className="text-sm" style={{ color: "#8B7355" }}>{statusText}</p>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-6 text-xs justify-center" style={{ color: "#6B6B6B" }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#8B7355" }} /><span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#E0DCD7" }} /><span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: `linear-gradient(to top left, transparent 45%, #E0DCD7 45%)` }} /><span>Transition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border border-[#E8E4DF] bg-white" /><span>Available</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <a href="#contact" className="inline-block px-8 md:px-10 py-3.5 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium" style={{ backgroundColor: "#8B7355" }}>Inquire Now</a>
          {phase === "done" && checkIn && checkOut && (
            <button onClick={clearSelection} className="ml-6 text-xs underline" style={{ color: "#8B7355" }}>Clear</button>
          )}
        </div>
      </div>
    </section>
  );
}
