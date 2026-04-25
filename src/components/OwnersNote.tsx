export default function OwnersNote() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase mb-8" style={{ color: "#8B7355" }}>
          Book Direct
        </p>

        <div className="relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-8xl font-serif text-[#E8E4DF]" style={{ lineHeight: 0 }}>
            &ldquo;
          </div>
        </div>

        <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-10 text-[#2C2C2C]">
          This site is the simplest way to book Villa La Percha directly. Instead of paying the stacked taxes, platform fees, and extra charges that usually come with Airbnb or VRBO, guests here get straightforward pricing and direct communication before and during their stay. The result is a more personal booking experience and a better overall value.
        </blockquote>

        <div className="w-48 h-px bg-[#E8E4DF] mx-auto mb-8" />

        <div className="space-y-2 text-[#6B6B6B] leading-relaxed">
          <p className="text-sm">
            No platform markup, no surprise fees, no unnecessary noise. Just a straightforward way to secure a beautiful stay — with someone you can talk to, not a ticketing system.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E8E4DF]">
          <p className="text-base font-medium" style={{ color: "#2C2C2C" }}>
            — The Villa La Percha Team
          </p>
        </div>
      </div>
    </section>
  );
}
