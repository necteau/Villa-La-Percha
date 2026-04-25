import Link from "next/link";
import Restaurants from "@/components/ExperienceRestaurants";
import Beaches from "@/components/ExperienceBeaches";
import Activities from "@/components/ExperienceActivities";
import IslandMap from "@/components/IslandMap";

export default function ExperiencePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/aerial-ocean-dock-stairs-pool-house.jpg)" }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-white/70 mb-4">
            Discover
          </p>
          <h1 className="font-display text-4xl md:text-7xl font-light text-white mb-6 leading-tight">
            Experience the<br />Island
          </h1>
          <p className="text-white/70 text-sm md:text-lg max-w-lg leading-relaxed">
            Stay near Taylor Bay and Sapodilla Bay, then use this guide to plan the beaches,
            restaurants, and outings that are actually worth your vacation time.
          </p>
          <Link
            href="/"
            className="mt-8 px-8 md:px-10 py-3.5 md:py-4 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium border border-white/30 hover:bg-white hover:text-[#2C2C2C] transition-all duration-500"
          >
            Back to Villa La Percha
          </Link>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 md:py-24 bg-[#FAFAF8]">
        <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
          <div className="section-divider mb-10 mx-auto" />
          <p className="text-sm md:text-base leading-relaxed text-[#6B6B6B]">
            Set in the quiet Chalk Sound neighborhood between Taylor Bay and Sapodilla Bay, Villa La
            Percha gives you easy access to some of the best water, beaches, dining, and day trips on
            Providenciales. Taylor Bay is just a short walk away, Sapodilla Bay is close by, and the
            rest of the island is easy to reach when you want to explore. Below, we&apos;ve curated our
            favorite beaches, restaurants, and activities so you don&apos;t have to waste time researching.
          </p>
        </div>
      </section>

      <IslandMap />

      {/* Restaurants */}
      <Restaurants />

      {/* Beaches */}
      <Beaches />

      {/* Activities */}
      <Activities />

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#2C2C2C] text-white text-center">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <h2 className="font-display text-3xl md:text-5xl font-light mb-6" style={{ color: "#FFFFFF" }}>
            Your Island Awaits
          </h2>
          <p className="text-white/60 text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto">
            Ready to turn all this into an actual trip? Check your dates and reach out directly.
          </p>
          <Link
            href="/#availability"
            className="inline-block px-8 md:px-10 py-3.5 md:py-4 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
            style={{ backgroundColor: "#8B7355" }}
          >
            Check Your Dates
          </Link>
        </div>
      </section>
    </main>
  );
}
