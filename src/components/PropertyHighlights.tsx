import Image from "next/image";

const highlights = [
  {
    title: "Chalk Sound",
    description: "World-famous crystal-clear waters steps from your door. Kayak among 50+ islands and cays.",
    image: "/images/aerial-house-ocean-neighbors.jpg",
  },
  {
    title: "Private Pool",
    description: "65ft meandering infinity pool with tropical landscaping, ambient lighting, and sunset views.",
    image: "/images/aerial-ocean-dock-stairs-pool-house.jpg",
  },
  {
    title: "Direct Ocean Access",
    description: "Your own sandy shoreline with crystal waters — no crowds, no boats, just your private beach.",
    image: "/images/hot-tub-pool-ocean-sapodilla-bay.jpg",
  },
  {
    title: "Full Villa Ownership",
    description: "5 bedrooms, 5 bathrooms, open-plan living, chef's kitchen, and 6 weeks of personal time each year.",
    image: "/images/pool-lounge-ocean.jpg",
  },
];

export default function PropertyHighlights() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-sky-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-sky-600 mb-3">The Estate</p>
          <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-4">
            Where Paradise Becomes Yours
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Villa La Percha isn&apos;t just a vacation rental — it&apos;s a piece of Providenciales you can own.
            Here&apos;s what makes it extraordinary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {highlights.map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            >
              <div className="absolute inset-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-medium text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
