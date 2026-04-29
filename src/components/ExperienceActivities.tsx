import Image from "next/image";
import { activities, guideAnchor } from "@/data/islandGuide";

export default function Activities() {
  return (
    <section className="py-20 md:py-32 bg-white" id="activities">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            Adventures
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Things to Do
          </h2>
          <p className="text-sm md:text-base max-w-xl mx-auto text-[#6B6B6B] leading-relaxed">
            These are the outings most worth considering once beach time, pool time, and villa time
            are covered. The map gives the geography; this section gives the planning logic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activities.map((a) => (
            <article
              key={a.id}
              id={guideAnchor(a.id)}
              className="group scroll-mt-28 overflow-hidden bg-[#FAFAF8] rounded-xl border border-[#E8E4DF] hover:shadow-lg hover:border-[#8B7355]/30 transition-all duration-300 target:ring-2 target:ring-[#8B7355]/40"
            >
              {a.image ? (
                <div className="relative h-52 w-full overflow-hidden bg-[#E8E4DF]">
                  <Image src={a.image} alt={a.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
              ) : null}
              <div className="p-7">
              <span className="text-[10px] tracking-wider uppercase font-medium" style={{ color: "#8B7355" }}>
                {a.category}
              </span>
              <h3 className="font-display text-xl font-light mt-1 mb-1" style={{ color: "#2C2C2C" }}>
                {a.name}
              </h3>
              <p className="text-[10px] tracking-wider uppercase text-[#6B6B6B] mb-3">{a.area}</p>
              <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">{a.description}</p>
              <p className="text-sm italic font-medium" style={{ color: "#8B7355" }}>
                ✨ {a.highlight}
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
