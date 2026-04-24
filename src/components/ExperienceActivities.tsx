const activities = [
  {
    title: "Snorkel the Caicos Wall",
    category: "Adventure · Diving",
    description: "The Caicos Wall is a 6,000-foot vertical drop-off starting just offshore at Malcolm's Road. At 50 feet, the seafloor falls into the abyss — and the marine life is extraordinary. Green sea turtles, nurse sharks, eagle rays, and reefs bursting with tropical fish. This is world-class diving and snorkeling at its most dramatic.",
    highlight: "Drop-off from 50 feet to 6,000 feet of deep ocean",
  },
  {
    title: "Pirate's Cove & Split Rock",
    category: "Exploration · History · Photography",
    description: "Visit the dramatic limestone sea stacks, a natural open-faced cave, and the hidden cove that once sheltered Caribbean pirates. Snorkel the adjacent reef, explore the tidal pools, and walk the secluded beach. It's equal parts history, geology, and adventure.",
    highlight: "Pirate-era caves and dramatic sea stacks",
  },
  {
    title: "Turtle Watching at Conch Farm",
    category: "Wildlife · Family",
    description: "A conservation project where you can swim with hundreds of green sea turtles in shallow, warm lagoons. The turtles are wild and the experience is unforgettable. Kids absolutely love it, and it's educational too — learn about conservation efforts protecting these ancient creatures.",
    highlight: "Swim alongside wild green sea turtles",
  },
  {
    title: "Chalk Sound National Park",
    category: "Nature · Kayaking · Right Next Door",
    description: "Right in your backyard. The pink-sand shores and turquoise waters of Chalk Sound are unlike anywhere on earth. Rent kayaks or a paddleboard and explore the maze of tiny islands, mangrove tunnels, and hidden coves. The water is so calm and clear it feels like floating in a mirror.",
    highlight: "Pink sand, turquoise water, hidden coves — steps from the villa",
  },
  {
    title: "Sundog Sail",
    category: "Romance · Sunset · Private Charter",
    description: "A traditional wooden-hulled schooner that sails from Turtle Cove Marina at sunset. Complimentary rum punch, tropical fruit, and hors d'oeuvres. The Golden Circle snorkel stop and sunset cruise is the quintessential Providenciales experience.",
    highlight: "Sunset aboard a wooden schooner with rum punch",
  },
  {
    title: "Dive the Shipwrecks",
    category: "Diving · Wreck Diving",
    description: "Providenciales is a wreck diver's paradise. The SS Amalita, a WWII-era cargo ship, lies just offshore with a clear hull you can walk through. The T-28 wreck is another popular site. Dropped into 60-100 feet of crystal water, these wrecks are encrusted with coral and inhabited by barracuda, sharks, and turtles.",
    highlight: "Walk through the glass hull of a WWII cargo ship",
  },
  {
    title: "North Caicos Day Trip",
    category: "Island Exploration · Pristine",
    description: "Fly or boat over to North Caicos for some of the most untouched beach on the planet. Rum Rock, Long Bay Beach, and the North Caicos National Park offer beaches that look exactly like paradise should. Almost no development, almost no crowds. A true island adventure.",
    highlight: "Untouched beaches and zero crowds",
  },
  {
    title: "Big Game Fishing",
    category: "Fishing · Deep Sea",
    description: "Providenciales sits on the edge of the Grand Bahama Bank — one of the world's premier big-game fishing grounds. Sailfish, wahoo, dorado, marlin, and tuna are all common catches. Full-day or half-day charters available from Turtle Cove Marina with experienced captains.",
    highlight: "World-class sport fishing on the edge of the Grand Bahama Bank",
  },
];

export default function Activities() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#8B7355" }}>
            Adventures
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Things to Do
          </h2>
          <p className="text-sm md:text-base max-w-lg mx-auto text-[#6B6B6B] leading-relaxed">
            Whether you want to dive with turtles, fish for mahi-mahi, or just kayak through the pink sands of Chalk Sound — it's all waiting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activities.map((a) => (
            <div
              key={a.title}
              className="group bg-[#FAFAF8] rounded-xl border border-[#E8E4DF] p-7 hover:shadow-lg hover:border-[#8B7355]/30 transition-all duration-300"
            >
              <span className="text-[10px] tracking-wider uppercase font-medium" style={{ color: "#8B7355" }}>
                {a.category}
              </span>
              <h3 className="font-display text-xl font-light mt-1 mb-2" style={{ color: "#2C2C2C" }}>
                {a.title}
              </h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">{a.description}</p>
              <p className="text-sm italic font-medium" style={{ color: "#8B7355" }}>
                ✨ {a.highlight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
