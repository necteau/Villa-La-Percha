import { useState, useCallback } from "react";

export default function DirectBookingCalculator() {
  const price = 4200;
  const [nights, setNights] = useState(7);
  const [visible, setVisible] = useState(false);
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const base = price * nights;
  const direct = base;
  const OTA = Math.round(base * 1.20);
  const cleaning = 350;
  const platformFee = Math.round(base * 0.15);
  const OTAWithCleaning = OTA + cleaning + platformFee;
  const savings = OTAWithCleaning - direct;

  if (!visible) return null;

  return (
    <section className="py-20 md:py-32 bg-white" ref={ref}>
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#8B7355" }}>
            The Math
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            What Stays in Your Pocket<br />When You Book Direct
          </h2>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed max-w-xl mx-auto">
            Adjust the slider to see how much you save by booking Villa La Percha directly
            — no OTA fees, no hidden markups, no middleman.
          </p>
        </div>

        {/* Slider */}
        <div className="mb-16 px-4">
          <div className="flex justify-between text-xs text-[#6B6B6B] mb-3 uppercase tracking-wider font-medium">
            <span>1 night</span>
            <span>14 nights</span>
          </div>
          <input
            type="range"
            min={1}
            max={14}
            value={nights}
            onChange={(e) => setNights(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8B7355 ${(nights - 1) / 13 * 100}%, #E8E4DF ${(nights - 1) / 13 * 100}%)`,
            }}
          />
          <div className="text-center mt-4">
            <span className="text-lg font-medium" style={{ color: "#2C2C2C" }}>
              {nights} {nights === 1 ? "night" : "nights"} × ${price.toLocaleString()} / night
            </span>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-lg">
          {/* OTA Side */}
          <div className="p-8 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm tracking-wider uppercase font-medium text-red-300">
                OTA Platform
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-medium">
                Typical
              </span>
            </div>
            <p className="text-white/40 text-sm mb-8">
              Booking through Airbnb, VRBO, or similar
            </p>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Villa rate ({nights} nights)</span>
                <span>${OTA.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Platform markup (20%)</span>
                <span>+$280</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Platform fee (15%)</span>
                <span>+${platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Cleaning fee</span>
                <span>+$350</span>
              </div>
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-white/60 text-sm uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-light">${OTAWithCleaning.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Side */}
          <div className="p-8 bg-gradient-to-br from-[#8B7355] to-[#A89279] text-white relative">
            <span className="absolute top-4 right-4 text-xs tracking-wider uppercase font-medium bg-white/20 px-3 py-1 rounded-full">
              Best Deal
            </span>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm tracking-wider uppercase font-medium text-white/80">
                Direct Booking
              </span>
            </div>
            <p className="text-white/40 text-sm mb-8">
              Booking directly with Villa La Percha
            </p>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Villa rate ({nights} nights)</span>
                <span>${direct.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Platform markup</span>
                <span className="line-through text-white/30">—</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Platform fee</span>
                <span className="line-through text-white/30">—</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Cleaning fee</span>
                <span className="line-through text-white/30">—</span>
              </div>
              <div className="border-t border-white/20 pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-white/80 text-sm uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-light">${direct.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Callout */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-[#FAFAF8] border border-[#8B7355]/20 rounded-xl px-8 py-5 shadow-sm">
            <p className="text-sm text-[#6B6B6B] uppercase tracking-wider mb-1">
              You Save
            </p>
            <p className="text-4xl md:text-5xl font-light" style={{ color: "#8B7355" }}>
              ${savings.toLocaleString()}
            </p>
            <p className="text-xs text-[#6B6B6B] mt-1">
              That&apos;s {savings >= 500 ? "a" : "a"} {savings >= 1000 ? "free sunset dinner for two" : savings >= 700 ? "day of island adventures" : savings >= 400 ? "beach club afternoon" : "nice bottle of wine"} 🍷
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
