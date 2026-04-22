"use client";

import { useState } from "react";
import availabilityData from "@/data/availability.json";

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

interface DayInfo {
  date: number;
  isCurrentMonth: boolean;
  isBooked: boolean;
  isPast: boolean;
  isCheckInDate: boolean;   // someone else's check-in (available)
  isCheckOutDate: boolean;  // someone else's check-out (available, transition)
  isMinStayInvalid: boolean; // can't start a 5+ night stay from this date
}

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const dayLabels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function AvailabilityCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const generateCalendarDays = (year: number, month: number): DayInfo[] => {
    const days: DayInfo[] = [];

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ date: prevMonthDays - i, isCurrentMonth: false, isBooked: false, isPast: true, isCheckInDate: false, isCheckOutDate: false });
    }

    const currentMonthDays = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= currentMonthDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      
      // Is this date part of a booking (fully inside)?
      const reservations = (availabilityData as any[]).filter(
        (res) => dateStr >= res.checkIn && dateStr < res.checkOut
      );
      const isBooked = reservations.length > 0;

      // Is this the check-in date of any reservation?
      const isCheckIn = (availabilityData as any[]).some(
        (res) => res.checkIn === dateStr
      );

      // Is this the day before check-out (transition/checkout day)?
      const isCheckOut = (availabilityData as any[]).some(
        (res) => res.checkOut === dateStr
      );

      const isPast = dateStr < todayStr;
      
      // Check if this date can start a valid 5-night stay
      let isMinStayInvalid = false;
      if (!day.isPast) {
        for (let n = 1; n <= 4; n++) {
          const futureDate = new Date(year, month, d + n);
          const futureStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;
          const isNightBooked = (availabilityData as any[]).some(
            (res) => futureStr >= res.checkIn && futureStr < res.checkOut
          );
          if (isNightBooked) {
            isMinStayInvalid = true;
            break;
          }
        }
      }
      
      days.push({ date: d, isCurrentMonth: true, isBooked, isPast, isCheckInDate: isCheckIn, isCheckOutDate: isCheckOut, isMinStayInvalid });
    }

    return days;
  };

  const days = generateCalendarDays(viewYear, viewMonth);

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

  const isToday = (date: number) => {
    return date === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  return (
    <section id="availability" className="py-20 md:py-32 bg-[#FAFAF8]">
      <div className="max-w-xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            Availability
          </p>
          <h2
            className="font-display text-3xl md:text-5xl font-light mb-4"
            style={{ color: "#2C2C2C" }}
          >
            Check Availability
          </h2>
          <p className="text-sm md:text-base max-w-lg mx-auto leading-relaxed" style={{ color: "#6B6B6B" }}>
            Select your preferred dates and the owner will respond within 24 hours.
            Direct bookings save 15–20% over OTA pricing.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E4DF] overflow-hidden max-w-md mx-auto">
          {/* Month nav */}
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: "1px solid #E8E4DF" }}
          >
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#F5F0E8]"
              style={{ border: "none", cursor: "pointer", color: "#6B6B6B" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 3L5 8L10 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h3
              className="font-display text-lg font-light"
              style={{ color: "#2C2C2C" }}
            >
              {monthNames[viewMonth]} {viewYear}
            </h3>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:bg-[#F5F0E8]"
              style={{ border: "none", cursor: "pointer", color: "#6B6B6B" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 3L11 8L6 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Days header */}
          <div className="px-5 pt-4 pb-1">
            <div className="grid grid-cols-7 gap-0">
              {dayLabels.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-medium py-2 uppercase"
                  style={{ color: "#6B6B6B", opacity: 0.5 }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Date cells */}
          <div className="px-5 pb-5 pt-1 relative">
            <div className="grid grid-cols-7 gap-0">
              {days.map((day, idx) => {
                const todayHighlight = isToday(day.date);

                if (!day.isCurrentMonth) {
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-center text-xs py-[10px] rounded-md"
                      style={{ color: "#6B6B6B", opacity: 0.25 }}
                    >
                      {day.date}
                    </div>
                  );
                }

                if (day.isPast) {
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-center text-[13px] py-[10px] rounded-md font-medium"
                      style={{ color: "#6B6B6B", opacity: 0.3, cursor: "default" }}
                    >
                      {day.date}
                    </div>
                  );
                }

                if (day.isMinStayInvalid) {
                  // Can't start a 5-night stay here — grey out, not selectable
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-center text-[13px] py-[10px] rounded-md font-medium"
                      style={{ backgroundColor: "#E0DCD7", color: "#2C2C2C", opacity: 0.5, cursor: "default" }}
                    >
                      {day.date}
                    </div>
                  );
                }

                if (day.isBooked && !day.isCheckOutDate && !day.isCheckInDate) {
                  // Fully booked — light grey
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-center text-[13px] py-[10px] rounded-md font-medium"
                      style={{ backgroundColor: "#E0DCD7", color: "#2C2C2C" }}
                    >
                      {day.date}
                    </div>
                  );
                }

                // Check-out transition day — top-left shaded
                if (day.isCheckOutDate && !day.isBooked) {
                  return (
                    <div
                      key={idx}
                      className="relative flex items-center justify-center text-[13px] py-[10px] rounded-md font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: "#2C2C2C" }}
                    >
                      <div
                        className="absolute inset-0 rounded-md"
                        style={{
                          background: `linear-gradient(to top left, transparent 45%, #E0DCD7 45%)`,
                        }}
                      />
                      <span className="relative z-10">{day.date}</span>
                    </div>
                  );
                }

                // Check-in transition day — bottom-right shaded
                if (day.isCheckInDate && !day.isBooked) {
                  return (
                    <div
                      key={idx}
                      className="relative flex items-center justify-center text-[13px] py-[10px] rounded-md font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: "#2C2C2C" }}
                    >
                      <div
                        className="absolute inset-0 rounded-md"
                        style={{
                          background: `linear-gradient(to bottom right, transparent 45%, #E0DCD7 45%)`,
                        }}
                      />
                      <span className="relative z-10">{day.date}</span>
                    </div>
                  );
                }

                if (todayHighlight) {
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-center text-[13px] py-[10px] rounded-full font-medium"
                      style={{ backgroundColor: "#8B7355", color: "#FFFFFF" }}
                    >
                      {day.date}
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-center text-[13px] py-[10px] rounded-md font-medium hover:bg-[#F5F0E8] transition-colors cursor-pointer"
                    style={{ color: "#2C2C2C" }}
                  >
                    {day.date}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div
          className="mt-6 flex flex-wrap gap-6 text-xs justify-center"
          style={{ color: "#6B6B6B" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#8B7355" }} />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#E0DCD7" }} />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ background: `linear-gradient(to top left, transparent 45%, #E0DCD7 45%)` }} />
            <span>Transition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border border-[#E8E4DF] bg-white" />
            <span>Available</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href="#contact"
            className="inline-block px-8 md:px-10 py-3.5 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
            style={{ backgroundColor: "#8B7355" }}
          >
            Inquire Now
          </a>
        </div>
      </div>
    </section>
  );
}
