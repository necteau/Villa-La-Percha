"use client";

import { useState } from "react";

type SegmentType = "morning" | "afternoon" | "evening";

interface Activity {
  name: string;
  description: string;
  link?: string;
  time: string;
  label: string;
}

const itineraries: Record<SegmentType, Activity[]> = {
  morning: [
    { name: "Grace Bay Sunrise Swim", description: "Be first on eight miles of the world's best beach. Water so clear it looks photoshopped.", time: "6:30 AM", label: "Beach" },
    { name: "Chalk Sound Kayak", description: "Kayaks by the dock. Glide through pink-sand coves and mangrove tunnels — no drive needed.", time: "7:00 AM", label: "Adventure" },
    { name: "Malcolm's Road Snorkeling", description: "Where the reef wall drops to 6,000 feet. Bring water, sun protection, and a 4x4.", time: "7:30 AM", label: "Dive" },
    { name: "Taylor Bay Paddle", description: "Knee-deep turquoise water, zero crowds. The kind of secret locals guard.", time: "8:00 AM", label: "Beach" },
  ],
  afternoon: [
    { name: "Da Conch Shack", description: "Legendary conch salad. Watch chefs crack fresh conch at outdoor tables. Wednesday = live Junkanoo.", time: "12:30 PM", label: "Dining" },
    { name: "Omar's Beach Hut", description: "Lobster pasta where dinner was swimming this morning. Beachside rum punch.", time: "1:00 PM", label: "Dining" },
    { name: "Pirate's Cove Exploration", description: "Limestone sea stacks, hidden caves, a secret cove. Pirates loved this place.", time: "2:00 PM", label: "Adventure" },
    { name: "CocoVan Airstream Lunch", description: "Gourmet tacos and tapas from an authentic 1974 Airstream in a palm oasis.", time: "12:00 PM", label: "Casual" },
  ],
  evening: [
    { name: "Hemingway's Sunset Dinner", description: "Beachfront patio at The Sands. Surf-and-turf, tropical drinks, legendary sunsets.", time: "6:00 PM", label: "Dining" },
    { name: "Sundog Sunset Sail", description: "Wooden schooner, rum punch, Golden Circle snorkel stop. The quintessential TCI experience.", time: "5:00 PM", label: "Experience" },
    { name: "Infiniti Raw Bar", description: "Oceanfront gourmet seafood and raw bar at Grace Bay Club. Dress code enforced. Milestone-worthy.", time: "7:00 PM", label: "Fine Dining" },
    { name: "Magnolia Hilltop Sunset", description: "Hilltop dining overlooking Turtle Cove Marina. Sunset views + specialty wine list.", time: "6:30 PM", label: "Dining" },
  ],
};

const dayProfiles = [
  { day: "Monday", theme: "Beach Day", icon: "🏖️" },
  { day: "Tuesday", theme: "Adventure Day", icon: "🛶" },
  { day: "Wednesday", theme: "Island Night", icon: "🎶" },
  { day: "Thursday", theme: "Dive Day", icon: "🤿" },
  { day: "Friday", theme: "Fine Dining Night", icon: "🍷" },
  { day: "Saturday", theme: "Island Hopping", icon: "⛵" },
  { day: "Sunday", theme: "Brunch & Relax", icon: "🌅" },
];

export default function ItineraryBuilder() {
  const [segments, setSegments] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const swapSegment = (key: string, optionIndex: number) => {
    setSegments((prev) => ({ ...prev, [key]: optionIndex }));
  };

  const getOption = (type: SegmentType, optionIndex: number) => {
    return itineraries[type][optionIndex % itineraries[type].length];
  };

  const buildSummary = (): string => {
    const parts: string[] = [];
    for (const day of dayProfiles) {
      for (const type of ["morning", "afternoon", "evening"] as SegmentType[]) {
        const key = `${day.day}-${type}`;
        const seg = getOption(type, segments[key] || 0);
        parts.push(`${day.day} ${type}: ${seg.name}`);
      }
    }
    return parts.join("\n");
  };

  return (
    <div className="py-20 md:py-32 bg-[#FAFAF8]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#8B7355" }}>
            Plan Your Week
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-4" style={{ color: "#2C2C2C" }}>
            Build Your Itinerary
          </h2>
          <p className="text-sm md:text-base text-[#6B6B6B] leading-relaxed max-w-xl mx-auto">
            Every day comes with a pre-curated selection — swap any segment for an alternative. 
            When you're happy, hit send and we'll weave it all together.
          </p>
        </div>

        {/* Weekly Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {dayProfiles.map(({ day, theme, icon }) => (
            <div
              key={day}
              className="bg-white border border-[#E8E4DF] rounded-xl p-5 hover:shadow-md hover:border-[#8B7355]/20 transition-all duration-300"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-xs text-[#6B6B6B] tracking-wider uppercase">{day}</p>
              <p className="text-sm font-medium mt-1" style={{ color: "#2C2C2C" }}>{theme}</p>
            </div>
          ))}
        </div>

        {/* Detailed Itinerary */}
        <div className="space-y-16">
          {dayProfiles.map(({ day, icon }) => (
            <div key={day} className="bg-white border border-[#E8E4DF] rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{icon}</span>
                <div>
                  <h3 className="font-display text-xl font-light" style={{ color: "#2C2C2C" }}>{day}</h3>
                  <p className="text-xs text-[#6B6B6B] tracking-wider uppercase">{dayProfiles.find(d => d.day === day)?.theme}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(["morning", "afternoon", "evening"] as SegmentType[]).map((type) => {
                  const key = `${day}-${type}`;
                  const current = getOption(type, segments[key] || 0);
                  const isExpanded = expanded.has(key);

                  return (
                    <div key={type} className="space-y-3">
                      {/* Time Label */}
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          type === "morning" ? "bg-amber-400" : type === "afternoon" ? "bg-teal-400" : "bg-indigo-400"
                        }`} />
                        <span className="text-xs tracking-wider uppercase font-medium" style={{ color: "#8B7355" }}>
                          {current.time} · {current.label}
                        </span>
                      </div>

                      {/* Card */}
                      <div
                        className={`rounded-xl border transition-all duration-300 cursor-pointer ${
                          isExpanded ? "border-[#8B7355] shadow-lg" : "border-[#E8E4DF] shadow-sm hover:shadow-md"
                        }`}
                        onClick={() => toggleExpand(key)}
                      >
                        <div className={`p-5 bg-gradient-to-br ${
                          type === "morning" ? "from-amber-50 to-orange-50" : type === "afternoon" ? "from-teal-50 to-cyan-50" : "from-indigo-50 to-purple-50"
                        }`}>
                          <h4 className="font-display text-lg font-light mb-2" style={{ color: "#2C2C2C" }}>{current.name}</h4>
                          <p className="text-xs text-[#6B6B6B] leading-relaxed">{current.description}</p>
                        </div>
                      </div>

                      {/* Swap Options */}
                      {isExpanded && (
                        <div className="space-y-2">
                          <p className="text-[10px] tracking-wider uppercase font-medium text-[#8B7355]">Swap with:</p>
                          {itineraries[type].map((alt, i) => (
                            <button
                              key={i}
                              onClick={() => swapSegment(key, i)}
                              className={`w-full text-left p-3 rounded-lg border text-sm transition-all duration-300 ${
                                segments[key] === i
                                  ? "border-[#8B7355] bg-[#8B7355]/5"
                                  : "border-[#E8E4DF] hover:border-[#8B7355]/30 hover:bg-[#FAFAF8]"
                              }`}
                            >
                              <span className="font-medium" style={{ color: "#2C2C2C" }}>{alt.name}</span>
                              <span className="text-[10px] text-[#6B6B6B] ml-2">{alt.time}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white border border-[#E8E4DF] rounded-2xl p-8 md:p-12 shadow-sm inline-block">
            <h3 className="font-display text-2xl font-light mb-4" style={{ color: "#2C2C2C" }}>
              Ready for the Island?
            </h3>
            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-md mb-8">
              Hit send and we'll craft your perfect week based on your preferences. 
              No generic templates — just a plan made for you.
            </p>
            <a
              href="/#contact"
              className="inline-block px-8 py-4 text-xs md:text-sm tracking-[0.2em] uppercase text-white font-medium"
              style={{ backgroundColor: "#8B7355" }}
              onClick={(e) => {
                const summary = buildSummary();
                alert(`Your curated week:\n\n${summary}`);
                e.preventDefault();
              }}
            >
              Send Us Your Preferences
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
