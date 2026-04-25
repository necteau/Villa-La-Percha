const categories = [
  {
    title: "Waterfront & outdoors",
    items: [
      "65ft infinity pool and connected hot tub",
      "Private dock with swimming and water access",
      "2 kayaks + 2 paddle boards ready to launch",
      "Outdoor kitchen, pro grill, pergolas, and fire pit",
      "Dock fishing for bonefish, snapper, and jacks",
    ],
  },
  {
    title: "Living & dining",
    items: [
      "Chef's kitchen for group meals and easy entertaining",
      "Screened indoor-outdoor living that opens fully to the water",
      "Sonos across key indoor and outdoor spaces",
      "Sunset views and tropical landscaping throughout the property",
      "Free parking and fast Wi-Fi included",
    ],
  },
  {
    title: "Bedrooms & layout",
    items: [
      "4 en-suite suites plus 1 half bath",
      "Designed for families, couples, and group trips",
      "Private space for everyone without losing the shared-home feel",
      "Quick access to Taylor Bay and Sapodilla Bay",
      "A quieter Chalk Sound setting that still feels close to everything",
    ],
  },
];

export default function Amenities() {
  return (
    <section id="amenities" className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-sm tracking-[0.3em] uppercase text-[#8B7355] mb-6">Everything Included</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[#2C2C2C]">
            Everything that makes the stay feel easy
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-sm md:text-base text-[#6B6B6B] leading-relaxed">
            Villa La Percha works because the practical details and the memorable parts of the stay live in the same place:
            water access, gathering space, privacy, and the kind of layout that makes group trips feel effortless.
          </p>
          <div className="section-divider mt-8" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category) => (
            <article
              key={category.title}
              className="rounded-[28px] border border-[#E8E4DF] bg-[#FAFAF8] p-7 md:p-8 shadow-sm"
            >
              <h3 className="font-display text-2xl md:text-3xl font-light text-[#2C2C2C]">
                {category.title}
              </h3>
              <ul className="mt-6 space-y-4">
                {category.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm md:text-base text-[#4E4B45] leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#8B7355]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-[32px] border border-[#E8E4DF] bg-[#F5F0E8] p-8 md:p-10 text-center shadow-sm">
          <p className="text-xs tracking-[0.28em] uppercase text-[#8B7355] mb-4">Why it feels different</p>
          <h3 className="font-display text-2xl md:text-4xl font-light text-[#2C2C2C] mb-4">
            This is not just a place to sleep near the beach.
          </h3>
          <p className="max-w-3xl mx-auto text-sm md:text-base text-[#6B6B6B] leading-relaxed">
            You are not piecing together a resort experience from separate rooms, shared amenities, and extra charges.
            You are getting a private villa where the pool, dock, kitchen, outdoor spaces, and group layout are all part
            of the vacation itself.
          </p>
          <div className="mt-8">
            <a
              href="#availability"
              className="inline-block px-8 md:px-10 py-3.5 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
              style={{ backgroundColor: "#8B7355" }}
            >
              Check Availability
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
