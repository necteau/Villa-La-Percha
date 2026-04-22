import availabilityData from "@/data/availability.json";

// Generate calendar for a specific month
const generateCalendarDays = (year: number, month: number) => {
  const days: { date: number; month: number; year: number; isCurrentMonth: boolean; status: 'available' | 'booked' }[] = [];

  // Previous month overflow
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ date: prevMonthDays - i, month: prevMonth, year: prevYear, isCurrentMonth: false, status: 'available' });
  }

  // Current month
  const currentMonthDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  for (let d = 1; d <= currentMonthDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const reservations = availabilityData.filter(res => dateStr >= res.checkIn && dateStr < res.checkOut);
    const status = reservations.length > 0 ? 'booked' as const : 'available' as const;
    days.push({ date: d, month: month, year: year, isCurrentMonth: true, status });
  }

  return days;
};

export default function AvailabilityCalendar() {
  const today = new Date();
  const [currentYear, currentMonth] = [today.getFullYear(), today.getMonth()];

  // Generate all months from current month through end of next year
  const monthsToGenerate = [];
  const startYear = currentYear;
  const startMonth = currentMonth;
  const endMonth = 11;
  const endYear = currentYear + 1;

  for (let y = startYear; y <= endYear; y++) {
    const start = y === startYear ? startMonth : 0;
    const end = y === endYear ? endMonth : 11;
    for (let m = start; m <= end; m++) {
      monthsToGenerate.push({ year: y, month: m, days: generateCalendarDays(y, m) });
    }
  }

  return (
    <section id="availability" className="py-20 md:py-32 bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-4">Availability</p>
          <h2 className="font-display text-3xl md:text-5xl font-light text-[#2C2C2C] mb-4">
            Check Availability
          </h2>
          <p className="font-body text-[#6B6B6B] leading-relaxed text-sm md:text-base max-w-lg mx-auto">
            Select your preferred dates and the owner will respond within 24 hours.
            Direct bookings save 15–20% over OTA pricing.
          </p>
        </div>

        <div className="space-y-10">
          {monthsToGenerate.map(({ year, month, days }) => {
            const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            const dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];

            return (
              <div key={`${year}-${month}`}>
                <h3 className="font-display text-xl md:text-2xl font-light text-[#2C2C2C] mb-4">
                  {monthNames[month]} {year}
                </h3>

                {/* Header row */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayLabels.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-[#6B6B6B]/50 py-2">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Date cells */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, idx) => {
                    const isToday = day.isCurrentMonth &&
                      day.date === today.getDate() &&
                      day.month === today.getMonth() &&
                      day.year === today.getFullYear();

                    if (!day.isCurrentMonth) {
                      return (
                        <div key={idx} className="min-h-[44px] md:min-h-[56px] flex items-center justify-center text-xs text-[#6B6B6B]/20">
                          {day.date}
                        </div>
                      );
                    }

                    const bgColor = day.status === 'booked' ? 'bg-[#2C2C2C]' : 'bg-[#F5F0E8]';
                    const textColor = day.status === 'booked' ? 'text-white' : 'text-[#2C2C2C]';
                    const ringClass = isToday && day.status === 'available' ? 'ring-1 ring-[#8B7355] ring-inset' : '';

                    return (
                      <div
                        key={idx}
                        className={`
                          min-h-[44px] md:min-h-[56px] flex items-center justify-center text-sm
                          ${bgColor} ${textColor} ${ringClass}
                        `}
                      >
                        {day.date}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-10 pt-6 border-t border-[#E8E4DF] flex flex-wrap gap-8 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded bg-[#F5F0E8] border border-[#E8E4DF]" />
            <span className="font-body text-[#6B6B6B]">Available</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded bg-[#2C2C2C]" />
            <span className="font-body text-[#6B6B6B]">Booked</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#contact"
            className="inline-block px-10 py-4 bg-[#8B7355] text-white text-sm tracking-[0.2em] uppercase hover:bg-[#7A6348] transition-colors"
          >
            Inquire Now
          </a>
        </div>
      </div>
    </section>
  );
}
