const beaches = [
  {
    name: "Grace Bay Beach",
    category: "The World's Best",
    description: "Often voted the number one beach in the world. Eight miles of powder-soft white sand and water so clear and turquoise it looks photoshopped. The shallow, protected bay is perfect for swimming, and the beachfront restaurant strip along the Grace Bay corridor means you're never far from a good meal.",
    highlight: "Eight miles of uninterrupted Caribbean paradise",
  },
  {
    name: "Malcolm's Road Beach",
    category: "Secluded · Snorkeling · 4x4 Required",
    description: "A remote, rugged stretch of peach-toned sand on the island's far west coast. The reef wall drops off right at the shore, making this one of the Caribbean's top snorkeling spots. The drive out is long and rough — bring water, sun protection, and a 4x4. Watch for Coral Sumac trees and don't leave valuables unattended.",
    highlight: "Dramatic surf and world-class reef-wall snorkeling",
  },
  {
    name: "Northwest Point Marine National Park",
    category: "Nature · Conch Cays · Snorkeling",
    description: "A protected marine park at the island's northwestern tip. Famous for its population of over 300 wild conchs that roam the tidal flats — a sight unique to Providenciales. The western side has calm, shallow snorkeling; the eastern side offers open-ocean surfing and powerful currents. Bring binoculars.",
    highlight: "Hundreds of wild conchs roaming the beach",
  },
  {
    name: "Taylor Bay Beach",
    category: "Family · Calm Waters · Hidden Gem",
    description: "A quiet, crystal-clear bay on the south coast, just minutes from the villa. The water stays knee-to-waist deep for hundreds of yards — perfect for swimming with kids or a peaceful morning paddle. Uncommercialized and uncrowded, this is the kind of secret locals guard closely.",
    highlight: "Knee-deep turquoise water in total serenity",
  },
  {
    name: "West Harbour Bluff (Pirate's Cove)",
    category: "Secluded · Cave · Beach",
    description: "A scenic coastline at the southwest point featuring sea cliffs, a small open-faced cave, and nearly a mile of secluded beach. Historically used by pirates as a hideout, the dramatic limestone formations and clear water make it a photographer's dream. Best visited on a calm day.",
    highlight: "Pirate-era cave and dramatic sea cliffs",
  },
  {
    name: "Sapodilla Bay",
    category: "Beach Bar · Local Vibes · Windsurfing",
    description: "A long stretch of white sand with a lively beach bar scene. The consistent trade winds make it Providenciales' windsurfing spot. The bar serves cold drinks and local food, and the atmosphere is pure Caribbean island — no resort gates, no cover charges, just sand and sea.",
    highlight: "Authentic island bar culture on an endless beach",
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
            Providenciales has over 30 beaches, and nearly every one could be the best beach in the world. Here are ours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {beaches.map((b, i) => (
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
