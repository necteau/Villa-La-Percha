import availabilityData from "@/data/availability.json";

interface DayInfo {
  date: number;
  isCurrentMonth: boolean;
  isBooked: boolean;
}

const generateCalendarDays = (year: number, month: number): DayInfo[] => {
  const days: DayInfo[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ date: prevMonthDays - i, isCurrentMonth: false, isBooked: false });
  }

  const currentMonthDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  for (let d = 1; d <= currentMonthDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const reservations = availabilityData.filter(res => dateStr >= res.checkIn && dateStr < res.checkOut);
    days.push({ date: d, isCurrentMonth: true, isBooked: reservations.length > 0 });
  }

  return days;
};

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function AvailabilityCalendar() {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  return (
    <section id="availability" className="py-20 md:py-32" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#8B7355' }}>Availability</p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: '#2C2C2C' }}>
            Check Availability
          </h2>
          <p className="text-sm md:text-base max-w-lg mx-auto leading-relaxed" style={{ color: '#6B6B6B' }}>
            Select your preferred dates and the owner will respond within 24 hours.
            Direct bookings save 15–20% over OTA pricing.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#E8E4DF] overflow-hidden max-w-md mx-auto">
          {/* Month nav bar */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E8E4DF' }}>
            <button
              className="p-1 text-[#6B6B6B]/40 hover:text-[#2C2C2C] transition-colors"
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => alert('← not yet connected to calendar backend')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h3 className="font-display text-lg font-light" style={{ color: '#2C2C2C' }}>
              {monthNames[todayMonth]} {todayYear}
            </h3>
            <button
              className="p-1 text-[#6B6B6B]/40 hover:text-[#2C2C2C] transition-colors"
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => alert('→ not yet connected to calendar backend')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Days */}
          <div className="p-5">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayLabels.map(d => (
                <div key={d} className="text-center text-xs font-medium py-2" style={{ color: '#6B6B6B', opacity: 0.5 }}>
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays(todayYear, todayMonth).map((day, idx) => {
                const isToday = day.isCurrentMonth &&
                  day.date === today.getDate() &&
                  day.month === todayMonth &&
                  day.year === todayYear;

                if (!day.isCurrentMonth) {
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-center text-xs py-3"
                      style={{ color: '#6B6B6B', opacity: 0.2 }}
                    >
                      {day.date}
                    </div>
                  );
                }

                const bgColor = day.isBooked ? '#2C2C2C' : '#F5F0E8';
                const textColor = day.isBooked ? '#FFFFFF' : '#2C2C2C';
                const ringClass = isToday && !day.isBooked ? { border: '1px solid #8B7355' } : {};

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-center text-sm py-3"
                    style={{
                      backgroundColor: bgColor,
                      color: textColor,
                      ...ringClass
                    }}
                  >
                    {day.date}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex flex-wrap gap-8 text-sm justify-center" style={{ borderColor: '#E8E4DF' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E4DF' }} />
            <span style={{ color: '#6B6B6B' }}>Available</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#2C2C2C' }} />
            <span style={{ color: '#6B6B6B' }}>Booked</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#contact"
            className="inline-block px-10 py-4 text-sm tracking-[0.2em] uppercase text-white"
            style={{ backgroundColor: '#8B7355' }}
          >
            Inquire Now
          </a>
        </div>
      </div>
    </section>
  );
}
