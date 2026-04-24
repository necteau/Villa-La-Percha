"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import PropertyHighlights from "@/components/PropertyHighlights";
import Amenities from "@/components/Amenities";
import Gallery from "@/components/Gallery";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import DayAtTheVilla from "@/components/DayAtTheVilla";
import PropertyValue from "@/components/PropertyValue";
import PriceComparison from "@/components/PriceComparison";
import OwnersNote from "@/components/OwnersNote";
import Location from "@/components/Location";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

// Version: 2026-04-22-1201
export default function Home() {
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <PropertyHighlights />
      <Amenities />
      <Gallery />
      <AvailabilityCalendar checkIn={checkIn} setCheckIn={setCheckIn} checkOut={checkOut} setCheckOut={setCheckOut} />
      <DayAtTheVilla />
      <PropertyValue />
      <PriceComparison />
      <OwnersNote />
      <Location />
      <ContactForm checkIn={checkIn} checkOut={checkOut} />
      <Footer />
    </main>
  );
}
