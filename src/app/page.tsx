import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Amenities from "@/components/Amenities";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

// Version: 2026-04-22-1201
export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Amenities />
      <Gallery />
      <AvailabilityCalendar />
      <Location />
      <Contact />
      <Footer />
    </main>
  );
}
