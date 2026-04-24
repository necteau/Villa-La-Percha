export default function OwnersNote() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase mb-8" style={{ color: "#8B7355" }}>
          From the Owners
        </p>

        <div className="relative">
          {/* Decorative quote marks */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-8xl font-serif text-[#E8E4DF]" style={{ lineHeight: 0 }}>
            &ldquo;
          </div>
        </div>

        <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-10 text-[#2C2C2C]">
          We built Villa La Percha the way we would want our own home to be — not as a property to
          manage, but as a place to return to. Every detail, from the pool to the kitchen to the dock,
          is here because it made our lives better. Now we&apos;d love for yours to be better too.
        </blockquote>

        <div className="w-48 h-px bg-[#E8E4DF] mx-auto mb-8" />

        <div className="space-y-2 text-[#6B6B6B] leading-relaxed">
          <p className="text-sm">
            We didn&apos;t list this on the major platforms because we believe the best vacations
            happen when the people who own the home are the ones welcoming you. No algorithms, no
            automated messages, no check-in kiosk. Just real people who care deeply about making sure
            your time here is perfect.
          </p>
          <p className="text-sm">
            When you book direct, you&apos;re not just saving money — you&apos;re getting the
            experience this villa was always meant to provide. And that starts with a real conversation
            about what you&apos;re looking for.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E8E4DF]">
          <p className="text-base font-medium" style={{ color: "#2C2C2C" }}>
            — The Family Behind Villa La Percha
          </p>
        </div>
      </div>
    </section>
  );
}
