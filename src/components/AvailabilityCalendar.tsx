import availabilityData from "@/data/availability.json";

const generateCalendarDays = (year: number, month: number) => {
  const days: { date: number; month: number; year: number; isCurrentMonth: boolean; isBooked: boolean }[] = [];

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  for (let i = startDay - 1; i >= 0; i--) {
    days.push({ date: prevMonthDays - i, month: prevMonth, year: prevYear, isCurrentMonth: false, isBooked: false });
  }

  const currentMonthDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  for (let d = 1; d <= currentMonthDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const reservations = availabilityData.filter(res => dateStr >= res.checkIn && dateStr < res.checkOut);
    const isBooked = reservations.length > 0;
    days.push({ date: d, month: month, year: year, isCurrentMonth: true, isBooked });
  }

  return days;
};

export default function AvailabilityCalendar() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const monthsToGenerate: { year: number; month: number; days: { date: number; month: number; year: number; isCurrentMonth: boolean; isBooked: boolean }[] }[] = [];
  for (let y = currentYear; y <= currentYear + 1; y++) {
    const start = y === currentYear ? currentMonth : 0;
    const end = y === currentYear + 1 ? 11 : 11;
    for (let m = start; m <= end; m++) {
      monthsToGenerate.push({ year: y, month: m, days: generateCalendarDays(y, m) });
    }
  }

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa'];

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

        <div className="space-y-10">
          {monthsToGenerate.map(({ year, month, days }) => (
            <div key={`${year}-${month}`}>
              <h3 className="font-display text-xl md:text-2xl font-light mb-4" style={{ color: '#2C2C2C' }}>
                {monthNames[month]} {year}
              </h3>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayLabels.map(d => (
                  <div key={d} className="text-center text-xs font-medium py-2" style={{ color: '#6B6B6B', opacity: 0.5 }}>
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const isToday = day.isCurrentMonth &&
                    day.date === today.getDate() &&
                    day.month === today.getMonth() &&
                    day.year === today.getFullYear();

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
          ))}
        </div>

        <div className="mt-10 pt-6 border-t flex flex-wrap gap-8 text-sm" style={{ borderColor: '#E8E4DF' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#F5F0E8', border: '1px solid #E8E4DF' }} />
            <span style={{ color: '#6B6B6B' }}>Available</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#2C2C2C' }} />
            <span style={{ color: '#6B6B6B' }}>Booked</span>
          </div>
        </div>

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
