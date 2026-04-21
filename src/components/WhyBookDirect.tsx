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
            Skip the middleman. When you book directly with the owner, everyone wins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-medium mb-3">Save 15–20%</h3>
            <p className="text-white/60 leading-relaxed">
              No 15% platform fees, no cleaning markups, no commissions. The savings go straight into your stay — or back into the villa&apos;s care.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-medium mb-3">Owner Attention</h3>
            <p className="text-white/60 leading-relaxed">
              Direct communication with the owner means personalized recommendations, flexible check-in, and a stay tailored to you — not a checklist.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-2xl">🏝️</span>
            </div>
            <h3 className="text-xl font-medium mb-3">Investment Protection</h3>
            <p className="text-white/60 leading-relaxed">
              Direct bookings fund the villa&apos;s maintenance and upgrades. Your stay helps preserve this estate for future guests — and keeps ownership viable.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <a
            href="#contact"
            className="inline-block px-8 py-4 bg-white text-slate-900 font-medium rounded-full hover:bg-sky-50 transition-colors duration-300"
          >
            Contact the Owner
          </a>
        </div>
      </div>
    </section>
  );
}
