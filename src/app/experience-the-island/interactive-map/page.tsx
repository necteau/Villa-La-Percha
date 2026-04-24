import Link from "next/link";
import IslandMap from "@/components/IslandMap";

export default function InteractiveMapPage() {
  return (
    <main className="min-h-screen">
      <section className="relative h-[58vh] md:h-[66vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/dock-lounge-chairs-ocean.jpg)" }}
        >
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-white/70 mb-4">
            Navigate Provo
          </p>
          <h1 className="font-display text-4xl md:text-7xl font-light text-white mb-6 leading-tight">
            The Island,<br />At a Glance
          </h1>
          <p className="text-white/70 text-sm md:text-lg max-w-2xl leading-relaxed">
            A handcrafted guide to beaches, dining, and adventures around Villa La Percha.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              href="/experience-the-island"
              className="px-6 py-3 text-xs md:text-sm tracking-[0.2em] uppercase text-white/80 border border-white/30 hover:bg-white hover:text-[#2C2C2C] transition-all duration-500"
            >
              Back
            </Link>
            <Link
              href="/#availability"
              className="px-6 py-3 text-xs md:text-sm tracking-[0.2em] uppercase text-white border border-white/30 hover:bg-white hover:text-[#2C2C2C] transition-all duration-500"
            >
              Check Availability
            </Link>
          </div>
        </div>
      </section>

      <IslandMap />

      <section className="py-20 md:py-28 bg-[#2C2C2C] text-white text-center">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <h2 className="font-display text-3xl md:text-5xl font-light mb-6" style={{ color: "#FFFFFF" }}>
            Build Your Perfect Week
          </h2>
          <p className="text-white/60 text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto">
            Use the map to shortlist favorites, then we'll help shape the rhythm of your stay.
          </p>
          <Link
            href="/#contact"
            className="inline-block px-8 md:px-10 py-3.5 md:py-4 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
            style={{ backgroundColor: "#8B7355" }}
          >
            Start Planning
          </Link>
        </div>
      </section>
    </main>
  );
}
