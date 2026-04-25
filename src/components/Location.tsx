export default function Location() {
  return (
    <section id="location" className="py-28 md:py-40 bg-white">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-sm tracking-[0.3em] uppercase text-[#8B7355] mb-6">Location</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[#2C2C2C] mb-8">
            Chalk Sound, Providenciales
          </h2>
          <div className="section-divider mb-8" />
          <p className="font-body text-[#6B6B6B] leading-relaxed mb-8">
            Villa La Percha is set in the Chalk Sound neighborhood between Taylor Bay and Sapodilla Bay,
            giving you easy access to some of the calmest, prettiest water on Providenciales without being
            stuck in the busier hotel zones.
          </p>
          <p className="font-body text-[#6B6B6B] leading-relaxed">
            Taylor Bay is just a one- to two-minute walk from the driveway, Sapodilla Bay is right nearby,
            and restaurants, groceries, and the rest of the island are all easy to reach by car.
          </p>
        </div>

        {/* Map placeholder — elegant, minimal */}
        <div className="relative rounded-lg overflow-hidden bg-[#F0EDE8] aspect-square md:aspect-auto">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg width="48" height="60" viewBox="0 0 48 60" fill="none" className="mx-auto mb-4 text-[#8B7355]/40">
                <path d="M24 0C13.04 0 4 8.96 4 20c0 15 20 40 20 40s20-25 20-40C44 8.96 34.96 0 24 0z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="24" cy="20" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
              <p className="font-body text-[#6B6B6B]/50 text-sm">
                Chalk Sound<br />Neighborhood
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
