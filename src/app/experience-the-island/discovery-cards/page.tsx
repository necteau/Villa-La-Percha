import Link from "next/link";
import DiscoveryCards from "@/components/DiscoveryCards";

export default function DiscoveryCardsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/aerial-ocean-dock-stairs-pool-house.jpg)" }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-white/70 mb-4">
            Explore
          </p>
          <h1 className="font-display text-4xl md:text-7xl font-light text-white mb-6 leading-tight">
            Discover<br />Your Island
          </h1>
          <p className="text-white/60 text-sm md:text-lg max-w-lg mx-auto leading-relaxed">
            Swipe through curated experiences. Save what you love — we'll build your perfect week.
          </p>
          <div className="flex gap-4 mt-8">
            <Link
              href="/experience-the-island"
              className="px-6 py-3 text-xs md:text-sm tracking-[0.2em] uppercase text-white/70 border border-white/30 hover:bg-white hover:text-[#2C2C2C] transition-all duration-500"
            >
              Back
            </Link>
            <Link
              href="/#contact"
              className="px-6 py-3 text-xs md:text-sm tracking-[0.2em] uppercase text-white border border-white/30 hover:bg-white hover:text-[#2C2C2C] transition-all duration-500"
            >
              Inquire
            </Link>
          </div>
        </div>
      </section>

      {/* Cards */}
      <DiscoveryCards />

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#2C2C2C] text-white text-center">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <h2 className="font-display text-3xl md:text-5xl font-light mb-6" style={{ color: "#FFFFFF" }}>
            Let Us Plan Your Week
          </h2>
          <p className="text-white/60 text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto">
            Save your favorites, then tell us your preferences. We'll craft a custom itinerary just for you.
          </p>
          <Link
            href="/#contact"
            className="inline-block px-8 md:px-10 py-3.5 md:py-4 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
            style={{ backgroundColor: "#8B7355" }}
          >
            Send Your Preferences
          </Link>
        </div>
      </section>
    </main>
  );
}
