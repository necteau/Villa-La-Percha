export default function About() {
  return (
    <section id="about" className="py-14 md:py-24 bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-8 text-center">
        <p className="text-sm tracking-[0.3em] uppercase text-[#8B7355] mb-4 md:mb-6">The Villa</p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-[#2C2C2C] leading-tight text-balance mb-4 md:mb-6">
          A Private Villa in Chalk Sound
        </h2>
        <div className="section-divider mb-6 md:mb-8" />
        <p className="font-body text-[#6B6B6B] text-lg leading-relaxed text-balance max-w-3xl mx-auto">
          Villa La Percha is a private waterfront villa in the quiet Chalk Sound neighborhood of Providenciales,
          positioned between Taylor Bay and Sapodilla Bay. The home features four spacious en-suite suites,
          a fifth half bath off the main living area, a fully equipped kitchen and living room that open completely
          to a screened-in space through massive sliding glass doors, and seamless access to the water, pool, and
          outdoor entertaining areas.
        </p>
        <div className="mt-6 md:mt-8">
          <a
            href="#availability"
            className="inline-block px-8 md:px-10 py-3.5 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
            style={{ backgroundColor: "#8B7355" }}
          >
            Check Availability
          </a>
        </div>
      </div>
    </section>
  );
}
