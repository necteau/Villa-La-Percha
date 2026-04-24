const inclusions = [
  { icon: "🏊", label: "Private Heated Pool" },
  { icon: "🚤", label: "Private Dock" },
  { icon: "🍳", label: "Chef's Kitchen" },
  { icon: "🌊", label: "Ocean Views" },
  { icon: "🍹", label: "Outdoor Bar & Grill" },
  { icon: "🛶", label: "Kayaks Included" },
  { icon: "🛏️", label: "4 Bedrooms, 2 Bathrooms" },
  { icon: "📺", label: "Fast Wi-Fi" },
  { icon: "🅿️", label: "Free Parking" },
  { icon: "🌅", label: "Sunset Deck" },
  { icon: "🔥", label: "Fire Pit" },
  { icon: "🧺", label: "Premium Linens" },
];

export default function PropertyValue() {
  const valuePer = 17500; // estimated total property value

  return (
    <section className="py-20 md:py-32 bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#8B7355" }}>
            More Than a Rental
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            What You&apos;re Really Getting
          </h2>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed max-w-xl mx-auto">
            Villa La Percha isn&apos;t just a place to sleep. It&apos;s a fully equipped private
            resort — and you&apos;re getting all of it, every night.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
          {inclusions.map((item) => (
            <div
              key={item.label}
              className="bg-white border border-[#E8E4DF] rounded-xl p-5 text-center hover:shadow-md hover:border-[#8B7355]/20 transition-all duration-300 group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <p className="text-xs text-[#6B6B6B] leading-snug">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Comparison bar */}
        <div className="bg-white border border-[#E8E4DF] rounded-2xl p-8 md:p-10 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="font-display text-xl font-light" style={{ color: "#2C2C2C" }}>
              The Comparison
            </h3>
            <p className="text-xs text-[#6B6B6B] mt-1">
              What you&apos;d get at a comparable resort vs. your private villa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 rounded-xl overflow-hidden">
            {/* Resort */}
            <div className="p-6 bg-[#F5F0E8]">
              <p className="text-xs uppercase tracking-wider text-[#6B6B6B] mb-4 font-medium">
                Comparable Resort
              </p>
              <div className="space-y-3">
                {[
                  "Shared pool",
                  "No water access",
                  "Small room",
                  "Kitchen fee",
                  "Resort parking ($50/night)",
                  "No outdoor dining",
                  "Crowded grounds",
                  "No sunset views",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                    <span className="text-red-400">✕</span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E4DF]">
                <p className="text-xs text-[#6B6B6B]">From</p>
                <p className="text-3xl font-light" style={{ color: "#2C2C2C" }}>
                  ${valuePer.toLocaleString()}<span className="text-sm text-[#6B6B6B]">/week</span>
                </p>
              </div>
            </div>

            {/* Villa */}
            <div className="p-6 bg-gradient-to-br from-[#8B7355] to-[#A89279]">
              <p className="text-xs uppercase tracking-wider text-white/60 mb-4 font-medium">
                Villa La Percha
              </p>
              <div className="space-y-3">
                {[
                  "Private heated pool",
                  "Private dock access",
                  "Full 4-bed house",
                  "Fully equipped kitchen",
                  "Free parking",
                  "Outdoor bar & grill",
                  "Your own beach access",
                  "Front-row sunset views",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-white/90">
                    <span className="text-white/60">✓</span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-xs text-white/60">From</p>
                <p className="text-3xl font-light text-white">
                  $4,200<span className="text-sm text-white/50">/night</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
