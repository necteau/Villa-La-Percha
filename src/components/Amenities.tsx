const amenities = [
  { label: "65ft Infinity Pool" },
  { label: "5 Bedrooms · 5 Bathrooms" },
  { label: "Direct Ocean Access" },
  { label: "Chalk Sound National Park" },
  { label: "Private Pool &amp; Garden" },
  { label: "Kayaks &amp; Beach Equipment" },
  { label: "Chef&apos;s Kitchen" },
  { label: "Open-Plan Living" },
  { label: "Sunset Views" },
  { label: "6 Weeks Personal Time" },
  { label: "Tropical Landscaping" },
  { label: "Private Beach Shoreline" },
];

export default function Amenities() {
  return (
    <section id="amenities" className="py-28 md:py-40 bg-white">
      <div className="max-w-5xl mx-auto px-8">
        <div className="text-center mb-20">
          <p className="text-sm tracking-[0.3em] uppercase text-[#8B7355] mb-6">Features</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[#2C2C2C]">
            Amenities
          </h2>
          <div className="section-divider mt-10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-16">
          {amenities.map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8B7355] mt-2 flex-shrink-0" />
              <span className="font-body text-[#2C2C2C] text-base">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
