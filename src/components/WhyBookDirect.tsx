export default function WhyBookDirect() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-sky-300 mb-3">Book Direct</p>
          <h2 className="text-3xl md:text-5xl font-light mb-4">
            Why Booking Direct Matters
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
            Our direct-booking pricing is typically 15–30% lower than the total guests would pay through Airbnb or VRBO, with no extra taxes or fees added here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-medium mb-3">Better Total Price</h3>
            <p className="text-white/60 leading-relaxed">
              No 15% platform fees, no cleaning markups, no commissions. Our pricing is typically 15–30% lower than the total guests see on Airbnb or VRBO once all fees are added.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-medium mb-3">Direct Communication</h3>
            <p className="text-white/60 leading-relaxed">
              Ask questions, get honest answers, and plan your stay with a real person. Flexible check-in, personalized recommendations, and support throughout your visit.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-2xl">🏝️</span>
            </div>
            <h3 className="text-xl font-medium mb-3">Cleaner Booking</h3>
            <p className="text-white/60 leading-relaxed">
              No platform friction, no surprise fee stack, no unnecessary noise. Just a straightforward way to secure a beautiful stay.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <a
            href="#contact"
            className="inline-block px-8 py-4 bg-white text-slate-900 font-medium rounded-full hover:bg-sky-50 transition-colors duration-300"
          >
            Contact the Villa Team
          </a>
        </div>
      </div>
    </section>
  );
}
