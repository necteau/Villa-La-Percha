'use client';

import { useState, useMemo } from 'react';

interface Reservation {
  id: string;
  status: string;
  type: string;
  unit: string;
  bookedDate: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  income: number;
  currency: string;
  isOwnerWeek: boolean;
}

interface AvailabilityCalendarProps {
  availabilityData: Reservation[];
}

export default function AvailabilityCalendar({ availabilityData }: AvailabilityCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const calendarDays = useMemo(() => {
    const days: { date: number; month: number; year: number; isCurrentMonth: boolean; reservations: Reservation[] }[] = [];

    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
    const startDay = new Date(viewYear, viewMonth, 1).getDay();

    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ date: prevMonthDays - i, month: prevMonth, year: prevYear, isCurrentMonth: false, reservations: [] });
    }

    const currentMonthDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= currentMonthDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const reservations = availabilityData.filter(res => dateStr >= res.checkIn && dateStr < res.checkOut);
      days.push({ date: d, month: viewMonth, year: viewYear, isCurrentMonth: true, reservations });
    }

    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let r = 1; r <= remaining; r++) {
        days.push({ date: r, month: viewMonth === 11 ? 0 : viewMonth + 1, year: viewMonth === 11 ? viewYear + 1 : viewYear, isCurrentMonth: false, reservations: [] });
      }
    }

    return days;
  }, [viewMonth, viewYear, availabilityData]);

  const getStatus = (reservations: Reservation[]): string => {
    if (reservations.length === 0) return 'available';
    return 'booked';
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <section className="py-28 md:py-40 bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-8">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-[#8B7355] mb-6">Availability</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[#2C2C2C] mb-6">
            Check Availability
          </h2>
          <p className="font-body text-[#6B6B6B] leading-relaxed max-w-lg mx-auto">
            Select your preferred dates and the owner will respond within 24 hours.
            Direct bookings save 15–20% over OTA pricing.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#E8E4DF] overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-[#E8E4DF]">
            <button onClick={prevMonth} className="text-[#2C2C2C]/40 hover:text-[#2C2C2C] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <h3 className="font-body text-base font-medium text-[#2C2C2C] tracking-wide">
              {monthNames[viewMonth]} {viewYear}
            </h3>
            <button onClick={nextMonth} className="text-[#2C2C2C]/40 hover:text-[#2C2C2C] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Days */}
          <div className="p-8">
            <div className="grid grid-cols-7 gap-y-1">
              {dayLabels.map(d => (
                <div key={d} className="text-center text-xs font-medium text-[#6B6B6B]/60 py-2 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {calendarDays.map((day, idx) => {
                const status = getStatus(day.reservations);
                const isToday = day.isCurrentMonth &&
                  day.date === today.getDate() &&
                  day.month === today.getMonth() &&
                  day.year === today.getFullYear();

                let bgClass = '';
                let borderClass = '';
                let textClass = '';

                if (!day.isCurrentMonth) {
                  textClass = 'text-[#6B6B6B]/30';
                } else if (status === 'available') {
                  bgClass = 'bg-[#F5F0E8]';
                  textClass = 'text-[#2C2C2C]';
                  borderClass = 'border border-[#E8E4DF]/50';
                } else {
                  bgClass = 'bg-[#2C2C2C]';
                  textClass = 'text-white/80';
                }

                return (
                  <div
                    key={idx}
                    className={`
                      min-h-[48px] flex items-center justify-center text-sm
                      transition-colors duration-150
                      ${bgClass}
                      ${isToday && status === 'available' ? 'ring-1 ring-[#8B7355] ring-inset' : ''}
                      ${borderClass}
                      ${textClass}
                    `}
                  >
                    {day.date}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-5 border-t border-[#E8E4DF] flex flex-wrap gap-8 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded bg-[#F5F0E8] border border-[#E8E4DF]" />
                <span className="font-body text-[#6B6B6B]">Available</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded bg-[#2C2C2C]" />
                <span className="font-body text-[#6B6B6B]">Booked</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#contact"
            className="inline-block px-10 py-4 bg-[#8B7355] text-white text-sm tracking-[0.2em] uppercase hover:bg-[#7A6348] transition-colors"
          >
            Check Availability
          </a>
        </div>
      </div>
    </section>
  );
}
