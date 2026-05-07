import type { Metadata } from "next";
import Link from "next/link";
import ItineraryBuilder from "@/components/ItineraryBuilder";

export const metadata: Metadata = {
  title: "Villa La Percha Itinerary | Turks and Caicos Week Planner",
  description:
    "Build a curated Villa La Percha week with morning adventures, lunch ideas, dinner plans, beach time, villa time, and Providenciales island highlights.",
  alternates: {
    canonical: "/villa-la-percha/experience-the-island/itinerary",
  },
  openGraph: {
    title: "Villa La Percha Itinerary | Turks and Caicos Week Planner",
    description:
      "A curated week planner for Villa La Percha guests with varied beach, dining, villa, and island-adventure ideas.",
    url: "/villa-la-percha/experience-the-island/itinerary",
    siteName: "DirectStay",
    type: "website",
    images: [
      {
        url: "/images/nighttime-pergola-pool-fire-pit-ocean.jpg",
        width: 1200,
        height: 630,
        alt: "Villa La Percha pool, pergola, and fire pit at night",
      },
    ],
  },
};

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
          <p className="text-white/70 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            A balanced week of beach mornings, villa time, casual lunches, west-side sunsets, and a few proper nights out — curated so every day does not feel like a copy of the one before.
          </p>
          <div className="flex gap-4 mt-8">
            <Link
              href="/villa-la-percha/experience-the-island"
              className="px-6 py-3 text-xs md:text-sm tracking-[0.2em] uppercase text-white/70 border border-white/30 hover:bg-white hover:text-[#2C2C2C] transition-all duration-500"
            >
              Back
            </Link>
            <Link
              href="/villa-la-percha#availability"
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
            Check availability and we’ll help shape the right version of the week around your group — slower, more adventurous, more food-focused, or all of the above.
          </p>
          <Link
            href="/villa-la-percha#availability"
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
