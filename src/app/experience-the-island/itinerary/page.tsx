import Link from "next/link";
import ItineraryBuilder from "@/components/ItineraryBuilder";

export default function ItineraryPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/nighttime-pergola-pool-fire-pit-ocean.jpg)" }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-white/70 mb-4">
            Your Week
          </p>
          <h1 className="font-display text-4xl md:text-7xl font-light text-white mb-6 leading-tight">
            Build Your<br />Itinerary
          </h1>
          <p className="text-white/60 text-sm md:text-lg max-w-lg mx-auto leading-relaxed">
            Pre-curated for every day. Swap segments. Send your picks. We'll make it real.
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

      {/* Itinerary */}
      <ItineraryBuilder />

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#2C2C2C] text-white text-center">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <h2 className="font-display text-3xl md:text-5xl font-light mb-6" style={{ color: "#FFFFFF" }}>
            Ready for the Island?
          </h2>
          <p className="text-white/60 text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto">
            Check availability and we'll weave your picks into a custom plan.
          </p>
          <Link
            href="/#availability"
            className="inline-block px-8 md:px-10 py-3.5 md:py-4 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
            style={{ backgroundColor: "#8B7355" }}
          >
            Check Availability
          </Link>
        </div>
      </section>
    </main>
  );
}
