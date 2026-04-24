import Link from "next/link";
import Restaurants from "@/components/ExperienceRestaurants";
import Beaches from "@/components/ExperienceBeaches";
import Activities from "@/components/ExperienceActivities";

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
            Your private villa is just the beginning. Providenciales offers world-class beaches,
            legendary snorkeling, and the kind of island life that makes you never want to leave.
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
            Situated on the southwest coast near Chalk Sound, Villa La Percha puts you within a short
            drive of everything that makes Providenciales legendary. Grace Bay — consistently ranked
            one of the world's best beaches — is just minutes away. Snorkeling with sea turtles,
            watching the sunset from a beachside bar, diving the Caicos Wall, and eating conch
            straight off the grill are all part of the everyday experience here. Below, we've
            curated our favorites so you don't have to waste time researching.
          </p>

          <div className="mt-10 rounded-2xl border border-[#E8E4DF] bg-white p-7 md:p-8 shadow-[0_12px_35px_rgba(44,44,44,0.06)]">
            <p className="text-[10px] tracking-[0.24em] uppercase mb-3" style={{ color: "#8B7355" }}>
              New Planning Tool
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-light mb-3" style={{ color: "#2C2C2C" }}>
              Explore the Interactive Island Map
            </h2>
            <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed mb-6">
              See where every restaurant, beach, and activity sits relative to Villa La Percha.
            </p>
            <Link
              href="/experience-the-island/interactive-map"
              className="inline-block px-7 md:px-9 py-3 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
              style={{ backgroundColor: "#8B7355" }}
            >
              Open Interactive Map
            </Link>
          </div>
        </div>
      </section>

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
            Book a week at Villa La Percha and experience the best of Providenciales — direct from
            the owner, with no OTA fees.
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
