import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Amenities from "@/components/Amenities";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import availabilityData from "@/data/availability.json";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Amenities />
      <Gallery />
      <AvailabilityCalendar availabilityData={availabilityData} />
      <Location />
      <Contact />
      <Footer />
    </main>
  );
}
