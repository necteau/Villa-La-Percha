import type { Metadata } from "next";
import Link from "next/link";
import FAQ from "@/components/FAQ";

export const metadata: Metadata = {
  title: "Villa La Percha FAQ | Booking, Pricing, Location, and Stay Questions",
  description:
    "Answers to common Villa La Percha questions about direct booking, pricing, location, amenities, beaches, and what to expect during your stay in Providenciales.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <section className="relative overflow-hidden bg-[#1a1a1a] text-white">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-20 md:py-28 text-center">
          <p className="text-xs md:text-sm tracking-[0.35em] uppercase mb-4 text-white/70">
            Villa La Percha
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-light mb-6 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-white/70 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Booking, pricing, location, beaches, amenities, and the practical details guests usually want before they reach out.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-block px-8 md:px-10 py-3.5 md:py-4 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium border border-white/30 hover:bg-white hover:text-[#2C2C2C] transition-all duration-500"
            >
              Back to Villa La Percha
            </Link>
          </div>
        </div>
      </section>

      <FAQ includeStructuredData />

      <section className="pb-20 md:pb-28 text-center px-6 md:px-8">
        <p className="text-sm md:text-base text-[#6B6B6B] max-w-2xl mx-auto leading-relaxed mb-8">
          Still have a question? Choose your preferred dates and send an inquiry directly.
        </p>
        <Link
          href="/#availability"
          className="inline-block px-8 md:px-10 py-3.5 md:py-4 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
          style={{ backgroundColor: "#8B7355" }}
        >
          Check Availability
        </Link>
      </section>
    </main>
  );
}
