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
import Location from "@/components/Location";
import ExperiencePreview from "@/components/ExperiencePreview";
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
      <Location />
      <ExperiencePreview />

      <section id="availability" className="bg-[#FAFAF8] py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6 md:px-8 text-center mb-6 md:mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-3 md:mb-4 text-[#8B7355]">Book Direct</p>
          <h2 className="font-display text-3xl md:text-5xl font-light text-[#2C2C2C] mb-2 md:mb-3">
            Choose dates, review totals, and send your inquiry in one flow
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-[#6B6B6B] leading-relaxed">
            Pick your stay, instantly compare direct pricing vs Airbnb/VRBO, then submit one inquiry without jumping between disconnected sections.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="rounded-[32px] border border-[#E8E4DF] bg-white p-5 md:p-8 shadow-[0_18px_50px_rgba(44,44,44,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 md:gap-8 items-start">
              <div>
                <p className="text-[11px] tracking-[0.24em] uppercase text-[#8B7355] mb-3">Step 1 · Select Dates</p>
                <AvailabilityCalendar
                  checkIn={checkIn}
                  setCheckIn={setCheckIn}
                  checkOut={checkOut}
                  setCheckOut={setCheckOut}
                  embedded
                  showInquiryCta={false}
                />
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[11px] tracking-[0.24em] uppercase text-[#8B7355] mb-3">Step 2 · Compare Totals</p>
                  <PriceComparison checkIn={checkIn} checkOut={checkOut} embedded />
                </div>

                <div>
                  <p className="text-[11px] tracking-[0.24em] uppercase text-[#8B7355] mb-3">Step 3 · Send Inquiry</p>
                  <ContactForm checkIn={checkIn} checkOut={checkOut} embedded />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
