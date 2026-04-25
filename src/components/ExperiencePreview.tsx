import Link from "next/link";

export default function ExperiencePreview() {
  return (
    <section className="py-16 md:py-20 bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="rounded-[32px] border border-[#E8E4DF] bg-white p-8 md:p-12 text-center shadow-sm">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 text-[#8B7355]">Explore Providenciales</p>
          <h2 className="font-display text-3xl md:text-5xl font-light text-[#2C2C2C] mb-4">
            See what to do beyond the villa
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-[#6B6B6B] leading-relaxed">
            The Experience page is a curated guide to the part of Providenciales around Villa La Percha —
            beaches, restaurants, and outings that are actually worth your time while you are here.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/experience-the-island"
              className="inline-block px-8 md:px-10 py-3.5 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
              style={{ backgroundColor: "#8B7355" }}
            >
              Explore the Island Guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
