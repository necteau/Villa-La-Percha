export default function DayAtTheVilla() {
  const day = [
    {
      time: "8:00 AM",
      label: "Wake Up",
      title: "Sunrise over the pool",
      description: "Coffee in hand. The turquoise water stretches to the horizon. No alarms. No crowds. Just the sound of gentle waves.",
      emoji: "🌅",
      color: "from-amber-50 to-orange-50",
    },
    {
      time: "10:00 AM",
      label: "Explore",
      title: "Taylor Bay or a paddle from the dock",
      description: "Walk over to Taylor Bay in a minute or two for calm, shallow water, or launch one of the kayaks or paddle boards from the dock for a morning on the water.",
      emoji: "🛶",
      color: "from-teal-50 to-cyan-50",
    },
    {
      time: "12:30 PM",
      label: "Lunch",
      title: "Chef's kitchen, your table",
      description: "Fresh conch from the Fisherman's Dock. Grilled lobster. A bottle of chilled Provençal wine. The outdoor grill is calling your name.",
      emoji: "🦞",
      color: "from-red-50 to-orange-50",
    },
    {
      time: "2:30 PM",
      label: "Adventure",
      title: "Taylor Bay or Sapodilla Bay",
      description: "Choose your mood: Taylor Bay for quiet, shallow water that is perfect for kids and sunsets, or nearby Sapodilla Bay for a livelier beach scene with music, drinks, and vendors.",
      emoji: "🏖️",
      color: "from-sky-50 to-blue-50",
    },
    {
      time: "6:00 PM",
      label: "Dinner",
      title: "Dock fishing and sunset cocktails",
      description: "Cast a line from the dock for bonefish, yellowtail snapper, or jacks, then head back up for dinner from the outdoor kitchen as the sunset lights up the water.",
      emoji: "🌴",
      color: "from-amber-50 to-yellow-50",
    },
    {
      time: "9:00 PM",
      label: "Nightfall",
      title: "Back at the villa",
      description: "The fire pit is lit. Starlight on the water. The kind of quiet that makes you never want to leave. Tomorrow, we do it all again.",
      emoji: "✨",
      color: "from-indigo-50 to-purple-50",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#8B7355" }}>
            A Perfect Day
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Your Days at Villa La Percha
          </h2>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed max-w-xl mx-auto">
            There&apos;s no itinerary required. But if you want one, here&apos;s the kind of easy,
            sun-soaked day this part of Providenciales does so well.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-[#E8E4DF] md:-translate-x-px" />

          <div className="space-y-12 md:space-y-0">
            {day.map((item, i) => (
              <div
                key={i}
                className={`relative flex flex-col ${
                  i % 2 === 0
                    ? "md:flex-row"
                    : "md:flex-row-reverse"
                } gap-4 md:gap-12`}
              >
                {/* Timeline dot */}
                <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full border-2 border-[#8B7355] bg-white -translate-x-1/2 translate-y-6 md:translate-y-6 z-10" />

                {/* Time label */}
                <div className={`pl-14 md:pl-0 md:w-5/12 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"}`}>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#8B7355" }}>
                    {item.time}
                  </p>
                  <p className="text-xs text-[#6B6B6B] tracking-wider mt-0.5">{item.label}</p>
                </div>

                {/* Content card */}
                <div className={`pl-14 md:pl-0 md:w-5/12 ${i % 2 === 0 ? "md:pl-12" : "md:pr-12 md:text-right"}`}>
                  <div
                    className={`rounded-2xl p-6 bg-gradient-to-br ${item.color} border border-white/50 shadow-sm hover:shadow-md transition-shadow duration-300`}
                  >
                    <div className="text-3xl mb-3">{item.emoji}</div>
                    <h3 className="font-display text-xl font-light mb-2" style={{ color: "#2C2C2C" }}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#6B6B6B] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-14">
          <a
            href="#availability"
            className="inline-block px-8 md:px-10 py-3.5 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
            style={{ backgroundColor: "#8B7355" }}
          >
            Check Availability
          </a>
        </div>
      </div>
    </section>
  );
}
