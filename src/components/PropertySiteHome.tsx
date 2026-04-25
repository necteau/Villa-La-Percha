"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import PropertyHighlights from "@/components/PropertyHighlights";
import Amenities from "@/components/Amenities";
import Gallery from "@/components/Gallery";
import DayAtTheVilla from "@/components/DayAtTheVilla";
import DockFishing from "@/components/DockFishing";
import OwnersNote from "@/components/OwnersNote";
import FAQ from "@/components/FAQ";
import Location from "@/components/Location";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import PriceComparison from "@/components/PriceComparison";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function PropertySiteHome() {
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <PropertyHighlights />
      <Amenities />
      <Gallery />
      <DayAtTheVilla />
      <DockFishing />
      <OwnersNote />
      <FAQ includeStructuredData />
      <Location />

      <section className="bg-[#FAFAF8] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-8 text-center mb-8 md:mb-10">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 text-[#8B7355]">Availability & Pricing</p>
          <h2 className="font-display text-3xl md:text-5xl font-light text-[#2C2C2C] mb-4">
            Check dates, compare pricing, and send your inquiry
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-[#6B6B6B] leading-relaxed">
            Start with your dates, see how direct pricing compares, and then send one inquiry so we can confirm availability and next steps.
          </p>
        </div>
        <AvailabilityCalendar checkIn={checkIn} setCheckIn={setCheckIn} checkOut={checkOut} setCheckOut={setCheckOut} />
        <PriceComparison checkIn={checkIn} checkOut={checkOut} />
        <ContactForm checkIn={checkIn} checkOut={checkOut} />
      </section>

      <Footer />
    </main>
  );
}
