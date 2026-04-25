import Image from "next/image";

const highlights = [
  {
    title: "Indoor-Outdoor Living",
    description: "The kitchen and living room open fully through massive sliding glass doors to a screened-in space, creating one continuous gathering area for inside and out.",
    image: "/images/screened-living-room-ocean-pool.jpg",
  },
  {
    title: "Pool, Hot Tub & Pergolas",
    description: "A meandering pool, a connected spillover hot tub beneath its own pergola, a gas fire pit seating area, and a separate hammock pergola create multiple places to relax all day and night.",
    image: "/images/pool-lounge-ocean.jpg",
  },
  {
    title: "Dock, Swimming & Water Toys",
    description: "Steps lead from the dock into clear water for swimming. Two kayaks and two stand-up paddle boards are ready to launch right from the house.",
    image: "/images/aerial-ocean-dock-stairs-pool-house.jpg",
  },
  {
    title: "Four En-Suite Suites",
    description: "Four private suites with their own bathrooms, plus a fifth half bath off the main living area, make the layout ideal for couples, families, or groups traveling together.",
    image: "/images/master-suite-balcony-taylor-bay.jpg",
  },
];

export default function PropertyHighlights() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-sky-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-sky-600 mb-3">The Villa</p>
          <h2 className="text-3xl md:text-5xl font-light text-slate-900 mb-4">
            What Makes Villa La Percha Different
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Everything you need for a relaxed, high-end Caribbean stay — without the friction, fees, or impersonal experience of a platform.
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
