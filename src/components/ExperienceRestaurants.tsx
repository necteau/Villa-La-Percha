import Image from "next/image";
import { guideAnchor, restaurants } from "@/data/islandGuide";

export default function Restaurants() {
  return (
    <section className="py-20 md:py-32 bg-white" id="restaurants">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            Choose by Mood
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Restaurants
          </h2>
          <p className="text-sm md:text-base max-w-xl mx-auto text-[#6B6B6B] leading-relaxed">
            The map shows where each dinner or lunch fits into the island. These cards help you decide
            what each place is actually good for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((r) => (
            <article
              key={r.id}
              id={guideAnchor(r.id)}
              className="group scroll-mt-28 border border-[#E8E4DF] rounded-xl overflow-hidden hover:shadow-lg hover:border-[#8B7355]/30 transition-all duration-300 target:ring-2 target:ring-[#8B7355]/40"
            >
              <a href={r.link} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#F5F0E8] to-[#EDE8DF]">
                  {r.image ? (
                    <Image src={r.image} alt={r.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">{r.icon}</div>
                  )}
                </div>
              </a>
              <div className="p-6">
                <span className="text-[10px] tracking-wider uppercase font-medium" style={{ color: "#8B7355" }}>
                  {r.category}
                </span>
                <h3 className="font-display text-xl font-light mt-1 mb-1" style={{ color: "#2C2C2C" }}>
                  {r.name}
                </h3>
                <p className="text-[10px] tracking-wider uppercase text-[#6B6B6B] mb-3">{r.area}</p>
                <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">{r.description}</p>
                {r.mustTry && (
                  <p className="text-sm italic" style={{ color: "#8B7355" }}>
                    Must try: {r.mustTry}
                  </p>
                )}
                <p className="text-[11px] mt-2 uppercase tracking-wider text-[#6B6B6B]">
                  Best for: {r.bestFor ?? r.highlight}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.reservations && (
                    <span className="text-[10px] px-2 py-0.5 inline-block rounded bg-[#F5F0E8] font-medium" style={{ color: "#8B7355" }}>
                      Reservations recommended
                    </span>
                  )}
                  <a href="#island-map" className="text-[10px] px-2 py-0.5 rounded border border-[#E8E4DF] text-[#8B7355] hover:border-[#8B7355]/50">
                    See on map
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
