const activities = [
  {
    title: "Snorkel the Caicos Wall",
    category: "Adventure · Diving",
    description: "A strong choice for divers or serious snorkelers who want one of the island's more dramatic marine experiences. This is not the lazy-float option; it is the bigger-adventure option.",
    highlight: "Best for guests who want a true dive or serious snorkel day",
  },
  {
    title: "Pirate's Cove & Split Rock",
    category: "Exploration · History · Photography",
    description: "A fun outing if you like scenic coastal exploring more than sitting still. Go for the rock formations, dramatic shoreline, and a different side of Provo than the resort areas.",
    highlight: "Best for exploring and photos",
  },
  {
    title: "Turtle Watching at Conch Farm",
    category: "Wildlife · Family",
    description: "A family-friendly wildlife stop that usually goes over very well with kids. Good pick when you want something memorable that is not just another beach afternoon.",
    highlight: "Best for families and animal lovers",
  },
  {
    title: "Chalk Sound National Park",
    category: "Nature · Kayaking · Right Next Door",
    description: "One of the advantages of this location is being close to the Chalk Sound area without needing to plan a full excursion. Great for a lower-key day on the water by kayak or paddle board.",
    highlight: "Best for an easy, scenic on-the-water outing",
  },
  {
    title: "Sundog Sail",
    category: "Romance · Sunset · Private Charter",
    description: "A good option if you want one organized sunset excursion during the week. Relaxed, scenic, and easy to enjoy without needing everyone to be intensely adventurous.",
    highlight: "Best for sunset and a low-stress boat outing",
  },
  {
    title: "Dive the Shipwrecks",
    category: "Diving · Wreck Diving",
    description: "For certified divers or more serious underwater people, this is one of the more memorable off-property experiences on the island. Better as a planned activity than a spontaneous same-day idea.",
    highlight: "Best for experienced divers",
  },
  {
    title: "North Caicos Day Trip",
    category: "Island Exploration · Pristine",
    description: "A bigger day out for guests who want to see more than Providenciales. Worth it if your group likes exploring, but probably not necessary if the goal is mostly to relax at the villa and nearby beaches.",
    highlight: "Best for a full-day island adventure",
  },
  {
    title: "Big Game Fishing",
    category: "Fishing · Deep Sea",
    description: "If the dock fishing gets someone in the group excited, this is the bigger version: charter a half-day or full-day trip out of Turtle Cove and make fishing the main event.",
    highlight: "Best for anglers who want the full charter experience",
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
            These are the outings most worth considering once you have beach time, pool time, and villa time covered.
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
