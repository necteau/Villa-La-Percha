const beaches = [
  {
    name: "Grace Bay Beach",
    category: "Classic · Beautiful · Easy Day Trip",
    description: "The island's famous beach for a reason: long white sand, clear water, and easy access to restaurants and resorts. Best when you want a classic Provo beach day with plenty nearby.",
    highlight: "Best for a full classic Grace Bay beach day",
  },
  {
    name: "Malcolm's Road Beach",
    category: "Secluded · Snorkeling · 4x4 Required",
    description: "Remote and worth the effort if you want a wilder beach experience. The road is rough, conditions matter, and it is better for adventurous beachgoers than an easy family outing.",
    highlight: "Best for adventurous snorkeling days, not convenience",
  },
  {
    name: "Northwest Point Marine National Park",
    category: "Nature · Conch Cays · Snorkeling",
    description: "A more natural, less built-up part of the island with protected water, striking scenery, and good exploring if you want to get away from the Grace Bay corridor for a while.",
    highlight: "Best for nature lovers and a quieter outing",
  },
  {
    name: "Taylor Bay Beach",
    category: "Family · Calm Waters · Hidden Gem",
    description: "One of the biggest advantages of staying here. Taylor Bay is a very short walk from the villa and is ideal for calm-water swimming, kids, floating, and sunset without committing to a whole expedition.",
    highlight: "Best for easy family beach time and sunsets close to home",
  },
  {
    name: "West Harbour Bluff (Pirate's Cove)",
    category: "Secluded · Cave · Beach",
    description: "A scenic, less polished outing with rocky coastline, dramatic formations, and a more rugged feel than the island's soft-sand crowd-pleasers. Good for exploring and photos on the right day.",
    highlight: "Best for scenery, exploring, and something different",
  },
  {
    name: "Sapodilla Bay",
    category: "Lively · Family-Friendly · Nearby",
    description: "Close to the villa and usually livelier than Taylor Bay, with shallow water, more people around, and a fun local beach atmosphere. A good choice when you want beach energy instead of total quiet.",
    highlight: "Best for a nearby beach with more action",
  },
];

export default function Beaches() {
  return (
    <section className="py-20 md:py-32 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            The Shores
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Beaches
          </h2>
          <p className="text-sm md:text-base max-w-lg mx-auto text-[#6B6B6B] leading-relaxed">
            These are the beaches most worth knowing from Villa La Percha — including the two that make
            this location especially good.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {beaches.map((b) => (
            <div
              key={b.name}
              className="bg-white rounded-xl border border-[#E8E4DF] overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-56 bg-gradient-to-br from-[#E8F4F8] to-[#D4ECF0] flex items-center justify-center text-6xl">
                🏖️
              </div>
              <div className="p-7">
                <span className="text-[10px] tracking-wider uppercase font-medium" style={{ color: "#8B7355" }}>
                  {b.category}
                </span>
                <h3 className="font-display text-xl font-light mt-1 mb-2" style={{ color: "#2C2C2C" }}>
                  {b.name}
                </h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">{b.description}</p>
                <p className="text-sm italic font-medium" style={{ color: "#8B7355" }}>
                  ✨ {b.highlight}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
