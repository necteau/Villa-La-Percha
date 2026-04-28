import Image from "next/image";
import { beaches, guideAnchor } from "@/data/islandGuide";

export default function Beaches() {
  return (
    <section className="py-20 md:py-32 bg-[#FAFAF8]" id="beaches">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            The Shores
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Beaches
          </h2>
          <p className="text-sm md:text-base max-w-xl mx-auto text-[#6B6B6B] leading-relaxed">
            Use the map for distance and orientation, then use these notes to choose the right beach
            for the day you actually want.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {beaches.map((b) => (
            <article
              key={b.id}
              id={guideAnchor(b.id)}
              className="scroll-mt-28 bg-white rounded-xl border border-[#E8E4DF] overflow-hidden hover:shadow-lg transition-shadow duration-300 target:ring-2 target:ring-[#8B7355]/40"
            >
              <div className="relative h-56 bg-gradient-to-br from-[#E8F4F8] to-[#D4ECF0] flex items-center justify-center text-6xl">
                {b.image ? (
                  <Image src={b.image} alt={b.name} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
                ) : (
                  "🏖️"
                )}
              </div>
              <div className="p-7">
                <span className="text-[10px] tracking-wider uppercase font-medium" style={{ color: "#8B7355" }}>
                  {b.category}
                </span>
                <h3 className="font-display text-xl font-light mt-1 mb-2" style={{ color: "#2C2C2C" }}>
                  {b.name}
                </h3>
                <p className="text-[10px] tracking-wider uppercase text-[#6B6B6B] mb-3">{b.area}</p>
                <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">{b.description}</p>
                <p className="text-sm italic font-medium" style={{ color: "#8B7355" }}>
                  ✨ {b.highlight}
                </p>
                <a href="#island-map" className="mt-4 inline-block text-[10px] px-2 py-0.5 rounded border border-[#E8E4DF] text-[#8B7355] hover:border-[#8B7355]/50">
                  See on map
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
